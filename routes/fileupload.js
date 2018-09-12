/*
*   fileupload.js
*   Router responsible to manage file upload calls
*/

// Module dependencies
var router = require('express').Router();

var uploadDir = 'E:/ScreenDR/Web_Pilot/images/upload/';


// Upload - GET
router.get('/fileupload', function (req, res) {
    res.render('./fileupload', {
        title: 'Upload',
        btnshow: "display:none"
    });
});


// Upload - POST
router.post('/fileupload', function (req, res) {
    // Check if has file
    if (!req.files) {
        res.redirect('back');
        return;
    }

    // The name of the input field (i.e. "sampleFile") is used to retrieve the uploaded file
    let thefile = req.files.filetoupload;
    var filename = thefile.name;

    // Use the mv() method to place the file somewhere on your server
    thefile.mv(uploadDir + filename, function (err) {
        if (err)
            return res.status(500).send(err);
        // Adapt name
        filepath = '/upload/' + filename;
        // Render upload page
        res.render('./fileupload', {
            title: 'Upload',
            imgname: filepath,
            btnshow: "display:block"
        });
    });
});


// Return routers
module.exports = router;
