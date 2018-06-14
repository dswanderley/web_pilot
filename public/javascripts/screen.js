// JavaScript source code

var urlBase = "";
var galleryList = [];
var hasQuality = false;

/*
 * Load Page functions
 */

function loadScreenDrApp() {
    /** @description Initialize componentes of the application
     */
    loadGallery();
    initExamples();
    setEvalBtn();
}

function initExamples() {
    /** @description Set example buttons and images
     */
    clearBtnQualEg();
    clearBtnDrEg();

    $('#btn-qual-high').addClass('focus');
    $('#btn-dr-r0').addClass('focus');
}

function loadGallery() {
    /** @description Load Gallery of images
     */

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
                setMainImage(url_g + '/' + galleryList[0]);
            }
        });
}


/*
 * Ajax calls
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

function quality() {
    /** @description Call image Quality. Evaluate displayed image.
     */
    // Read image filename
    var currentSrc = $('#img-disp')[0].currentSrc;
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
                $('#lbl-res1').text('Quality Assessment: ' + Math.round(qual_data.q_pred) + '% ');
                $('#lbl-res2').text(qual_data.qual);

                console.log("Quality: " + qual_data.qual);
                console.log("Prediction Val.: " + qual_data.q_pred);
                // Get image path and URL
                path = qual_data.path;
                if (qual_data.q_pred <= 50) {
                    hasQuality = false;
                    setMainImage(path);
                    $('#img-disp').attr('height', '256px');
                    $('#lbl-res2').addClass("btn-outline-danger");
                }
                else {
                    hasQuality = true;
                    $('#lbl-res2').addClass("btn-outline-success");
                }
                // Block or allow Btn
                setEvalBtn();
            }
        });
}

function dr_detection() {
    /** @description Call DR detection. Process displayed image.
     */
    // Read image filename
    var currentSrc = $('#img-disp')[0].currentSrc;
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
                $('#lbl-res3').text('Probability of the Disease: ' + Math.round(dr_data.dr_pred) + '% ');
                $('#lbl-res4').text(dr_data.dr);

                console.log("Disease: " + dr_data.dr);
                console.log("Prediction Val.: " + dr_data.dr_pred);
                // Get image path and URL
                path = dr_data.path;
                if (dr_data.dr_pred > 50) {
                    setMainImage(path);
                    $('#img-disp').attr('height', '256px');
                    $('#lbl-res4').addClass("btn-outline-danger");
                }
                else {
                    $('#lbl-res4').addClass("btn-outline-success");
                }
            }
        });
}


/*
 * Set Image
 */

function selectGalleryImage(imgid) {
    /** @description Change large image after click on image gallery
      * @param {string} image Image Element Id
     */
    setMainImage(imgid.src);
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

/*
 * Set Examples
 */

function setQualEg(btn) {
    /** @description Manage the Quality example buttons 
    */
    clearBtnQualEg();
    $('#' + btn.id).addClass('focus');
}

function setDrEg(btn) {
    /** @description Manage the DR example buttons 
    */
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