/*
*   pilot.js
*   Router responsible to manage pilot application calls
*/

// Module dependencies
var router = require('express').Router(),
    fs = require('fs'),
    sizeOf = require('image-size');

var galleryDir = './images/gallery/';
var uploadDir = './images/upload/';

// Main application - GET
router.get('/pilot', function (req, res) {
    // Render page Pilot
    res.render('./pilot', {
        title: 'Web Pilot'
    });
});

// Gallery - GET
router.get('/gallery', function (req, res) {
    // Initialize list of files
    let file_list = [];
    let gallery_list = [];
    // Read json file
    var obj = JSON.parse(fs.readFileSync(galleryDir + 'gallery.json', 'utf8'));
    // Read directory
    fs.readdir(galleryDir, (err, files) => {
        // Load files
        files.forEach(file => {
            
            obj.galleryitem.forEach(function (el) {

                if (el.filename === file) {
                    file_list.push(file); // add to file list
                    // Get Dimensions
                    var dimensions = sizeOf(galleryDir + file);
                    el.width = dimensions.width;
                    el.height = dimensions.height;
                    // add file informations 
                    gallery_list.push(el);
                }
            });            
        });
        // Send list of files
        return res.send({file_list, gallery_list});
    });    
});

// Upload - POST
router.post('/imgupload', function (req, res) {

    // Check if has file
    if (!req.files) {
        return res.send('error');
    }

    // The name of the input field (i.e. "sampleFile") is used to retrieve the uploaded file
    let files = req.files.filetoupload;
    var file_list = [];
    
    // Read files
    if (Array.isArray(files)) {
        files.forEach(file => {
            // Filename
            var filename = file.name;
            var path = uploadDir + filename;
            // Json element
            var el = {
                filename: filename,
                src: path
            };
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
        var el = {
            filename: filename,
            src: path
        };
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
    // List of images
    var data_list = req.query.data;
    // Initialize list of files
    let file_list = [];
    let upload_list = [];

    // Read directory
    fs.readdir(uploadDir, (err, files) => {
        
        // Load files
        files.forEach(file => {

            data_list.forEach(function (el) {

                if (el.filename === file) {

                    console.log(file);

                    file_list.push(file); // add to file list
                    // Get Dimensions
                    var dimensions = sizeOf(uploadDir + file);
                    el.width = dimensions.width;
                    el.height = dimensions.height;
                    // add file informations 
                    upload_list.push(el);
                }
            });
        });
        
        // Send list of files
        return res.send({ file_list, upload_list });
    });    
});

// Return routers
module.exports = router;
