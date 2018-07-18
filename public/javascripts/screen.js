// JavaScript source code

var urlBase = "";
var galleryList = [];
var hasQuality = false;
var img_orig = "";
var img_qual = "";
var img_dr = "";

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
    setImgQualEg();
    setImgDrEg();
    refreshScreenSize();
}

function initExamples() {
    /** @description Set example buttons and images
     */
    clearBtnQualEg();
    clearBtnDrEg();

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
    height_breadcrumb = 19 + 12 + 12 +16;
    padding_image = 5 + 5;

    height_image = height_body - height_gallery - height_breadcrumb - padding_image - 3;
    
    $('#img-disp').height(height_image)
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
                i = 0;
                // Read images in gallery folder
                data.forEach(file => {
                    // Define image ID
                    im_id = 'g_img_' + i;
                    // Create each image element - list item
                    el_ul.append(getGalleryEl(im_id, file));
                    // Add filename to gallery list
                    galleryList.push(file);
                    i += 1;
                });
                // Add list to gallery
                gallery.append(el_ul);
                // Set orginal image block with the first image on gallery
                img_orig = url_g + '/' + galleryList[0];
                setMainImage(img_orig);
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
                $('#lbl-res1').text('Percentage: ' + Math.round(qual_data.q_pred) + '% ');
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
                $('#lbl-res3').text('Percentage: ' + Math.round(dr_data.dr_pred) + '% ');
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
        src: "gallery/" + img
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
}

function setMainImage(src) {
    /** @description Set original image src
      * @param {string} image src
     */
    $('#img-disp')[0].src = src
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

function setImgQualEg(click_id) {
    /** @description Set image of quality image example
     * @param {string} image src
     */
    if (click_id == 'btn-qual-low') {
        src = '/images/quality_low.png';
    }
    else {
        src = '/images/quality_high.png';
    }

    $('#img-eg-dr')[0].src = src;
}

function setImgDrEg(click_id) {
    /** @description Set image of DR image example
     * @param {string} image src
     */

    switch (click_id) {
        case 'btn-dr-r1':
            src = '/images/r1.png';
            break;
        case 'btn-dr-r2':
            src = '/images/r2.png';
            break;
        case 'btn-dr-r3':
            src = '/images/r3.png';
            break;
        default:
            src = '/images/r0.png';
    }

    $('#img-eg-dr')[0].src = src;
}

function setQualEg(btn) {
    /** @description Manage the Quality example buttons 
    */
    setImgQualEg(btn.id);
    clearBtnQualEg();
    $('#' + btn.id).addClass('focus');
}

function setDrEg(btn) {
    /** @description Manage the DR example buttons 
    */
    setImgDrEg(btn.id);
    clearBtnDrEg();
    $('#' + btn.id).addClass('focus');
    
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
}