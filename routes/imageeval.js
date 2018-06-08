/*
*   imageeval.js
*   Router responsible to manage image dr evalutation calls (AJAX)
*/

// Module dependencies
var router = require('express').Router(),
    request = require("request");


// Quality - GET
router.get('/quality', function (req, res) {

    // Python script port
    var request_path = 'http://localhost:' + '5000' + '/qual';

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

    console.log(request_path);

    request(request_path, function (error, response, body) {

        if (!error) {

            console.log('Image quality analysis was successfully!');
            qual_data = JSON.parse(body);

            path = qual_data.path;
            path = path.substr(9, path.length - 1);
            qual_data.path = path;
            console.log(path);
            folder = qual_data.folder
            folder = folder.substr(2, folder.length - 1);
            qual_data.folder = folder;

            res.send(qual_data);

        }
        else {
            console.log(error);
            console.log(response.status);
        }

    })

});


// Return routers
module.exports = router;
