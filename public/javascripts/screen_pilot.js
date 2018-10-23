// JavaScript source code

var urlBase = "";
var galleryList = [];
var galleryData = [];
var hasQuality = false;
// Images src
var img_orig = "";
var img_idref = 'g_img_';
var galleryURL = 'gallery/';
var currentSrc = "";
var current_idx = "";
// Canvas
var main_img = new Image();
var ctx;
var canvas;
var max_img_height = 256;
var max_img_width = 256;
var canvasScale = 1.0;

/*
 * Load Page functions
 */

function loadScreenDrApp() {
    /** @description Initialize componentes of the application
     */
    $('#res-field-map').css('visibility', 'hidden');
    setEvalBtn();
    setScreenSize();
    addEvents();
    //loadGallery();
}

function setScreenSize() {
    /** @description Defines max image heigh according other page elements
     *  Size of all other elements are predefined.
     */
    var height_header = parseFloat($("header").css("height"));
    var height_footer = parseFloat($("footer").css("height"));
    var height_window = $(window).height();

    var height_body = Math.ceil(height_window - height_header - height_footer);

    var height_breadcrumb = parseFloat($(".breadcrumb").css("height")) + parseInt($(".breadcrumb").css("margin-bottom")) + parseInt($(".breadcrumb").css("margin-top"));
    var padding = 26;

    max_img_height = Math.floor(height_body - height_breadcrumb - padding);
    if (max_img_height < 256)
        max_img_height = 256;

    // Initializes canvas
    initCanvas();
}

function refreshScreenSize() {
    /** @description Refresh main Image Height
     */
    setScreenSize();
    // Set canvas
    setMainImage();
}

function addEvents() {
    /** @description Add Events listener
     */
    // Upload
    document.querySelector('#input-up-img').addEventListener('change', handleFileSelect, false);
    // Canvas
    canvas.addEventListener('mousedown', canvasMouseDown, false);
    canvas.addEventListener('mousemove', canvasMouseMove, false);
    canvas.addEventListener('mouseup', canvasMouseUp, false);
    // IE9, Chrome, Safari, Opera
    canvas.addEventListener("mousewheel", canvasScrollWheel, false);
    // Firefox
    canvas.addEventListener("DOMMouseScroll", canvasScrollWheel, false);
    document.addEventListener('mouseup', pageMouseUp, false);
}

function pageMouseUp(evt) {
    /** @description page Mouse Up event
      * @param {event} evt event
     */
    // Disable canvas image dragging if mouse is off canvas 
    if (dragging) {
        canvasMouseUp(evt);
    }
}



/*
 * Ajax calls
 */

function loadUpGallery() {
    /** @description Load Gallery of images
     */
    $('.loader').show();
    // Load Gallery Div
    var gallery = $('#gallery');
    // Create gallery ul - unordered list
    var el_ul = jQuery('<ul/>', {
        class: 'galery-ul'
    });
    // Gallery URL
    url_g = urlBase + '/gallery';

    // Ajax call
    $.ajax(
        {
            type: 'GET',
            url: url_g,
            data: { id: '0' },
            dataType: 'json',
            cache: false,
            async: true,
            success: function (data) {
                // reset List of images in gallery
                galleryList = [];
                galleryData = data.gallery_list;
                i = 0;
                // Read images in gallery folder
                data.gallery_list.forEach(file => {
                    // Define image ID
                    im_id = img_idref + i;
                    // Create each image element - list item
                    el_ul.append(getGalleryEl(im_id, file.filename));
                    // Add filename to gallery list
                    galleryList.push(file.filename);
                    i += 1;
                });
                // Add list to gallery
                gallery.append(el_ul);
                // Set orginal image block with the first image on gallery
                idx = Math.floor(Math.random() * galleryData.length);
                currentSrc = url_g + '/' + galleryList[idx];
                img_orig = currentSrc;
                current_idx = idx;
                // Set full image 
                setMainImage(currentSrc, galleryData[current_idx].width, galleryData[current_idx].height);
            }
        });
}

function submitImgForm() {
    /** @description Asynchronous submition of the form image
     */
    $('.loader').show();
    var formData = new FormData($('#fileupload')[0]);
    $.ajax({
        url: '/imgupload',
        type: 'POST',
        data: formData,
        success: function (data) {
            loadUpImages(data);
            clearUploadList();
        },
        cache: false,
        contentType: false,
        processData: false
    });

    return false;
}

