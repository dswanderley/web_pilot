/*
 * Module dependencies
 */
var express = require('express'),
    stylus = require('stylus'),
    nib = require('nib'),
    formidable = require('formidable')
    fileUpload = require('express-fileupload');
    
var app = express(),
    fs = require('fs');

function compile(str, path) {
	return stylus(str)
    .set('filename', path)
    .use(nib())
}

app.set('views', __dirname + '/views')
app.set('view engine', 'jade')
app.use(express.logger('dev'))
// Public directory
app.use(stylus.middleware({ 
	src: __dirname + '/public', compile: compile
}))
app.use(express.static(__dirname + '/public'))

// Image uploaded directory
app.use(stylus.middleware({
    src: __dirname + '/uploaded', compile: compile
}))
app.use(express.static(__dirname + '/uploaded'))
//var publicDir = require('path').join(__dirname, '/uploaded');
//app.use(express.static(publicDir));

// Upload routine
app.use(fileUpload());



// Create route

// Index
app.get('/', function (req, res) {
  res.render('index',
  { title : 'Home' }
  )
})

// Test
app.get('/test', function (req, res) {
    res.render('test',
        { title: 'Test' }
    )
})

uploadDir = 'E:/ScreenDR/Web_Pilot/uploaded/';


app.post('/fileupload', function (req, res) {


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

        filepath = '/' + filename
        console.log(filepath)

        res.render('test', {
            title: 'Upload',
            imgname: filepath
        });
    });

})

app.get('/fileupload/', function (req, res) {

    //var imgname = req.params.imgname;

    console.log('Test');
    res.render('test',
        { title: 'Test' }
    )
})

// Deploy
app.listen(3000)