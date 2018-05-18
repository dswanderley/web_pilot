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
uploadDir = 'E:/ScreenDR/Web_Pilot/images/upload/';

// Create route

// External route to index
var index = require('./routes/index');
app.use(index);
// External route to fileupload
var fileupload = require('./routes/fileupload');
app.use(fileupload);
// External route to image processing
var imgproc = require('./routes/imgproc');
app.use(imgproc);

// Deploy
app.listen(3000)