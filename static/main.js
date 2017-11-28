$.ajaxSetup({
    beforeSend:function(){
        // show gif here, eg:
        $("#loading").show();
    },
    complete:function(){
        // hide gif here, eg:
        $("#loading").hide();
    }
});


$(document).ready(function() {

    $("#main-tabs").tabs();
    $("#comparison_set").tabs();
    $("#visual").tabs();

    $('#loading').hide();

    $('#submit').on('click', function(e) {

        var normal_set = $('#normal_set').val();
        var kmer_length = $('#kmer_length').val();

        var current_tab = $("#comparison_set .ui-tabs-panel:visible").attr("id");

        var comparison_set_input;

        if (current_tab == 'select_file') {
            var comparison_set_input = $('#comparison_set_reference').val();
        }

        if (getCookie('user_id')) {
            var user_set_id = getCookie('user_id');
            var comparison_set_id = (comparison_set_input) ? '': getCookie('comparison_id')
            var comparison_set = (comparison_set_input) ? comparison_set_input : '';

            if (comparison_set == 'user_set') {
                comparison_set = '';
                comparison_set_id = getCookie('user_id');
            }

            params = {
            'normal_set' : normal_set,
            'kmer_length' : kmer_length,
            'comparison_set': comparison_set,
            'comparison_set_id' : comparison_set_id,
            'user_set_id' : user_set_id
            }

            runSEEKR(params)
        }

        else {
            alert("Please upload a fasta file for User Set to run SEEKR.")
        }

    });


    $('#user_set_files').change(function (e) {
        e.preventDefault();
        e.stopPropagation();

        var fileName = $(this).val();

        fileName = fileName.replace("C:\\fakepath\\", "");

        uploadFile(0)

        $('#user_file_text').text(fileName);
    });

    $('#comparison_set').on('change', '#comparison_set_files', function (e) {
        e.preventDefault();
        e.stopPropagation();

        var fileName = $(this).val();

        fileName = fileName.replace("C:\\fakepath\\", "");

        uploadFile(1);

        $('#comparison_file_text').text(fileName);

        $('#comparison_set_option').remove();

        $('#normal_set').append('<option id="comparison_set_option" value="comparison_set">Comparison Set (' + fileName + ')</option>');
    });

	 $("input:radio[name=gencode_human_set]").on('click', function(){
	 	if($('#buttonGroup2').is(':checked')) {
	 		 $('#buttonGroup2').prop("checked", false);
	 	}
	 	if($('#buttonGroup3').is(':checked')) {
	 		 $('#buttonGroup3').prop("checked", false);
	 	}
	 });

	 $("input:radio[name = gencode_mouse_set]").on('click', function(){
	 	if($('#buttonGroup1').is(':checked')) {
	 		 $('#buttonGroup1').prop("checked", false);
	 	}
	 	if($('#buttonGroup3').is(':checked')) {
	 		 $('#buttonGroup3').prop("checked", false);
	 	}
	 });

	 $("input:radio[name = user_set]").on('click', function(){
	 	if($('#buttonGroup1').is(':checked')) {
	 		 $('#buttonGroup1').prop("checked", false);
	 	}
	 	if($('#buttonGroup2').is(':checked')) {
	 		 $('#buttonGroup2').prop("checked", false);
	 	}
	 });

});


var getCookie = function (cname) {
    var name = cname + "=";
    var decodedCookie = decodeURIComponent(document.cookie);
    var ca = decodedCookie.split(';');
    for(var i = 0; i <ca.length; i++) {
        var c = ca[i];
        while (c.charAt(0) == ' ') {
            c = c.substring(1);
        }
        if (c.indexOf(name) == 0) {
            return c.substring(name.length, c.length);
        }
    }
    return '';
}

var uploadFile = function (x) {

    if (x == 0) {


        $.ajax({
            type: 'POST',
            url: '/files/fasta',
            data: new FormData($('#user_set_form')[0]),
            cache: false,
            contentType: false,
            processData: false,
            success: function(data) {

                    document.cookie = 'user_id=' + data['file_id'];

            }
        });
    }

    else if (x == 1) {
            $.ajax({
            type: 'POST',
            url: '/files/fasta',
            data: new FormData($('#comparison_set_form')[0]),
            cache: false,
            contentType: false,
            processData: false,
            success: function(data) {

                    document.cookie = 'comparison_id=' + data['file_id'];

            }
        });
    }
}


var runSEEKR = function(params) {

    console.log(params);


    $.ajax({
        type: 'POST',
        url: '/_jobs',
        data: JSON.stringify(params),
        contentType: "application/json; charset=utf-8",
        dataType: "html",
        success: function(data) {

           kmer_matrix = data['kmer_matrix'];

           kmerMap(kmer_matrix);

           data = [];


           for i in kmer_matrix:

                data[i] = {

                    value: kmer_matrix[i][2]

                }


        }

    });
}

