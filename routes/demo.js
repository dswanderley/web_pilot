/*
*   pilot.js
*   Router responsible to manage pilot application calls
*/

// Module dependencies
var router = require('express').Router(),
    fs = require('fs'),
    sizeOf = require('image-size');

var galleryDir = './images/gallery/';

// Main application - GET
router.get('/demo', function (req, res) {
    // Render page Pilot
    res.render('./demo', {
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


// Return routers
module.exports = router;
