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
// Canvas
var main_img = new Image();
var ctx;
var canvas;
var max_img_height = 256;
var canvasScale = 1.0;
var SCALE_FACTOR = 0.1;
var img_dwidth, img_dheight, canvas_dx, canvas_dy, canvas_cx, canvas_cy;
var mouse_x, mouse_y;

/*
 * Load Page functions
 */

function loadScreenDrApp() {
    /** @description Initialize componentes of the application
     */
    $('#btn-toogle').hide();
    loadGallery();
    initExamples();
    setEvalBtn();
    refreshScreenSize();
    addEvents();
}

function initExamples() {
    /** @description Set example buttons and images
     */
    clearBtnQualEg();
    clearBtnDrEg();
    setEgImg('/images/quality_high.png');
    $('#btn-qual-high').addClass('focus');
    $('#btn-dr-r0').addClass('focus');
}

function refreshScreenSize() {
    /** @description Refresh main Image Height
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
    // Set canvas
    setMainImage(main_img.src);
}

function addEvents() {
    /** @description Add Events listener
     */
    canvas.addEventListener('mousedown', canvasMouseDown);
    canvas.addEventListener('mousewheel', canvasScrollWheel, false);
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
                data.file_list.forEach(file => {
                    // Define image ID
                    im_id = img_idref + i;
                    // Create each image element - list item
                    el_ul.append(getGalleryEl(im_id, file));
                    // Add filename to gallery list
                    galleryList.push(file);
                    i += 1;
                });
                // Add list to gallery
                gallery.append(el_ul);
                // Set orginal image block with the first image on gallery
                idx = Math.floor(Math.random() * galleryData.length);
                img_orig = url_g + '/' + galleryList[idx];
                setMainImage(img_orig);
                setImgEg(idx);
                // Hide loader
                $('.loader').hide();
            }
        });
}

function quality() {
    /** @description Call image Quality. Evaluate displayed image.
     */
    // Read image filename
    $('.loader').show()
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
                    hasQuality = false;
                    img_qual = path;
                    setMainImage(path);
                    $('#img-disp').attr('height', '256px');
                    $('#lbl-res2').addClass("btn-outline-danger");
                    // Partial cases
                    if (qual_data.q_pred > 25) {
                        hasQuality = true;
                    }
                    $('#btn-toogle').show();
                    $('.onoffswitch2-checkbox').prop('checked', true);
                }
                else {
                    hasQuality = true;
                    $('#lbl-res2').addClass("btn-outline-success");
                    $('#btn-toogle').hide();
                }
                // Block or allow Btn
                setEvalBtn();
                $('.loader').hide();
            }
        });
}

function dr_detection() {
    /** @description Call DR detection. Process displayed image.
     */
    $('.loader').show()
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
                    img_dr = path;
                    setMainImage(path);
                    $('#img-disp').attr('height', '256px');
                    $('#lbl-res4').addClass("btn-outline-danger");
                    $('#btn-toogle').show();
                    $('.onoffswitch2-checkbox').prop('checked', true);
                }
                else {
                    $('#lbl-res4').addClass("btn-outline-success");
                    $('#btn-toogle').hide();
                }
                $('.loader').hide();

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
    img_orig = imgid.src;
    resetimages();
    setMainImage(img_orig);
    resetLbl();
    hasQuality = false;
    setEvalBtn();
    // Get image index in JS
    id_str = imgid.id;
    id = id_str.substr(img_idref.length, id_str.length - 1);
    id = parseInt(id);
    // Set example
    setImgEg(id);
}

function setMainImage(src) {
    /** @description Set original image src
      * @param {string} image src
     */

    // Start main image
    this.main_img = new Image();
    this.main_img.src = src;
    // coordinate in the destination canvas at which to place the top-left corner of the source image
    canvas_dx = 0;
    canvas_dy = 0;
    //coordinate of the top left corner of the sub-rectangle of the source image to draw into the destination context
    canvas_cx = 0;
    canvas_cy = 0;
    // Define the size of the canvas according screen size
    setCanvasSize();
    // Calculate scale with canvas size
    canvasScale = canvas.height / main_img.height;
    // Update image
    refreshCanvasImg();
}

