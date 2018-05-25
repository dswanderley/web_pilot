/*
*   pilot.js
*   Router responsible to manage pilot application calls
*/

// Module dependencies
var router = require('express').Router(),
    fs = require('fs');

var galleryDir = 'E:/ScreenDR/Web_Pilot/images/gallery/';

// Upload - GET
router.get('/pilot', function (req, res) {
    res.render('./pilot', {
        title: 'Web Pilot'
    })
});

// Gallery - GET
router.get('/gallery', function (req, res) {


    file_list = [];

    fs.readdir(galleryDir, (err, files) => {

        files.forEach(file => {

            ext = file.substr(file.length - 4, file.length - 1);

            if (ext == '.png') {
                file_list.push(file);
            }
            
        });
        console.log(file_list.length);
        res.send(file_list);
    });    
});


// Return routers
module.exports = router;
