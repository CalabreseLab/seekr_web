
$(document).ready(function() {

    var last_params;

    $("#main-tabs").tabs();
    $("#comparison_set").tabs();
    $("#visual").tabs();

    $('#loading').hide();
    $('#results_toggle').hide();

    $("#kmer_warning").hide();
    $('#user_warning').hide();
    $('#comparison_warning').hide();

    $('#submit').on('click', function(e) {
        e.preventDefault;
        e.stopPropagation;

        runSEEKR(getParams());
    });

    $('pearson_save').on('click', function(e) {
        e.preventDefault;
        e.stopPropagation;

        getKmerMatrix();
    });

    $('#kmer_save').on('click', function(e) {
        e.preventDefault;
        e.stopPropagation;

        getPearsonMatrix();
    });

    $('#kmer_png').on('click', function(){

        var svg = d3.select('#kmer_chart');

	    var svgString = getSVGString(svg.node());
	    svgString2Image(svgString, 2*svg.style('width'), 2*svg.style('width'), 'png', save ); // passes Blob and filesize String to the callback

	    function save( dataBlob, filesize ){
		    saveAs( dataBlob, 'D3 vis exported to PNG.png' ); // FileSaver.js function
	    }
    });

    $('#user_set_files').on('change', function (e) {
        e.preventDefault();
        e.stopPropagation();

        var fileName = $(this).val();

        fileName = fileName.replace("C:\\fakepath\\", "");

        uploadFile(0);

        $('#user_file_text').text(fileName);
    });

    $('#comparison_set_reference').on('change', function(e){
        e.preventDefault;
        e.stopPropagation;

        var comparison_set_input = $(this).val();

        $('#comparison_warning').hide();

        if (comparison_set_input == "gencode_mouse_set" || comparison_set_input == "gencode_human_set"){

            $('#comparison_warning').show();
        }
    });

    $('#kmer_length').on('change', function(e) {
        e.preventDefault;
        e.stopPropagation;

        var kmer_length = $('#kmer_length').val();

        $('#kmer_warning').hide();

        if (kmer_length > 6) {
            $('#kmer_warning').show();
        }



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
};


var getParams = function() {
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

        return params;
    }

    else {
        alert("Please upload a fasta file for User Set to run SEEKR.")

        return;
    }
}


var parseMatrix = function (matrix) {

    var output = matrix.replace('[', '');
    output = output.split('],');

    for (var i = 0; i < output.length; i++) {
        output[i] = output[i].replace('[', '');
        output[i] = output[i].split(',');

        output[i] = output[i].map(function(item) {
            return parseFloat(item, 10);
        });
    }

    return output;
};

var uploadFile = function (x) {

    $('#loading').show();

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

                    $("#user_warning").hide();
                    
                    if (data['file_more_than_200_sequences'] == true) {
                        // alert("Error : Sequence is more than 200 ; Visualization will not be enabled ");
                        console.log("sequence more than 200");

                        $("#user_warning").show();

                    } else {
                        console.log("sequence less than 200");
                    }

                    $('#loading').hide();
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

                    $('#comparison_warning').hide();
                    
                    if (data['file_more_than_200_sequences'] == true) {
                        console.log("sequence more than 200");
                        $('#comparison_warning').show();
                    } else {
                        console.log("sequence less than 200");
                    }

                    $('#loading').hide();
            }
        });
    }
};


var runSEEKR = function(params) {

    last_params = params;

     $('#loading').show();

    $.ajax({
        type: 'POST',
        url: '/jobs',
        data: JSON.stringify(params),
        contentType: "application/json; charset=utf-8",
        dataType: "html",
        success: function(input) {

            var data = JSON.parse(input);

            if (data.error) {
                alert(data.error + '\n Please Exit this Dialogue and Reload the Page');
                return;
            }

            if(data.visual_flag) {
                console.log('visual_flag');

                getKmerMatrix();
                getPearsonMatrix();
            }

            else {
                var comparison_names = data.comparison_names;
                var user_names = data.user_names;
                var kmer_bins = data.kmer_bins;

                var user_cluster = data.user_cluster;
                var comparison_cluster = data.comparison_cluster;

                for(var i = 0; i < user_cluster.length; i++) {
                    user_cluster[i] = user_cluster[i] + 1;
                }

                for(var i = 0; i < comparison_cluster.length; i++) {
                    comparison_cluster[i] = comparison_cluster[i]  + 1;
                }

                var kmer_cluster = [];

                for (var i = 1; i <= kmer_bins.length; i++) {
                    kmer_cluster.push(i);
                }

                var pearson_matrix = data.pearson_matrix;
                var kmer_matrix = data.kmer_matrix;
                var kmer_matrix_clean = data.kmer_matrix_clean;

                pearson_matrix = parseMatrix(pearson_matrix);
                kmer_matrix = parseMatrix(kmer_matrix);
                kmer_matrix_clean = parseMatrix(kmer_matrix_clean);

                $('#kmer_chart').html('');
                $('#pearson_chart').html('');

                pearsonHeatmap(user_names, comparison_names, user_cluster, comparison_cluster, pearson_matrix);
                kmerHeatmap(user_names, kmer_bins , user_cluster, kmer_cluster , kmer_matrix_clean, kmer_matrix);

                $('#main-tabs').tabs({ active: 1})
                $('#empty_message').hide();
                $('#results_toggle').show();
            }

            $('#loading').hide();
        }
    });
};


var getPearsonMatrix = function() {

    var params = last_params;

    console.log('The kmer matrix was not visualized');

//    $.ajax({
//        type: 'POST',
//        url: '/files/pearsons',
//        data: JSON.stringify(params),
//        contentType: "application/json; charset=utf-8",
//        dataType: "html"
//        success: function() {
//            console.log('pearsons downloaded');
//        }
//    });
};

var getKmerMatrix = function() {

    var params = last_params;

    console.log('The kmer matrix was not visualized');

//    $('#loading').show();
//
//    $.ajax({
//        type: 'POST',
//        url: '/files/kmer',
//        data: JSON.stringify(params),
//        contentType: "application/json; charset=utf-8"
////        success: function(data) {
////            console.log('kmer downloaded');
////
//////            var kmer_csv = data.kmer_csv;
////
//////            var csvContent = "data:text/csv;charset=utf-8,";
//////
//////            csvContent = csvContent + kmer_csv;
//////
//////            //console.log(csvContent);
//////
//////            var encodedUri = encodeURI(csvContent);
//////            console.log(encodedUri);
//////            window.open(encodedUri);
////
////            $('#loading').hide();
////        }
//    });
};