function loadUpImages(datain) {
    /** @description Get image list of recent upload images
      * @param {obj} datain obj with a list
     */

    // Ajax call
    $.ajax(
        {
            type: 'GET',
            url: '/imgupload',
            data: { data: datain },
            dataType: 'json',
            cache: false,
            async: true,
            success: function (data) {
                // Load data
                var uploadList = data.file_list;
                var uploadData = data.upload_list;
                // Get first image src
                var src = 'upload/' + uploadList[0];
                // set image on canvas
                setMainImage(src, uploadData[0].width, uploadData[0].height);                
            }
        });
}


/*
 * Upload images
 */

function clearUploadList() {
    /** @description Clear upload list body
     */
    $("#upload-tbody").remove();
}

function handleFileSelect(e) {
    /** @description Handle files select to upload
     *  @param {event} e event data
     */

    if (!e.target.files) return;

    // Start body
    if ($('tbody').length === 0) {
        var tbody = document.createElement("tbody");
        tbody.setAttribute("id", "upload-tbody");
    }
    else
        var tbody = document.getElementById("upload-tbody");

    var files = e.target.files;
    for (var i = 0; i < files.length; i++) {
        var f = files[i];
        var fname = adjustNameLength(f.name);
        // handle image
        var newImage = readURL(f);
        newImage.classList.add("upload-thumb");
        // Create list item
        var row = document.createElement("tr");
        row.classList.add("list-group-item");
        row.classList.add("list-group-item-light");
        row.classList.add("list-group-item-upload");
        // Append Image thumbnail
        var td1 = document.createElement("td");
        td1.appendChild(newImage);
        row.appendChild(td1);
        // Append image name
        var td2 = document.createElement("td");
        td2.classList.add("upload-name");
        td2.appendChild(document.createTextNode(fname));
        row.appendChild(td2);
        // Append delete button
        var td3 = document.createElement("td");
        var btn = document.createElement("button");
        btn.innerHTML = "&#10006";
        btn.classList.add("btn"); btn.classList.add("btn-danger"); btn.classList.add("btn-cancel-upload");
        td3.appendChild(btn);
        row.appendChild(td3);
        // Append Row to table
        tbody.appendChild(row);
    }

    // Append on file list
    $("#selected-files").append(tbody);

    var h1 = $('#selected-files').height();
    var h2 = $('tbody').height();

    if (h1 < h2) {
        $('#selected-files').css('overflow-y', 'scroll');
    }
}

function adjustNameLength(fname) {
    /** @description Avoid a large filename to be displayed on the filelist.
     *  @param {string} fname file name
     */
    var max_len = 30;
    var in_pos = Math.floor(max_len / 2);
    var end_pos = fname.length - Math.ceil(max_len / 2) + 3;

    if (fname.length > max_len) {
        var nname = fname.substring(0, in_pos) + '...' + fname.substring(end_pos, fname.length);
        console.log(nname.length);
        return nname;
    }
    return fname;
}

function readURL(infile) {
    /** @description Read image data and convert to image src. Retunr a image object.
     *  @param {obj} infile file object
     */
    var newImage = new Image(30, 30);
    var reader = new FileReader();
    // render image
    reader.onload = function (e) {
        newImage.src = reader.result;
    }
    reader.readAsDataURL(infile);
    // return the new image
    return newImage;
}

/*
 * Set Image
 */

function getGalleryEl(id, img) {
    /** @description Get image element for the gallery
      * @param {string} g_img id
      * @param {string} image name
      * @return {jQuery} list item
     */

    // Create list item
    el_li = jQuery("<li/>", {
        class: "gallery-img",
        onclick: "selectGalleryImage(" + id + ")"
    });
    // Create image element
    el_img = jQuery("<img/>", {
        class: "gallery-thumb",
        id: id,
        height: "64px",
        src: galleryURL + img
    });
    // Add image to list item
    el_li.append(el_img);

    return el_li;
}

function selectGalleryImage(imgid) {
    /** @description Change large image after click on image gallery
      * @param {string} image Image Element Id
     */
    resetimages();
    resetLbl();
    hasQuality = false;
    setEvalBtn();
    // Get image index in JS
    id_str = imgid.id;
    id = id_str.substr(img_idref.length, id_str.length - 1);
    id = parseInt(id);
    current_idx = id;
    // Set main image
    img_orig = imgid.src;
    currentSrc = img_orig;
    setMainImage(currentSrc, galleryData[current_idx].width, galleryData[current_idx].height);
    
}