/*
 * Canvas
 */

function setCanvasSize() {
    /** @description Set canvas size 
     */
    // Set max size
    ih = this.max_img_height
    if (this.main_img.width) {
        iw = ih / this.main_img.height  * this.main_img.width;
    }
    else {
        iw = ih;
    }
    // Create main canvas 
    canvas = document.getElementById("main-canvas");
    canvas.width = iw;
    canvas.height = ih;
    // CSS content 
    canvas.style.width = iw.toString() + "px";
    canvas.style.height = ih.toString() + "px";
    // Canvas context
    ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
}

function refreshCanvasImg() {
    /** @description Refresh canvas image
     */

    // Display image size
    img_dwidth = canvasScale * main_img.width;
    img_dheight = canvasScale * main_img.height;

    // Reload image ? 
    src = this.main_img.src,
    this.main_img = new Image();
    this.main_img.src = src;
    // Clear context
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height, 0, 0, ctx.canvas.width, ctx.canvas.height);

    // Load Image    
    this.main_img.onload = function () {
        // Draw image
        ctx.drawImage(main_img, canvas_cx, canvas_cy, main_img.width, main_img.height, canvas_dx, canvas_dy, img_dwidth, img_dheight);
    }
}

function canvasZoom(sign, mouse_x, mouse_y) {
    /** @description Set canvas zoom factor
      * @param {int} sign signal of zoom (positive or negative)
      * @param {int} mouse_x mouse x coord over canvas
      * @param {int} mouse_y mouse y coord over canvas
     */

    // Global coord in image original size
    var px = (mouse_x + canvas_cx) / canvasScale;
    var py = (mouse_y + canvas_cy) / canvasScale;
    // Minimal scale accepts
    var minscale = ctx.canvas.height / main_img.height;

    // Prevent a large zoom or image smaller than canvas
    if (canvasScale >= 2 && sign > 0) { }
    else if (canvasScale <= minscale && sign < 1) { }
    else {
            // Recalculate canvas scale
            canvasScale += sign * SCALE_FACTOR;
            // Limit max zoom
            if (canvasScale > 2) {
                canvasScale = 2;
            }
            else if (canvasScale < minscale) { // limite min zoom
                canvasScale = minscale;
            }
            // Center image x coord
            cx = Math.round(canvasScale * px - canvas.width / 2);
            if (cx > 0) {
                canvas_cx = cx;
            }
            else {
                canvas_cx = 0;
            }
            // Center image y coord
            cy = Math.round(canvasScale * py - canvas.height / 2);
            if (cy > 0) {
                canvas_cy = cy;
            }
            else {
                canvas_cy = 0;
            }
            //  Refresh canvas
            refreshCanvasImg();
    }
}


function canvasMouseDown(ev) {
    /** @description Canvas Mouse Down event
      * @param {event} ev Button down event
     */
    console.log(ev.offsetX + ', ' + ev.offsetY);
}

function canvasScrollWheel(ev) {
    /** @description Canvas Mouse Scroll Wheel event
      * @param {event} ev Scroll Wheel event
     */

    canvasZoom(Math.sign(ev.wheelDelta), ev.offsetX, ev.offsetY);

    return ev.preventDefault() && false;    
}


/*
 * Set Results
 */

function resetimages() {
    /** @description Reset image reference src
     */
    img_qual = "";
    img_dr = "";
    $('#btn-toogle').hide();
}

function setEvalBtn() {
    /** @description Enable or disable evaluation buttons according quality
     */
    if (hasQuality) {
        $('#btn-dr').removeAttr("disabled").button('refresh');
    }
    else {
        $('#btn-dr').attr("disabled", "disabled").button('refresh');
    }
}

function resetLbl() {
    /** @description Reset labels 
     */
    $('#lbl-res2').text('');
    $('#lbl-res4').text('');
    $('#res-field-qual').css('visibility', 'hidden');
    $('#res-field-dr').css('visibility', 'hidden');
    $('#lbl-res2').removeClass("btn-outline-danger");
    $('#lbl-res2').removeClass("btn-outline-success");
    $('#lbl-res4').removeClass("btn-outline-danger");
    $('#lbl-res4').removeClass("btn-outline-success");
}

