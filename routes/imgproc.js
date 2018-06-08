/*
*   imgproc.js
*   Router responsible to manage image processing calls (AJAX)
*/

// Module dependencies
var router = require('express').Router(),
    spawn = require("child_process").spawn,
    request = require("request");


// Process - GET
router.get('/grayscale', function (req, res) {
    
    // List of args
    args = [];
    // Python script
    pyfile = "./python/grayscale.py";
    args.push(pyfile);
    // Get filename
    try {
        filename = req.query.img
    }
    catch (err) {
        console.log('Error: No file request');
        return;
    }
    args.push(filename);
    // Get directory
    try {
        folder = req.query.dir
        args.push(folder);
        var process = spawn('python', [pyfile, filename, folder]);
    }
    catch (err) {
        var process = spawn('python', [pyfile, filename]);
    }
    
    // Takes stdout data from script which executed
    // with arguments and send this data to res object
    process.stdout.on('data', function (data) {
        // Get string data (processed image path)
        str_data = data.toString();
        // Send filename to client side
        if (str_data.includes(filename)) {
            res.send(str_data);
            console.log('Image grayscale conversion successfully!');
        }
        else {
            console.log('Error returned.');
        }
    })
});


// Return routers
module.exports = router;
