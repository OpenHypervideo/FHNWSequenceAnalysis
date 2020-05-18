function detectSequences(actionArray) {

	console.log(actionArray);

	var sequenceResults = [];

	/**** 
	* DUMMY SEQUENCE DETECTION 
	* (add dummy sequence for all action arrays which start with the action "UserLogin")
	****/
	if (actionArray[0]['Aktion'] == 'UserLogin') {
		
		var dummySequenceResult1 = {
			label: 'Find position and add new annotation',
			number: 3.1,
			actionIndexFrom: 2,
			actionIndexTo: 5
		}

		sequenceResults.push(dummySequenceResult1);
	}

	return sequenceResults;

}

function analyseSequences() {
	for (var i = 0; i < sequenceData.length; i++) {
		var detectedSequences = detectSequences(sequenceData[i].actions);
		sequenceData[i].sequences = detectedSequences;
	}

	updateVisualResult(sequenceData);
	updateDataTextarea(sequenceData);
}

function handleFileDrop(evt) {
	evt.stopPropagation();
	evt.preventDefault();
	
	var files = evt.originalEvent.dataTransfer.files;

	for (var i = 0; i < files.length; i++) {
		var reader = new FileReader();
		
		reader.onload = (function(file) {
			return function(evt) {
				var data = new Uint8Array(evt.target.result);
				var workbook = XLSX.read(data, {
					type: 'array'
				});

				var dataJSON = {
					fileName: file.name,
					sequences: [],
					actions: XLSX.utils.sheet_to_json(workbook.Sheets.Table)
				};

				sequenceData.push(dataJSON);

				updateFileList(sequenceData);
				updateDataTextarea(sequenceData);
			};
		})(files[i]);

		reader.readAsArrayBuffer(files[i]);
	}
}

function updateFileList(data) {
	
	$('#fileList').empty();
	
	for (var i = 0; i < data.length; i++) {
		$('#fileList').append('<li>'+ data[i].fileName +'</li>');
	}

}

function updateDataTextarea(data) {
	$('.resultContainer textarea').val(JSON.stringify(data,undefined, 2));
}

function updateVisualResult(data) {
	
}

function convertTimestampToDateString(timestamp) {
	var dateObj = new Date(timestamp);
	return dateObj.toLocaleDateString('de-DE');
}

function convertTimestampToTimeString(timestamp) {
	var dateObj = new Date(timestamp);
	return dateObj.toLocaleTimeString('de-DE');
}

function formatTime(aNumber) {

	var hours, minutes, seconds, hourValue;

	seconds 	= Math.ceil(aNumber);
	hours 		= Math.floor(seconds / (60 * 60));
	hours 		= (hours >= 10) ? hours : '0' + hours;
	minutes 	= Math.floor(seconds % (60*60) / 60);
	minutes 	= (minutes >= 10) ? minutes : '0' + minutes;
	seconds 	= Math.floor(seconds % (60*60) % 60);
	seconds 	= (seconds >= 10) ? seconds : '0' + seconds;

	if (hours >= 1) {
		hourValue = hours + ':';
	} else {
		hourValue = '';
	}

	return hourValue + minutes + ':' + seconds;

}