function toogleBtnClick() {
    /** @description Set main image according button status
     */
    if ($('.onoffswitch2-checkbox').is(":checked")) {

        if (img_dr == "") {
            if (img_qual != "") {
                setMainImage(img_qual);
            }
        }
        else {
            setMainImage(img_dr);
        }
    }
    else {
        setMainImage(img_orig);
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
}

function setImgQualEg(click_id) {
    /** @description Set image of quality image example
     * @param {string} image src
     */
    if (click_id == 'btn-qual-high') {
        qual = 'High';
    }
    else {
        qual = 'Low';
    }
    // Pick an index
    idx = Math.floor(Math.random() * galleryData.length);
    // Create an auxiliary list starting by the sorted index
    auxlist1 = galleryData.slice(idx, galleryData.length);
    auxlist2 = galleryData.slice(0, idx);
    auxlist = auxlist1.concat(auxlist2);
    // Find the next image in the list
    for (i = 0; i < auxlist.length; i++) {
        el = auxlist[i];
        if (el.quality === qual) {
            src = galleryURL + el.filename;
            // Set example image
            setEgImg(src);
            changeDrEg(el.grading);
            break;
        }
    }
}

function setImgDrEg(click_id) {
    /** @description Set image of DR image example
     * @param {string} image src
     */

    // Verify the selected gradding
    switch (click_id) {
        case 'btn-dr-r0':
            grad = 'R0';
            break;
        case 'btn-dr-r1':
            grad = 'R1';
            break;
        case 'btn-dr-r2':
            grad = 'R2';
            break;
        case 'btn-dr-r3':
            grad = 'R3';
            break;
        default:
            grad = 'RX';
    }
    // Pick an index
    idx = Math.floor(Math.random() * galleryData.length);
    // Create an auxiliary list starting by the sorted index
    auxlist1 = galleryData.slice(idx, galleryData.length);
    auxlist2 = galleryData.slice(0, idx);
    auxlist = auxlist1.concat(auxlist2);
    // Find the next image in the list
    for (i = 0; i < auxlist.length; i++) {
        el = auxlist[i];
        if (el.grading === grad) {
            src = galleryURL + el.filename;
            // Set example image
            setEgImg(src);
            changeQualEg(el.quality);
            break;
        }
    }

}

function setEgImg(src) {
    /** @description Set image of image example
    * @param {string} image src
    */
    $('#img-eg-dr')[0].src = src;
}

function setQualEg(btn) {
    /** @description Manage the Quality example buttons 
    * @param {obj} Button
     */
    setImgQualEg(btn.id);
    clearBtnQualEg();
    $('#' + btn.id).addClass('focus');
}

function setDrEg(btn) {
    /** @description Manage the DR example buttons 
    * @param {obj} Button
    */
    setImgDrEg(btn.id);
    clearBtnDrEg();
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
    clearBtnQualEg();
    $(btn_q_id).addClass('focus');
}

function changeDrEg(grad) {
    /** @description Change quality example button 
    * @param {string} grading
     */
    switch (grad) {
        case 'R0':
            btn_rd_id = '#btn-dr-r0';
        case 'R1':
            btn_rd_id = '#btn-dr-r1';
            break;
        case 'R2':
            btn_rd_id = '#btn-dr-r2';
            break;
        case 'R3':
            btn_rd_id = '#btn-dr-r3';;
            break;
        default:
            btn_rd_id = '#btn-dr-rx';
    }
    clearBtnDrEg();
    $(btn_rd_id).addClass('focus');
}

function clearBtnQualEg() {
    /** @description Remove classes from Quality Examples Buttons
    */
    $('#btn-qual-high').removeClass('focus');
    $('#btn-qual-low').removeClass('focus');
}

function clearBtnDrEg() {
    /** @description Remove classes from DR Examples Buttons
    */
    $('#btn-dr-r0').removeClass('focus');
    $('#btn-dr-r1').removeClass('focus');
    $('#btn-dr-r2').removeClass('focus');
    $('#btn-dr-r3').removeClass('focus');
    $('#btn-dr-rx').removeClass('focus');
}