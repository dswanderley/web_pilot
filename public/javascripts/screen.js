// JavaScript source code

var urlBase = "";
var galleryList = [];

function grayscale() {

    // Read image filename
    var currentSrc = $('#img-orig')[0].currentSrc;
    var str_list = currentSrc.split('/');
    img = str_list[str_list.length - 1];
    folder = str_list[str_list.length - 2];
    console.log(img)
    console.log(folder)
    // Ajax call
    $.ajax(
        {
            type: 'GET',
            url: urlBase + '/grayscale',
            data: {
                dir: folder,
                img: img
            },
            dataType: 'html',
            cache: false,
            async: true,
            success: function (data) {
                // Get image path and URL
                path = data.substr(8, data.length - 1);
                $('#img-proc')[0].src = path;                
            }
        });
}

function quality() {

    // Read image filename
    var currentSrc = $('#img-orig')[0].currentSrc;
    var str_list = currentSrc.split('/');
    img = str_list[str_list.length - 1];
    folder = str_list[str_list.length - 2];
    console.log(img)
    console.log(folder)
    // Ajax call
    $.ajax(
        {
            type: 'GET',
            url: urlBase + '/quality',
            data: {
                dir: folder,
                img: img
            },
            dataType: 'html',
            cache: false,
            async: true,
            success: function (data) {
                // Convert data to JSON
                qual_data = JSON.parse(data);
                // Print results
                $('#qual-column').css('visibility', '');
                //$('#dr-column').css('display', 'inline');
                $('#lbl-qual1').text('Quality Assessment: ' + qual_data.q_pred + '% ');
                $('#lbl-qual2').text(qual_data.qual);

                console.log("Quality: " + qual_data.qual);
                console.log("Prediction Val.: " + qual_data.q_pred);
                // Get image path and URL
                path = qual_data.path;
                if (qual_data.q_pred <= 50) {
                    setProcImage(path);
                    $('#img-proc').attr('height', '256px');    
                    $('#lbl-qual2').css('color','red');
                }
                else {
                    $('#lbl-qual2').css('color', 'green');
                }
            }
        });
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
                setOrigImage(url_g + '/' + galleryList[0]);
            }
        });
}

function getGalleryEl(id, img) {
    /** @description Get image element for the gallery
      * @param {string} g_img id
      * @param {string} image name
      * @return {jQuery} list item
     */

    // Create list item
    el_li = jQuery("<li/>", {
        class: "gallery-img",
        onclick: "selectGalleryImage("+id+")"
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

function setOrigImage(src) {
    /** @description Set original image src
      * @param {string} image src
     */
    $('#img-orig')[0].src = src
}

function setProcImage(src) {
    /** @description Set processed image src
      * @param {string} image src
     */
    $('#img-proc')[0].src = src
}

function selectGalleryImage(imgid) {
    /** @description Change large image after click on image gallery
      * @param {string} image Image Element Id
     */
    setOrigImage(imgid.src);
    setProcImage('');
    resetQualityLbl();
}

function resetQualityLbl() {
    /** @description Reset labels 
     */
    $('#lbl-qual1').text('Quality Assessment: ');
    $('#lbl-qual2').text('');
    $('#qual-column').css('visibility', 'hidden');
    //$('#dr-column').css('display', 'none');
}