function setMainImage(src, w, h) {
    /** @description Set original image src
     */

    if (src === null || src === undefined) {
        src = currentSrc;
        w = galleryData[current_idx].width;
        h = galleryData[current_idx].height;
    }

    // Load image on canvas
    main_img = new Image();
    var img_width = w;
    var img_height = h;

    // load canvas
    canvas = document.getElementById("main-canvas");
    // set canvas dimensions
    canvas.width = Math.floor(max_img_width);
    canvas.height = Math.floor(max_img_height);
    // Calculate scale with canvas size
    canvasScale = Math.min(canvas.height / img_height, canvas.width / img_width);
    // Load context
    ctx = canvas.getContext("2d");
    trackTransforms(ctx);
    
    // Calculate scale with canvas size
    canvasScale = Math.min(canvas.height / img_height, canvas.width / img_width);
    // coordinate in the destination canvas at which to place the top-left corner of the source image
    var canvas_dx = (canvas.width - img_width * canvasScale) / 2;
    var canvas_dy = (canvas.height - img_height * canvasScale) / 2;
    //coordinate of the top left corner of the sub-rectangle of the source image to draw into the destination context
    var canvas_cx = 0;
    var canvas_cy = 0;
    // Display image size
    var img_dwidth = canvasScale * img_width;
    var img_dheight = canvasScale * img_height;

    // Clear context
    csizes = new CanvasSizes(canvas_dx, canvas_dy, img_dwidth, img_dheight, canvas_cx, canvas_cy, img_width, img_height);
    // Load Image
    main_img.onload = function () {
        ctx.drawImage(main_img, csizes.cropX, csizes.cropY, csizes.cropW, csizes.cropH, csizes.canvasX, csizes.canvasY, csizes.canvasW, csizes.canvasH);
        $('.loader').hide();
    };
    main_img.src = src;
}


/*
 * Canvas
 */

function initCanvas() {
    /** @description Initialize canvas
      * @param {sting} src 
     */

    // load canvas
    canvas = document.getElementById("main-canvas");
    // set canvas dimensions
    canvas.width = Math.floor(max_img_width);
    canvas.height = Math.floor(max_img_height);
}

function refreshCanvas() {
    /** @description Refresh canvas routine
    */
    // Get new coord
    var p1 = ctx.transformedPoint(0, 0);
    var p2 = ctx.transformedPoint(canvas.width, canvas.height);
    // Crop canvas
    this.ctx.clearRect(p1.x, p1.y, p2.x - p1.x, p2.y - p1.y);
    // Draw image
    this.ctx.drawImage(img, csizes.cropX, csizes.cropY, csizes.cropW, csizes.cropH, csizes.canvasX, csizes.canvasY, csizes.canvasW, csizes.canvasH);
    // Draw objects
    redraw();
}

function resetCanvas() {
    /** @description Reset canvas image to original size
    */
    // Clear transformations
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    // Draw image
    this.ctx.drawImage(img, csizes.cropX, csizes.cropY, csizes.cropW, csizes.cropH, csizes.canvasX, csizes.canvasY, csizes.canvasW, csizes.canvasH);
    // Draw objects
    redraw();
}

function CanvasSizes(x, y, w, h, cX, cY, cW, cH) {
    /** @description Classe with canvas dimensions
      * @param {int} x The x coordinate where to place the image on the canvas
      * @param {int} y The y coordinate where to place the image on the canvas
      * @param {int} w The width of the image to use (stretch or reduce the image)
      * @param {int} h The height of the image to use (stretch or reduce the image)
      * @param {int} cX The x coordinate where to start clipping
      * @param {int} cY The y coordinate where to start clipping
      * @param {int} cW The width of the clipped image
      * @param {int} cH The height of the clipped image
     */

    // x initial position
    if (x !== null && x !== undefined)
        this.canvasX = x;
    else
        this.canvasX = 0;
    // y initial position
    if (y !== null && y !== undefined)
        this.canvasY = y;
    else
        this.canvasY = 0;
    // canvas height - h
    if (h !== null && h !== undefined)
        this.canvasH = h;
    else
        this.canvasH = 100;
    // canvas width - w
    if (w !== null && w !== undefined)
        this.canvasW = w;
    else
        this.canvasW = 100;
    // intial crop postion - x
    if (cX !== null && cX !== undefined)
        this.cropX = cX;
    else
        this.cropX = 0;
    // initial crop postion - y
    if (cY !== null && cY !== undefined)
        this.cropY = cY;
    else
        this.cropY = 0;
    // crop height
    if (cH !== null && cH !== undefined)
        this.cropH = cH;
    else
        this.cropH = 100;
    // crop width
    if (cW !== null && cW !== undefined)
        this.cropW = cW;
    else
        this.cropW = 100;
}

