// JavaScript source code

var urlBase = "";

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


    var gallery = $('#gallery');

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

                i = 0;
                console.log(data.length);
                data.forEach(file => {

                    im_id = 'g_img_' + i;
                    gallery.append(getGalleryEl(im_id, file));
                    i += 1;
                });
                
            }
        });

}

function getGalleryEl(id, img) {

    el_div = jQuery('<div/>', {
        class: 'galery-img'
    });

    el_img = jQuery('<img/>', {
        id: id,
        height: '64px',
        src: 'gallery/' + img
    });

    el_div.append(el_img);

    return el_div;
}