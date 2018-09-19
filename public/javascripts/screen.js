// JavaScript source code

var urlBase = "";
var galleryList = [];
var galleryData = [];
var hasQuality = false;
// Images src
var img_orig = "";
var img_qual = "";
var img_dr = "";
var img_idref = 'g_img_';
var galleryURL = 'gallery/';
var currentSrc = "";
var current_idx = "";
// Eg Lists
var qList_high = [];
var qList_low = [];
var drList_r0 = [];
var drList_r1 = [];
var drList_r2 = [];
var drList_r3 = [];
var drList_rx = [];
var selectedEg = 'RX';
var eg_list = [];
var ex_idx = -1;
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
    loadGallery();
    initExamples();
}

function initExamples() {
    /** @description Set example buttons and images
     */
    clearBtnQualEg();
    clearBtnDrEg();
}

function setScreenSize() {
    /** @description Defines max image heigh according other page elements
     *  Size of all other elements are predefined.
     */
    height_header = 76;
    height_footer = 115;
    height_window = $(window).height();

    height_body = height_window - height_header - height_footer;

    height_gallery = 86 + 15 + 20;
    height_breadcrumb = 19 + 12 + 12 + 16;
    padding_image = 5 + 5;

    max_img_height = height_body - height_gallery - height_breadcrumb - padding_image - 3;
    if (max_img_height < 256)
        max_img_height = 256;

    max_img_width = $('#gallery').width();
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

function loadGallery() {
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
                    // Quality List
                    switch (file.quality) {
                        case 'High':
                            qList_high.push({ idx: i, filename: file.filename });
                            break;
                        default:
                            qList_low.push({ idx: i, filename: file.filename });
                    }
                    switch (file.grading) {
                        case 'R0':
                            drList_r0.push({ idx: i, filename: file.filename });
                            break;
                        case 'R1':
                            drList_r1.push({ idx: i, filename: file.filename });
                            break;
                        case 'R2':
                            drList_r2.push({ idx: i, filename: file.filename });
                            break;
                        case 'R3':
                            drList_r3.push({ idx: i, filename: file.filename });
                            break;
                        default:
                            drList_rx.push({ idx: i, filename: file.filename });
                    }
                    i += 1;
                });
                // Add list to gallery
                gallery.append(el_ul);
                // Set orginal image block with the first image on gallery
                idx = Math.floor(Math.random() * galleryData.length);
                currentSrc = url_g + '/' + galleryList[idx];
                img_orig = currentSrc;
                current_idx = idx;
                // Load Example
                setImgEg(idx);
                // Set full image 
                setMainImage(currentSrc, galleryData[current_idx].width, galleryData[current_idx].height);
            }
        });
}

function quality() {
    /** @description Call image Quality. Evaluate displayed image.
     */
    // Read image filename
    $('.loader').show();
    var currentSrc = img_orig;
    var str_list = currentSrc.split('/');
    img = str_list[str_list.length - 1];
    folder = str_list[str_list.length - 2];
    // Ajax call
    $.ajax(
        {
            type: 'GET',
            url: urlBase + '/quality',
            data: {
                dir: folder,
                img: img
            },
            dataType: 'json',
            cache: false,
            async: true,
            success: function (data) {
                // Convert data to JSON
                qual_data = data;
                // Print results
                $('#res-field-qual').css('visibility', 'visible');
                //$('#lbl-res1').text('Percentage: ' + Math.round(qual_data.q_pred) + '% ');
                $('#lbl-res2').text(qual_data.qual);

                console.log("Quality: " + qual_data.qual);
                console.log("Prediction Val.: " + qual_data.q_pred);
                // Get image path and URL
                path = qual_data.path;
                if (qual_data.q_pred <= 50) {
                    // Quality flag
                    hasQuality = false;
                    // Partial cases
                    if (qual_data.q_pred > 25) {
                        hasQuality = true;
                    }
                    //  Image src
                    img_qual = path;
                    currentSrc = img_qual;
                    // Set full image 
                    setMainImage(currentSrc, galleryData[current_idx].width, galleryData[current_idx].height);
                    // Set css attributes
                    $('#img-disp').attr('height', '256px');
                    $('#lbl-res2').addClass("btn-outline-danger");
                    $('#res-field-map').css('visibility', 'visible');
                    $('.onoffswitch2-checkbox').prop('checked', true);
                    $('#res-field-map').css('visibility', 'visible');
                    $('#lbl-res5').text('Quality Map');
                }
                else {
                    hasQuality = true;
                    $('#lbl-res2').addClass("btn-outline-success");
                    $('#res-field-map').css('visibility', 'hidden');
                    $('.loader').hide();
                }
                // Block or allow Btn
                setEvalBtn();
            }
        });
}

