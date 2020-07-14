function handleFileDrop(evt) {
	evt.stopPropagation();
	evt.preventDefault();
	
	var files = evt.originalEvent.dataTransfer.files;
	//console.log(files);

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

				//updateFileList(sequenceData);
				updateVisualResult(sequenceData);
				updateDataTextarea(sequenceData);
			};
		})(files[i]);

		reader.readAsArrayBuffer(files[i]);
	}
}

function loadSampleData() {
	var xhrList = [];
	var sampleFiles = [
		'IA39_process_181030.xlsx',
		'IH24_process_181016.xlsx',
		'IC65_process_181129.xlsx',
		'CA42_process_181108.xlsx',
		'CH35_process_181018.xlsx',
		'CC21_process_181004.xlsx'
	];

	for (var i = 0; i < sampleFiles.length; i++) {
		var url = '../data/use-case/'+ sampleFiles[i];
		xhrList[i] = new XMLHttpRequest();
		xhrList[i].open("GET", url, true);
		xhrList[i].responseType = "arraybuffer";

		xhrList[i].onload = function(evt) {
		  /* parse the data when it is received */
			//console.log(req);
			var data = new Uint8Array(this.response);
			var workbook = XLSX.read(data, {
				type: 'array'
			});

			var dataJSON = {
				fileName: this.responseURL.split('/').pop(),
				sequences: [],
				actions: cleanActionData(XLSX.utils.sheet_to_json(workbook.Sheets.Table))
			};

			sequenceData.push(dataJSON);

			//updateFileList(sequenceData);
			updateVisualResult(sequenceData);
			updateDataTextarea(sequenceData);
		};
		xhrList[i].send();
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
	$('#visualResultContainer').empty();

	for (var e = 0; e < data.length; e++) {
		
		var evalTitle = $('<div class="evalTitle">'+ data[e].fileName +'</div>');
		var evalBody = $('<div class="evalBody"></div>');
		var detectedSequences = $('<ul class="detectedSequences"></ul>');
		var evalItem = $('<ul class="actionList"></ul>');
		
		for (var s = 0; s < data[e].sequences.length; s++) {
			
			var sequencesListItem = $('<li class="sequencesListItem" title="'+ data[e].sequences[s]['sequenceLabel'] +'">'+ data[e].sequences[s]['sequenceNumber'] +': '+ data[e].sequences[s]['sequenceLabel'] + '</li>');
			var leftValue = 153 * data[e].sequences[s]['actionIndexFrom'];
			var widthValue = 153 * (data[e].sequences[s]['actionIndexTo'] - data[e].sequences[s]['actionIndexFrom'] + 1);
			
			sequencesListItem.css({
				left: leftValue + 'px',
				width: widthValue - 3 + 'px',
				backgroundColor: data[e].sequences[s]['sequenceColor']
			});

			detectedSequences.append(sequencesListItem);

		}

		for (var i = 0; i < data[e].actions.length; i++) {
			
			var actionListItem = $('<li class="actionListItem" title="'+ (i+1) +'">'+ data[e].actions[i]['Aktion'] + '</li>');
			evalItem.append(actionListItem);

		}

		evalBody.append(detectedSequences, evalItem);
		$('#visualResultContainer').append(evalTitle, evalBody);

		detectedSequences.CollisionDetection({spacing:0, includeVerticalMargins:true})

	}
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
	
	var actionsToIgnore = [
			'UserLogin', 
			'EditStart', 
			'EditSave', 
			'EditEnd', 
			'UserLogout',
			'AnnotationDelete'
		],
		actionsToMerge = [
			'AnnotationAdd',
			'AnnotationChangeText', 
			'AnnotationChangeTime'
		];

	var cleanActionArray = originActionArray.reduce((r, o) => {
		var last = r[r.length - 1];

		if (last && last['Aktion'] === o['Aktion'] && actionsToMerge.indexOf(o['Aktion']) != -1) {
			// COMBINE DATA
			//last.duration += o.duration;
		} else if (actionsToIgnore.indexOf(o['Aktion']) == -1) {
			r.push({ ...o });
		}

		return r;
	}, []);

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

function getRandomInt(min, max) {
	min = Math.ceil(min);
	max = Math.floor(max);
	return Math.floor(Math.random() * (max - min + 1)) + min;
}