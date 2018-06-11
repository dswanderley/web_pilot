/*
*   imageeval.js
*   Router responsible to manage image dr evalutation calls (AJAX)
*/

// Module dependencies
var router = require('express').Router(),
    request = require("request");

var R_PATH = 'http://localhost:' + '5000'

// Quality - GET
router.get('/quality', function (req, res) {

    // Python script port
    var request_path = R_PATH + '/qual';

    // Get filename
    try {
        filename = req.query.img
    }
    catch (err) {
        console.log('Error: No file request');
        return;
    }
    request_path += '?fname=' + filename;

    // Get directory
    try {
        folder = req.query.dir
        request_path += '&folder=' + folder;

    }
    catch (err) {
        console.log(err)
    }
    // Print request
    console.log(request_path);
    // Call request
    request(request_path, function (error, response, body) {

        if (!error) {
            console.log('Image quality analysis was successfully!');
            // Parse json
            qual_data = JSON.parse(body);
            // Prepare path string 
            path = qual_data.path;
            path = path.substr(9, path.length - 1);
            qual_data.path = path;
            // Prepare folder string 
            folder = qual_data.folder
            folder = folder.substr(2, folder.length - 1);
            qual_data.folder = folder;
            // Send data
            res.send(qual_data);
        }
        else {
            console.log(error);
            console.log(response.status);
        }
    });
});


// Diabetic Retinopathy Detection - GET
router.get('/dr_detection', function (req, res) {

    // Python script port
    var request_path = R_PATH + '/dr';

    // Get filename
    try {
        filename = req.query.img
    }
    catch (err) {
        console.log('Error: No file request');
        return;
    }
    request_path += '?fname=' + filename;

    // Get directory
    try {
        folder = req.query.dir
        request_path += '&folder=' + folder;

    }
    catch (err) {
        console.log(err)
    }
    // Print request
    console.log(request_path);
    // Call request
    request(request_path, function (error, response, body) {

        if (!error) {
            console.log('Image quality analysis was successfully!');
            // Parse json
            dr_data = JSON.parse(body);
            // Prepare path string 
            path = dr_data.path;
            path = path.substr(9, path.length - 1);
            dr_data.path = path;
            // Prepare folder string 
            folder = dr_data.folder
            folder = folder.substr(2, folder.length - 1);
            dr_data.folder = folder;
            // Send data
            res.send(dr_data);
        }
        else {
            console.log(error);
            console.log(response.status);
        }
    });
});



// Return routers
module.exports = router;