function dr_detection() {
    /** @description Call DR detection. Process displayed image.
     */
    $('.loader').show();
    // Read image filename
    var currentSrc = img_orig;
    var str_list = currentSrc.split('/');
    img = str_list[str_list.length - 1];
    folder = str_list[str_list.length - 2];
    // Ajax call
    $.ajax(
        {
            type: 'GET',
            url: urlBase + '/dr_detection',
            data: {
                dir: folder,
                img: img
            },
            dataType: 'json',
            cache: false,
            async: true,
            success: function (data) {
                // Convert data to JSON
                dr_data = data;
                // Print results
                $('#res-field-dr').css('visibility', 'visible');
                //$('#lbl-res3').text('Percentage: ' + Math.round(dr_data.dr_pred) + '% ');
                $('#lbl-res4').text(dr_data.dr);

                console.log("Disease: " + dr_data.dr);
                console.log("Prediction Val.: " + dr_data.dr_pred);
                // Get image path and URL
                path = dr_data.path;
                if (dr_data.dr_pred > 50) {
                    // Image src
                    img_dr = path;
                    currentSrc = img_dr;
                    // Set full image 
                    setMainImage(currentSrc, galleryData[current_idx].width, galleryData[current_idx].height);
                    // Set css attributes
                    $('#img-disp').attr('height', '256px');
                    $('#lbl-res4').addClass("btn-outline-danger");
                    $('#res-field-map').css('visibility', 'visible');
                    $('.onoffswitch2-checkbox').prop('checked', true);
                    $('#lbl-res5').text('Detection Map');
                }
                else {
                    $('#lbl-res4').addClass("btn-outline-success");
                    $('#res-field-map').css('visibility', 'hidden');
                    $('.loader').hide();
                }
            }
        });
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
    setMainImage();
    // Set example
    setImgEg(id);
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
    // Set example
    setImgEg(id);
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
 * Set Examples
 */

function setImgEg(id) {
    /** @description Initiate example image with a R0 image
     * @param {int} id Image gallery id
     */
    // Set example
    imgInfo = galleryData[id];
    // URL
    setEgImg(galleryURL + imgInfo.filename);
    // Grading
    changeDrEg(imgInfo.grading);
    // Quality
    changeQualEg(imgInfo.quality);
    // Counter
    selectedEg = imgInfo.grading;
    setEgData(id);
}

function setImgQualEg(click_id) {
    /** @description Set image of quality image example
     * @param {string} image src
     */
    if (click_id === 'btn-qual-high') {
        qual = 'High';
        eg_list = qList_high;
    }
    else {
        qual = 'Low';
        eg_list = qList_low;
    }
    // Check if click on same button
    if (qual === selectedEg)
        return;
    // Change selected example class
    selectedEg = qual;
    // Pick an index
    var id = Math.floor(Math.random() * eg_list.length);
    // Create an auxiliary list starting by the sorted index
    var src = src = galleryURL + eg_list[id].filename;
    setEgImg(src);
    setEgCounter(id);
    // Global index
    var idx = eg_list[id].idx;
    // Change quality
    changeDrEg(galleryData[idx].grading);
}

function setImgDrEg(click_id) {
    /** @description Set image of DR image example
     * @param {string} image src
     */

    // Verify the selected gradding
    switch (click_id) {
        case 'btn-dr-r0':
            grad = 'R0';
            eg_list = drList_r0;
            break;
        case 'btn-dr-r1':
            grad = 'R1';
            eg_list = drList_r1;
            break;
        case 'btn-dr-r2':
            grad = 'R2';
            eg_list = drList_r2;
            break;
        case 'btn-dr-r3':
            grad = 'R3';
            eg_list = drList_r3;
            break;
        default:
            grad = 'RX';
            eg_list = drList_rx;
    }
    // Check if click on same button
    if (grad === selectedEg)
        return;
    // Change selected example class
    selectedEg = grad;
    // Pick an index
    var id = Math.floor(Math.random() * eg_list.length);
    // Create an auxiliary list starting by the sorted index
    var src = src = galleryURL + eg_list[id].filename;
    setEgImg(src);
    setEgCounter(id);
    // Global index
    var idx = eg_list[id].idx;
    // Change quality
    changeQualEg(galleryData[idx].quality);
}

function setEgImg(src) {
    /** @description Set image of image example
    * @param {string} image src
    */
    // Check list of images (small and larg)
    el_im_list = $('#eg-img-zoom').find($("img"));
    for (i = 0; i < el_im_list.length; i++) {
        if (el_im_list[i].id !== "img-eg-dr")
            // Remove large image
            el_im_list[i].remove();
    }
    // change small image
    $('#img-eg-dr')[0].src = src;
    // add zoom functionality and large image
    $('#eg-img-zoom').zoom({ on: 'grab' });
}

function setEg(btn) {
    /** @description Manage the example buttons 
    * @param {obj} Button
    */
    // Avoid double click
    if ($('#' + btn.id).hasClass('focus'))
        return;
    // Clear buttons
    clearBtnDrEg();
    clearBtnQualEg();
    // Check if button is dr or quality
    if (btn.id.includes('dr')) {
        setImgDrEg(btn.id);
    }
    else {
        setImgQualEg(btn.id);
    }   
    // Manage classes
    $('#' + btn.id).removeClass('btn-outline-light');
    $('#' + btn.id).addClass('btn-light');
    $('#' + btn.id).addClass('focus');
}

function changeQualEg(qual) {
    /** @description Change quality example button 
    * @param {string} quality
     */
    switch (qual) {
        case 'High':
            btn_q_id = '#btn-qual-high';
            break;
        default:
            btn_q_id = '#btn-qual-low';
    }
    $(btn_q_id).removeClass('btn-outline-light');
    $(btn_q_id).addClass('btn-light');
}

function changeDrEg(grad) {
    /** @description Change quality example button 
    * @param {string} grading
     */
    switch (grad) {
        case 'R0':
            btn_rd_id = '#btn-dr-r0';
            break;
        case 'R1':
            btn_rd_id = '#btn-dr-r1';
            break;
        case 'R2':
            btn_rd_id = '#btn-dr-r2';
            break;
        case 'R3':
            btn_rd_id = '#btn-dr-r3';
            break;
        default:
            btn_rd_id = '#btn-dr-rx';
    }
    $(btn_rd_id).removeClass('btn-outline-light');
    $(btn_rd_id).addClass('btn-light');
}

function clearBtnQualEg() {
    /** @description Remove classes from Quality Examples Buttons
    */
    $('#btn-qual-high').removeClass('focus');
    $('#btn-qual-low').removeClass('focus');
    
    $('#btn-qual-high').removeClass('btn-light');
    $('#btn-qual-low').removeClass('btn-light');

    $('#btn-qual-high').addClass('btn-outline-light');
    $('#btn-qual-low').addClass('btn-outline-light');
}

function clearBtnDrEg() {
    /** @description Remove classes from DR Examples Buttons
    */
    $('#btn-dr-r0').removeClass('focus');
    $('#btn-dr-r1').removeClass('focus');
    $('#btn-dr-r2').removeClass('focus');
    $('#btn-dr-r3').removeClass('focus');
    $('#btn-dr-rx').removeClass('focus');

    $('#btn-dr-r0').removeClass('btn-light');
    $('#btn-dr-r1').removeClass('btn-light');
    $('#btn-dr-r2').removeClass('btn-light');
    $('#btn-dr-r3').removeClass('btn-light');
    $('#btn-dr-rx').removeClass('btn-light');

    $('#btn-dr-r0').addClass('btn-outline-light');
    $('#btn-dr-r1').addClass('btn-outline-light');
    $('#btn-dr-r2').addClass('btn-outline-light');
    $('#btn-dr-r3').addClass('btn-outline-light');
    $('#btn-dr-rx').addClass('btn-outline-light');
}

function setEgData(idx) {
    /** @description Set the example images counter using the full index and the select button list
    * @param {int} idx
     */
    // Set Eg Lists
    switch (selectedEg) {
        case 'R0':
            eg_list = drList_r0;
            $('#btn-dr-r0').addClass('focus');
            break;
        case 'R1':
            eg_list = drList_r1;
            $('#btn-dr-r1').addClass('focus');
            break;
        case 'R2':
            eg_list = drList_r2;
            $('#btn-dr-r2').addClass('focus');
            break;
        case 'R3':
            eg_list = drList_r3;
            $('#btn-dr-r3').addClass('focus');
            break;
        case 'High':
            eg_list = qList_high;
            $('#btn-qual-high').addClass('focus');
            break;
        case 'Low':
            eg_list = qList_low;
            $('#btn-qual-low').addClass('focus');
            break;
        default:
            eg_list = drList_rx;
            $('#btn-dr-rx').addClass('focus');
    }
    // Read data of local list
    for(i = 0; i < eg_list.length; i++){
        // Check if local name is equal to full index name
        if (eg_list[i].filename === galleryData[idx].filename) {
            id = i;
            break;
        }
    }
    setEgCounter(id);
}

function setEgCounter(local_id) {
    /** @description Set the example images counter with local index
    * @param {int} idx
     */
    var pos = local_id + 1;
    var bcounter = $('#eg-counter');
    bcounter.text(pos + '/' + eg_list.length);
}

function passEs(el) {
    /** @description Pass images forward or backward
    * @param {element} el
     */
    // Get current image
    var src = $('#img-eg-dr')[0].src;
    var id = -1;
    // Find image in local list
    for (i = 0; i < eg_list.length; i++) {
        if (src.includes(eg_list[i].filename)) {
            id = i;
            break;
        }
    }
    // Check direction
    if (el.innerText.includes("Next")) {
        id = id + 1;
        if (id >= eg_list.length)
            id = 0;
    }
    else {
        id = id - 1;
        if (id < 0)
            id = eg_list.length - 1;
    }

    // Clear button
    clearBtnDrEg();
    // Get general id
    var idx = eg_list[id].idx;
    // Set button names
    changeDrEg(galleryData[idx].grading);
    changeQualEg(galleryData[idx].quality);
    // Set example data
    setEgData(idx);
    // Set image and counter
    setEgImg(galleryURL + eg_list[id].filename);
    setEgCounter(id);
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
