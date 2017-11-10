var dragndropHTML = '<div class="row">' +
						'<button class="info">&#8942;</button>' +
					'</div>' +
					'<div class="row">' +
						'<div class="dropzone workzone_tabbed">' +
						    '<form id="comparison_set_form method="post" enctype="multipart/form-data">' +
							    '<input type="file" name="comparison_set_files" id="comparison_set_files">' +
							    '<h2>Drag and Drop Files Here or Click to Upload</h2>' +
							    '<img src="../static/dragndrop.svg">' +
							    '<h2 id="comparison_file_text"></h2>' +
					        '</form>' +
						'</div>' +
					'</div>';

var tableHTML = '<div class="row">' +
                    '<button class="info">&#8942;</button>' +
                '</div>' +
                '<div class="row">' +
                    '<div class="workzone_tabbed">' +
                        '<div class="row">' +
                            '<h2>Select Comparison Set</h2>' +
                        '</div>' +
                        '<select name="comparison_set_reference" id="comparison_set_reference">' +
                            '<option value="gencode_human_set" selected="selected">All Human (Gencode)</option>' +
                            '<option value="gencode_mouse_set">All Mouse (Gencode)</option>' +
                            '<option value="user_set">User Set</option>' +
                        '</select>' +
                    '</div>' +
                '</div>';

var user_id;
var comparison_id;

$('#main-tabs').tabs();

$(document).ready(function() {

    $('#submit').on('click', function(e) {

        var normal_set = $('#normal_set').val();
        var kmer_length = $('#kmer_length').val();
        var comparison_set_input = $('#comparison_set_reference').val();

        if (user_id) {
            var user_set_id = user_id;
            var comparison_set_id = comparison_id
            var comparison_set = (comparison_set_input) ? comparison_set_input : '';


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

    $("#saved_tab").on('click', function(e) {
        e.preventDefault();
    	e.stopPropagation();

    	tabSelect(1);
    	comparison_id = null;
    });

    $('#upload_tab').on('click', function(e) {
        e.preventDefault();
        e.stopPropagation();

        tabSelect(2);
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


var tabSelect = function (x) {

	$("#tab-container").removeClass("tab-1");
    $("#tab-container").removeClass("tab-2");

	$("#tab-container").attr('class', "tabbed tab-" + x);

	if (x == 1) {
	    $("#comparison_set").empty();
	    $("#comparison_set").append(tableHTML);

	    $('#comparison_set_option').remove();
	}

	else if (x == 2) {
        $("#comparison_set").empty();
        $("#comparison_set").append(dragndropHTML);
    }
}


var uploadFile = function (x) {

        $.ajax({
            type: 'POST',
            url: '/files/fasta',
            data: new FormData($('form')[0]),
            cache: false,
            contentType: false,
            processData: false,
            success: function(data) {

                if (x == 0) {
                    user_id = data['file_id']
                }

                else if (x == 1) {
                    comparison_id = data['file_id']
                }
            }
        });
}


var runSEEKR = function(params) {

    console.log(params);


    $.ajax({
        type: 'POST',
        url: '/_jobs',
        data: JSON.stringify(params),
        contentType: "application/json; charset=utf-8",
        dataType: "html",
        success: function(result) {

            window.open('/heatmap')
            window.open('/cluster')

            location.reload(true);

            $('visual').html(data);
        }

    });

}