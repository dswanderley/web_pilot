/*
 * Module dependencies
 */
var express = require('express'),
    logger = require('morgan'),
    fileUpload = require('express-fileupload'),
    stylus = require('stylus'),
    nib = require('nib');

// Initialize express instance
var app = express();
// Init stylus
function compile(str, path) {
	return stylus(str)
    .set('filename', path)
    .use(nib())
}
// Define Views path and engines
app.set('views', __dirname + '/views')
app.set('view engine', 'jade')
app.use(logger('dev'))

// Define public directory
app.use(stylus.middleware({ 
    src: __dirname + '/public',
    compile: compile
}))
app.use(express.static(__dirname + '/public'))
// Image uploaded directory
app.use(stylus.middleware({
    src: __dirname + '/images',
    compile: compile
}))
app.use(express.static(__dirname + '/images'))

// Upload routine
app.use(fileUpload());

// Create External Routes

// Index
var index = require('./routes/index');
app.use(index);
// File Upload
var fileupload = require('./routes/fileupload');
app.use(fileupload);
// Image Processing
var imageeval = require('./routes/imageeval');
app.use(imageeval);
// Pilot 
var pilot = require('./routes/pilot');
app.use(pilot);
// Gallery
app.use('/gallery', pilot);

// Deploy
app.listen(3000)