// Canvas controls
var lastX, lastY;
var dragStart = null;
var dragging = false;

function canvasMouseDown(evt) {
    /** @description Canvas Mouse Down event
      * @param {event} evt Button down event
     */

    // Current transformations applied to context
    var c_status = ctx.getTransform();
    // Check if has zoom 
    if (c_status.a > 1) {
        document.body.style.mozUserSelect = document.body.style.webkitUserSelect = document.body.style.userSelect = 'none';

        lastX = evt.offsetX || evt.pageX - canvas.offsetLeft;
        lastY = evt.offsetY || evt.pageY - canvas.offsetTop;
        dragStart = ctx.transformedPoint(lastX, lastY);
        dragging = true;
    }

}

function canvasMouseMove(evt) {
    /** @description Canvas Mouse Move event
      * @param {event} evt event
     */
    if (dragging) {
        // Store mouse position
        lastX = evt.offsetX || evt.pageX - canvas.offsetLeft;
        lastY = evt.offsetY || evt.pageY - canvas.offsetTop;
        var pt = ctx.transformedPoint(lastX, lastY);
        if (dragStart) {
            // Load  context current transformations
            var c_status = ctx.getTransform();
            // Define direction restrictions
            var moveLeft = false, moveRight = false, moveUp = false, moveDown = false;
            if (c_status.e > - canvas.width * c_status.a + canvas.width / 1.2 && lastX < canvas.width) { moveLeft = true; }
            if (c_status.e < canvas.width / c_status.a / 2 && lastX > 0) { moveRight = true; }
            if (c_status.f > - canvas.height * c_status.a + canvas.height / 1.2 && lastY < canvas.height) { moveUp = true; }
            if (c_status.f < canvas.height / c_status.a / 2 && lastY > 0) { moveDown = true; }
            // Moviment direction
            var dx = pt.x - dragStart.x;
            var dy = pt.y - dragStart.y;
            // Check conditions
            if (!moveLeft && dx < 0 || !moveRight && dx > 0) { dx = 0; }
            if (!moveUp && dy < 0 || !moveDown && dy > 0) { dy = 0; }
            // Move image
            ctx.translate(dx, dy);
            redraw(false);
        }
    }
}

function canvasMouseUp(evt) {
    /** @description Canvas Mouse Up event
      * @param {event} evt event
     */

    // Current transformations applied to context
    if (dragging) {
        var c_status = ctx.getTransform();
        if (c_status.a > 1) {
            //  dragStart = null;
            dragging = false;
        }
    }
}

function canvasScrollWheel(evt) {
    /** @description Canvas Mouse Scroll Wheel event
      * @param {event} ev Scroll Wheel event
     */
    lastX = evt.offsetX;
    lastY = evt.offsetY;
    var delta = evt.wheelDelta ? evt.wheelDelta / 40 : evt.detail ? -evt.detail : 0;
    if (delta) canvasZoom(delta, lastX, lastY);
    return evt.preventDefault() && false;
}

function canvasZoom(clicks, mouseX, mouseY) {
    /** @description Set canvas zoom factor
      * @param {float} clicks increase of zoom (positive or negative)
      * @param {int} mouseX mouse x coord over canvas
      * @param {int} mouseY mouse y coord over canvas
     */
    // Factor for zoom
    var scaleFactor = 1.1;
    // Current transformations applied to context
    var c_status = ctx.getTransform();
    // Zoom factor
    var factor = Math.pow(scaleFactor, clicks);
    // New zoom transformation factor
    var tfactor = c_status.a * factor;
    // Apply conditions
    if (tfactor < 1) {
        redraw(true);
    }
    else if (tfactor < 10 * 1 / canvasScale) {
        // Current location
        var pt = ctx.transformedPoint(lastX, lastY);
        // Translate
        ctx.translate(pt.x, pt.y);
        // Scale
        ctx.scale(factor, factor);
        // Translate back with new coord
        ctx.translate(-pt.x, -pt.y);
        // Redraw image
        redraw(false);
    }
}

