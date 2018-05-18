/*
*   imgproc.js
*   Router responsible to manage image processing calls (AJAX)
*/

// Module dependencies
var router = require('express').Router(),
    spawn = require("child_process").spawn;


// Process - GET
router.get('/grayscale', function (req, res) {

    filename = req.query.img
    // Parameters passed in spawn -
    // 1. type_of_script
    // 2. list containing Path of the script
    //    and arguments for the script 
    var process = spawn('python', ["./python/grayscale.py",
        filename]);

    // Takes stdout data from script which executed
    // with arguments and send this data to res object
    process.stdout.on('data', function (data) {

        str_data = data.toString();

        console.log(str_data)

        if (str_data.includes(filename)) {
            res.send(str_data);
            console.log(data.toString());
        }
        else {
            console.log('Error')
        }
    })
});


// Return routers
module.exports = router;
