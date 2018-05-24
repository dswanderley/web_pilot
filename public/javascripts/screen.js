// JavaScript source code

var urlBase = "";
var galleryList = [];

function grayscale() {

    // Read image filename
    var currentSrc = $('#img-upload')[0].currentSrc;
    var str_list = currentSrc.split('/');
    img = str_list[str_list.length - 1];
    console.log(str_list)
    // Ajax call
    $.ajax(
        {
            type: 'GET',
            url: urlBase + '/grayscale',
            data: { img: img },
            dataType: 'html',
            cache: false,
            async: true,
            success: function (data) {
                //img = new Image();
                console.log(data);

                path = data.substr(8, data.length - 1);
                $('#img-proc')[0].src = path;                
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
    // Ajax call
    $.ajax(
        {
            type: 'GET',
            url: urlBase + '/gallery',
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
    el_li = jQuery('<li/>', {
        class: 'gallery-img'
    });
    // Create image element
    el_img = jQuery('<img/>', {
        class: 'gallery-thumb',
        id: id,
        height: '64px',
        src: 'gallery/' + img
    });
    // Add image to list item
    el_li.append(el_img);

    return el_li;
}

function setImage(src) {
    /** @description Set image src
      * @param {string} image src
     */
    $('#img-proc')[0].src = src
}

