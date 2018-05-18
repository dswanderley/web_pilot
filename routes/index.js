/*
*   index.js
*   Router responsible to manage index calls
*/

// Module dependencies
var router = require('express').Router();


// Index - GET
router.get('/', function (req, res) {
    res.render('./index',
        { title: 'Home' }
    )
});


// Return routers
module.exports = router;
