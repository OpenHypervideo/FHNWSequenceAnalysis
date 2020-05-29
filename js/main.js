var sequenceData = [];
var sequenceRules = [];

$(document).ready( function() {

	sequenceData = [];
	sequenceRules = [];
	$('.resultContainer textarea').val('');
	$('#visualResultContainer').empty();

	var fileDropContainer = $("#fileDropContainer");
	fileDropContainer.on('dragenter', function (e) {
		e.stopPropagation();
		e.preventDefault();
		$(this).addClass('dragOver');
	});
	fileDropContainer.on('dragleave', function (e) {
		e.stopPropagation();
		e.preventDefault();
		$(this).removeClass('dragOver');
	});
	fileDropContainer.on('dragover', function (e) {
		e.stopPropagation();
		e.preventDefault();
		$(this).addClass('dragOver');
	});
	fileDropContainer.on('drop', function(e) {
		e.preventDefault();
		$(this).removeClass('dragOver');
		handleFileDrop(e);
	});
	$(window).on('dragover', function(e) {
		e.preventDefault();
		e.stopPropagation();
	}, false);
	$(window).on('drop', function(e) {
		e.preventDefault();
		e.stopPropagation();
	}, false);

	$('#detectSequencesBtn').click(analyseSequences);

	getRules();

});