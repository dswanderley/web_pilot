/*
*   pilot.js
*   Router responsible to manage pilot application calls
*/

// Module dependencies
var router = require('express').Router(),
    fs = require('fs'),
    sizeOf = require('image-size');

var uploadDir = './images/upload/';

// Main application - GET
router.get('/pilot', function (req, res) {
    // Render page Pilot
    res.render('./pilot', {
        title: 'Web Pilot'
    });
});

// Upload - POST
router.post('/imgupload', function (req, res) {

    // Check if has file
    if (!req.files) {
        return res.send('error');
    }

    /* Handle upload */

    let files = req.files.filetoupload;
    var file_list = [];
    
    // Read and save files
    if (Array.isArray(files)) {
        files.forEach(file => {
            // Filename
            var filename = file.name;
            var path = uploadDir + filename;
            // Json element
            var el = new ImageData(filename, path);
            // move to list
            file_list.push(el);
            // Move each file
            file.mv(path, function (err) {
                if (err) 
                    file_list.pop(); // if does not move pop from list
            });
        });
    }
    else {
        var filename = files.name;
        var path = uploadDir + filename;
        // Json element
        var el = new ImageData(filename, path);
        // move to list
        file_list.push(el);
        // Move each file
        files.mv(path, function (err) {
            if (err)
                file_list.pop(); // if does not move pop from list
        });
    }

    return res.send(file_list);
});


// Upload - GET
router.get('/imgupload', function (req, res) {

    // Check if has file
    if (!req.query.data) {
        return res.send('error');
    }

    // Define JSON file
    var json_path = uploadDir + 'data.json';
    // Check if data.json exist
    if (fs.existsSync(json_path)) {
        // Load JSON file with data
        var data = JSON.parse(fs.readFileSync(json_path, 'utf8'));
    }
    else {
        // Create new empty object
        var data = {
            images: new Array(),
            createTime: new Date(),
            updateTime: new Date()
        }
    }

    // List of images
    var data_list = req.query.data;
    // Initialize list of files
    let file_list = [];
    let upload_list = [];

    // Read directory
    fs.readdir(uploadDir, (err, files) => {
        // Load files
        files.forEach(file => {
            // Read list
            data_list.forEach(function (el) {
                // Compare file and list
                if (el.filename === file) {
                    // add to file list
                    file_list.push(file); 
                    // Get Dimensions
                    var dimensions = sizeOf(uploadDir + file);
                    el.width = dimensions.width;
                    el.height = dimensions.height;
                    // add file informations 
                    upload_list.push(el);
                }
            });
        });    

        // Verify if uploaded files is on filelist
        var images = data.images;
        images.forEach(img => {
            upload_list.forEach(function (uimg, index, object) {
                if (img.filename === uimg.filename) {
                    object.splice(index, 1);
                }
            });
        });
        // Merge lists
        data.images = images.concat(upload_list);
        // Save JSON
        data.updateTime = new Date();
        fs.writeFile(json_path, JSON.stringify(data), (err) => {
            if (err) throw err;
        });

        console.log(upload_list);

        // Send list of files
        return res.send({ file_list, upload_list });
    });    
});


/* Classes */

class ImageData {
    constructor(filename, path) {
        this.filename = filename;
        this.path = path;
        this.width = null;
        this.height = null;
        this.patient = new PatientInfo();
        this.quality = null;
        this.dr = null;
        this.processed = false;
    }
}

class PatientInfo {

}


/* Private Functions */


// Return routers
module.exports = router;
