// JavaScript source code

var urlBase = "";

function grayscale() {

    // Read image filename
    currentSrc = $('#img-upload')[0].currentSrc;
    var str_list = currentSrc.split('/');
    img = str_list[str_list.length - 1];
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