/*
 * Module dependencies
 */
var express = require('express'),
    stylus = require('stylus'),
    nib = require('nib'),
    fileUpload = require('express-fileupload');
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
app.use(express.logger('dev'))
// Define public directory
app.use(stylus.middleware({ 
	src: __dirname + '/public', compile: compile
}))
app.use(express.static(__dirname + '/public'))
// Image uploaded directory
app.use(stylus.middleware({
    src: __dirname + '/uploaded', compile: compile
}))
app.use(express.static(__dirname + '/uploaded'))
// Upload routine
app.use(fileUpload());
uploadDir = 'E:/ScreenDR/Web_Pilot/uploaded/';

// Create route

// Index - GET
app.get('/', function (req, res) {
    res.render('index',
        { title: 'Home' }
    )
});

// Upload - GET
app.get('/fileupload', function (req, res) {
    res.render('fileupload', {
            title: 'Upload',
            btnshow: "display:none"
        }
    )
});
// Upload - POST
app.post('/fileupload', function (req, res) {
    // Check if has file
    if (!req.files) {
        res.redirect('back')
        return
    }

    // The name of the input field (i.e. "sampleFile") is used to retrieve the uploaded file
    let thefile = req.files.filetoupload;
    var filename = thefile.name;

    // Use the mv() method to place the file somewhere on your server
    thefile.mv(uploadDir + filename, function (err) {
        if (err)
            return res.status(500).send(err);
        // Adapt name
        filepath = '/' + filename
        console.log(filepath)
        // Render upload page
        res.render('fileupload', {
            title: 'Upload',
            imgname: filepath,
            btnshow: "display:block"
        });
    });
});

// Process - GET
app.get('/grayscale', function (req, res) {
    
    var val1 = 'test communication: ';
    // Get request data
    var val2 = req.query.img;
    console.log(val1 + val2)
    // Send processed information
    res.send(val1 + val2)
    
});



// Deploy
app.listen(3000)