function redraw(reset) {
    /** @description Redraw canvas
      * @param {bool} reset if true, reset canvas to original size
     */
    if (reset) {
        // Clear transformations
        ctx.setTransform(1, 0, 0, 1, 0, 0);
        // Clear canvas
        ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
    else {
        // Get new coord
        var p1 = ctx.transformedPoint(0, 0);
        var p2 = ctx.transformedPoint(canvas.width, canvas.height);
        // Crop canvas
        ctx.clearRect(p1.x, p1.y, p2.x - p1.x, p2.y - p1.y);
    }
    // Draw Image
    ctx.drawImage(main_img, csizes.cropX, csizes.cropY, csizes.cropW, csizes.cropH, csizes.canvasX, csizes.canvasY, csizes.canvasW, csizes.canvasH);
}


/*
 * Set Results
 */

function resetimages() {
    /** @description Reset image reference src
     */
    img_qual = "";
    img_dr = "";
    $('#res-field-map').css('visibility', 'hidden');
}

function setEvalBtn() {
    /** @description Enable or disable evaluation buttons according quality
     */
    if (hasQuality) {
        $('#btn-dr').removeAttr("disabled").button('refresh');
    }
    else {
        $('#btn-dr').attr("disabled", "disabled");
    }
}

function resetLbl() {
    /** @description Reset labels 
     */
    $('#lbl-res2').text('');
    $('#lbl-res4').text('');
    $('#res-field-qual').css('visibility', 'hidden');
    $('#res-field-dr').css('visibility', 'hidden');
    $('#res-field-map').css('visibility', 'hidden');
    $('#lbl-res2').removeClass("btn-outline-danger");
    $('#lbl-res2').removeClass("btn-outline-success");
    $('#lbl-res4').removeClass("btn-outline-danger");
    $('#lbl-res4').removeClass("btn-outline-success");
}

function toogleBtnClick() {
    /** @description Set main image according button status
     */
    if ($('.onoffswitch2-checkbox').is(":checked")) {

        if (img_dr === "") {
            if (img_qual !== "") {
                currentSrc = img_qual;
                setMainImage();
            }
        }
        else {
            currentSrc = img_dr;
            setMainImage();
        }
    }
    else {
        currentSrc = img_orig;
        setMainImage();
    }
}


/*
 * * SVG
 */

function trackTransforms(ctx) {
    /** @description Canvas transformation control
      * @param {obj} ctx canvas context
     */
    var svg = document.createElementNS("http://www.w3.org/2000/svg", 'svg');
    var xform = svg.createSVGMatrix();
    ctx.getTransform = function () { return xform; };

    var savedTransforms = [];
    var save = ctx.save;
    ctx.save = function () {
        savedTransforms.push(xform.translate(0, 0));
        return save.call(ctx);
    };
    var restore = ctx.restore;
    ctx.restore = function () {
        xform = savedTransforms.pop();
        return restore.call(ctx);
    };

    var scale = ctx.scale;
    ctx.scale = function (sx, sy) {
        xform = xform.scaleNonUniform(sx, sy);
        return scale.call(ctx, sx, sy);
    };
    var rotate = ctx.rotate;
    ctx.rotate = function (radians) {
        xform = xform.rotate(radians * 180 / Math.PI);
        return rotate.call(ctx, radians);
    };
    var translate = ctx.translate;
    ctx.translate = function (dx, dy) {
        xform = xform.translate(dx, dy);
        return translate.call(ctx, dx, dy);
    };
    var transform = ctx.transform;
    ctx.transform = function (a, b, c, d, e, f) {
        var m2 = svg.createSVGMatrix();
        m2.a = a; m2.b = b; m2.c = c; m2.d = d; m2.e = e; m2.f = f;
        xform = xform.multiply(m2);
        return transform.call(ctx, a, b, c, d, e, f);
    };
    var setTransform = ctx.setTransform;
    ctx.setTransform = function (a, b, c, d, e, f) {
        xform.a = a;
        xform.b = b;
        xform.c = c;
        xform.d = d;
        xform.e = e;
        xform.f = f;
        return setTransform.call(ctx, a, b, c, d, e, f);
    };
    var pt = svg.createSVGPoint();
    ctx.transformedPoint = function (x, y) {
        pt.x = x; pt.y = y;
        return pt.matrixTransform(xform.inverse());
    };
}
