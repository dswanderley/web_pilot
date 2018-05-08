/*
 * Module dependencies
 */
var express = require('express'),
    stylus = require('stylus'),
    nib = require('nib'),
    fileUpload = require('express-fileupload'),
    spawn = require("child_process").spawn;

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

        if (str_data.includes(filename)) {
            res.send(str_data);
            console.log(data.toString());
        }       
        else {
            console.log('Error')
        }

        
    })
});


// Deploy
app.listen(3000)