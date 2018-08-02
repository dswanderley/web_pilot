/*
*   canvas.js
*   Router responsible to manage canvas application calls
*/

// Module dependencies
var router = require('express').Router(),
    fs = require('fs');

var galleryDir = './images/gallery/';

// Upload - GET
router.get('/canvas', function (req, res) {
    // Render page Pilot
    res.render('./canvas', {
        title: 'Web Pilot (Canvas)'
    })
});


// Return routers
module.exports = router;
