var sequenceData = [];
var sequenceRules = [];
var cleanSequenceData = [];

$(document).ready( function() {

	if (!!document.location.host) {
        $('.sampleDataInfo').show();
    }

    $('[data-toggle="tooltip"]').tooltip({
    	trigger: 'hover'
    });

	sequenceData = [];
	sequenceRules = [];
	$('.resultContainer textarea').val('');
	$('#visualResultContainer').empty();

	$('a[data-toggle="tab"]').on('shown.bs.tab', function (e) {
		/*
		e.target // newly activated tab
		e.relatedTarget // previous active tab
		*/
		//$(window).resize();
	});

	$('#fullscreenButton').click(toggleFullscreen);

	document.onfullscreenchange = function ( event ) { 
		if (!document.fullscreenElement) {
			$('body').removeClass('inFullscreen');
		} else {
			$('body').addClass('inFullscreen');
		}
	};

	$('#newAnalysisButton').click(function() {
		showWorking();
		
		window.setTimeout(function() {
			$('body').removeClass('result');
			$('.resultContainer').hide();
			window.setTimeout(function() {
				location.reload();
			}, 1000);
		}, 1000);
	});

	$('.selectMenuContainer .custom-select').on('change', function (evt) {
		var parentElem = $(evt.currentTarget).parents('.selectMenuContainer'),
			targetID = parentElem.data('target'),
			dataTypeValue = parentElem.find('select.selectDataType').val(),
			dataSubsetValue = parentElem.find('select.selectDataSubset').val(),
			dataTypeLabel = parentElem.find('select.selectDataType option[value="'+ dataTypeValue +'"]').text(),
			dataSubsetLabel = parentElem.find('select.selectDataSubset option[value="'+ dataSubsetValue +'"]').text(),
			variableString = 'sequenceCountData'+ dataSubsetValue;

		if (!dataTypeValue || dataTypeValue == 'none') {
			return;
		}

		if (targetID == 'markovChainVisualizationLeft' || targetID == 'markovChainVisualizationRight') {
			if (dataSubsetValue.indexOf('file_') != -1) {
				var countData = getSequenceCountData(cleanSequenceData, false, false, dataSubsetValue.split('file_')[1]),
					currentMarkovChainData = getInteractiveMarkovChainData(countData['MarkovChainData'][dataTypeValue]);
			} else {
				var currentMarkovChainData = getInteractiveMarkovChainData(window[variableString]['MarkovChainData'][dataTypeValue]);
			}
			
			initInteractiveMarkovChainVisualization(targetID, currentMarkovChainData.data, currentMarkovChainData.labels);
		} else if (targetID == 'transitionMatrixTableLeft' || targetID == 'transitionMatrixTableRight') {
			$('#'+ targetID).find('.bootstrap-table').bootstrapTable('destroy');
			$('#'+ targetID).empty();
			if (dataSubsetValue.indexOf('file_') != -1) {
				var countData = getSequenceCountData(cleanSequenceData, false, false, dataSubsetValue.split('file_')[1]),
					tableData = countData['MarkovChainData'][dataTypeValue];
			} else {
				var tableData = window[variableString]['MarkovChainData'][dataTypeValue];
			}
			
			var columnTemplate;
			if (dataTypeValue == 'actions') {
				columnTemplate = coloredMarkovActionColumnData;
			} else if (dataTypeValue == 'mainSequences') {
				columnTemplate = coloredMarkovMainSequenceColumnData
			} else {
				columnTemplate = coloredMarkovSequenceColumnData;
			}
			
			renderTable('#'+ targetID, 'Transitions: '+ dataTypeLabel +' → '+ dataSubsetLabel, tableData, columnTemplate, 'col-12', false, false, true);
		} else {
			$('#'+ targetID).find('.bootstrap-table').bootstrapTable('destroy');
			$('#'+ targetID).empty();
			if (dataSubsetValue.indexOf('file_') != -1) {
				var countData = getSequenceCountData(cleanSequenceData, false, false, dataSubsetValue.split('file_')[1]),
					tableData = countData[dataTypeValue];
			} else {
				var tableData = window[variableString][dataTypeValue];
			}
			
			renderTable('#'+ targetID, 'Sequences: '+ dataTypeLabel +' → '+ dataSubsetLabel, tableData, genericSequenceColumnData, 'col-12', true, true);
		}
	});

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

	//getRules();

});