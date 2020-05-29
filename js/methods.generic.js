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
					actions: cleanActionData(XLSX.utils.sheet_to_json(workbook.Sheets.Table))
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

function getSheetData(sheetID, callback) {
	$.getJSON('https://spreadsheets.google.com/feeds/list/'+ sheetID +'/od6/public/values?alt=json',function(data){
		var cleanData = [];

		var rows = data.feed.entry;

		for (var i = 0; i < rows.length; i++) {
			
			var rowData = {
				'sequenceNumber': parseFloat(rows[i]['gsx$sequencenumber']['$t']),
				'sequenceLabel': rows[i]['gsx$sequencelabel']['$t'],
				'sequenceDescription': rows[i]['gsx$sequencedescription']['$t'],
				'minActions': parseInt(rows[i]['gsx$minactions']['$t']),
				'maxActions': parseInt(rows[i]['gsx$maxactions']['$t']),
				'mandatoryActions': rows[i]['gsx$mandatoryactions']['$t'].replace(/ /g, '').split(','),
				'actionsAllowedOnce': rows[i]['gsx$actionsallowedonce']['$t'].replace(/ /g, '').split(','),
				'forbiddenActions': rows[i]['gsx$forbiddenactions']['$t'].replace(/ /g, '').split(','),
				'mandatoryFirstAction': rows[i]['gsx$mandatoryfirstaction']['$t'].replace(/ /g, '').split(','),
				'mandatoryLastAction': rows[i]['gsx$mandatorylastaction']['$t'].replace(/ /g, '').split(',')
			}

			cleanData.push(rowData);
		}

		callback(cleanData);
	});
}

function cleanActionData(originActionArray) {
	
	var cleanActionArray = [],
		actionsToIgnore = [
			'UserLogin', 
			'EditStart', 
			'EditSave', 
			'EditEnd', 
			'UserLogout'
		],
		actionsToMerge = [
			'AnnotationChangeText', 
			'AnnotationChangeTime'
		];
	
	var firstMergedAction = undefined;
	var previousAction = undefined;

	for (var i = 0; i < originActionArray.length; i++) {

		if (actionsToMerge.indexOf(originActionArray[i]['Aktion']) != -1 && 
			firstMergedAction === undefined) {
			console.log('test 1', originActionArray[i]);
			firstMergedAction = originActionArray[i];
		} else if (previousAction && originActionArray[i]['Aktion'] == previousAction['Aktion'] && 
			actionsToMerge.indexOf(originActionArray[i]['Aktion']) != -1) {
			// DO NOTHING
			console.log('test 2', originActionArray[i]);
		} else if (previousAction && originActionArray[i]['Aktion'] != previousAction['Aktion'] && 
			firstMergedAction) {

			var mergedAction = firstMergedAction;
			cleanActionArray.push(mergedAction);

			firstMergedAction = undefined;
			console.log('PUSH', mergedAction);
		} else if (actionsToIgnore.indexOf(originActionArray[i]['Aktion']) == -1) {
			cleanActionArray.push(originActionArray[i]);
			console.log('PUSH', originActionArray[i]);
		}

		previousAction = originActionArray[i];

	}



	return cleanActionArray;
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