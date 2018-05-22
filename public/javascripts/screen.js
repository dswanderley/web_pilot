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

    el_ul = jQuery('<ul/>', {
        class: 'galery-img'
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

                i = 0;
                console.log(data.length);
                data.forEach(file => {

                    im_id = 'g_img_' + i;
                    
                    el_ul.append(getGalleryEl(im_id, file));
                    i += 1;
                });

                gallery.append(el_ul);
            }
        });
}

function getGalleryEl(id, img) {
    
    el_l1 = jQuery('<li/>', {
        class: 'galery-img'
    });

    el_img = jQuery('<img/>', {
        class: 'gallery-thumb',
        id: id,
        height: '64px',
        src: 'gallery/' + img
    });

    el_l1.append(el_img);

    return el_l1;
}