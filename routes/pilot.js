/*
*   pilot.js
*   Router responsible to manage pilot application calls
*/

// Module dependencies
var router = require('express').Router(),
    fs = require('fs');

var galleryDir = './images/gallery/';

// Upload - GET
router.get('/pilot', function (req, res) {
    // Render page Pilot
    res.render('./pilot', {
        title: 'Web Pilot'
    })
});

// Gallery - GET
router.get('/gallery', function (req, res) {
    // Initialize list of files
    file_list = [];
    // Read directory
    fs.readdir(galleryDir, (err, files) => {
        // Load files
        files.forEach(file => {
            // Get extensions 
            ext = file.substr(file.length - 4, file.length - 1);
            // Accpet only png
            if (ext == '.png') {
                file_list.push(file); // add to file list
            }
        });
        // Send list of files
        res.send(file_list);
    });    
});

// Return routers
module.exports = router;
