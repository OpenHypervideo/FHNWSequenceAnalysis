var settingMapping = {
	'I': 'individual',
	'C': 'collaborative'
}

var scenarioMapping = {
	'A': 'annotations',
	'H': 'hyperlinks',
	'C': 'controlGroup'
}


function handleFileDrop(evt) {
	evt.stopPropagation();
	evt.preventDefault();
	
	showWorking('Processing files ...');

	var files = evt.originalEvent.dataTransfer.files;
	//console.log(files);

	var filesProcessed = 0;

	for (var i = 0; i < files.length; i++) {
		var reader = new FileReader();
		
		reader.onload = (function(file) {
			return function(evt) {
				var data = new Uint8Array(evt.target.result);
				var workbook = XLSX.read(data, {
					type: 'array'
				});

				var fileNameString = file.name,
					fileNameParts = fileNameString.split('.')[0].split('_'),
					settingString = fileNameParts[0].split('')[0],
					scenarioString = fileNameParts[0].split('')[1],
					personIDString = fileNameParts[0].match(/\d+/g).join('');

				var dataJSON = {
					fileName: fileNameString,
					setting: settingMapping[settingString],
					scenario: scenarioMapping[scenarioString],
					personID: personIDString,
					sequences: [],
					actions: cleanActionData(XLSX.utils.sheet_to_json(workbook.Sheets.Table))
				};

				sequenceData.push(dataJSON);
				filesProcessed++;
				
				if (filesProcessed == files.length) {
					//updateFileList(sequenceData);
					//updateVisualResult(sequenceData);
					setTimeout(function() {
						analyseSequences();
					}, 1000);
				}
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

	showWorking('Processing files ...');

	var filesProcessed = 0;

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

			var fileNameString = this.responseURL.split('/').pop(),
				fileNameParts = fileNameString.split('.')[0].split('_'),
				settingString = fileNameParts[0].split('')[0],
				scenarioString = fileNameParts[0].split('')[1],
				personIDString = fileNameParts[0].match(/\d+/g).join('');

			var dataJSON = {
				fileName: fileNameString,
				setting: settingMapping[settingString],
				scenario: scenarioMapping[scenarioString],
				personID: personIDString,
				sequences: [],
				actions: cleanActionData(XLSX.utils.sheet_to_json(workbook.Sheets.Table))
			};

			sequenceData.push(dataJSON);
			filesProcessed++;

			if (filesProcessed == sampleFiles.length) {
				//updateFileList(sequenceData);
				//updateVisualResult(sequenceData);
				setTimeout(function() {
					analyseSequences();
				}, 1000);
			}
		};
		xhrList[i].send();
	}
	
}

function updateFileList(data) {
	
	$('#fileList').empty();
	
	for (var i = 0; i < data.length; i++) {
		$('#fileList').append('<li><i class="far fa-file-alt"></i>'+ data[i].fileName +'<i class="fa fa-times"></i></li>');
	}

}

function updateVisualResult(data) {
	$('.resultContainer').show();
	$('#visualResultContainer').empty();

	for (var e = 0; e < data.length; e++) {
		var evalTitle = $('<h4 class="evalTitle">'+ data[e].fileName +'</h4>');
		var evalBody = $('<div class="evalBody"></div>');
		var detectedSequences = $('<ul class="detectedSequences"></ul>');
		var evalItem = $('<ul class="actionList"></ul>');
		
		for (var s = 0; s < data[e].sequences.length; s++) {
			var prioritizedClass = (data[e].sequences[s]['prioritized']) ? 'prioritized' : '';
			var sequencesListItem = $('<li class="sequencesListItem '+ prioritizedClass +'" title="'+ data[e].sequences[s]['sequenceLabel'] +'">'+ data[e].sequences[s]['sequenceNumber'] +': '+ data[e].sequences[s]['sequenceLabel'] + '</li>');
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

function renderTable(targetElemSelector, name, tableData, columns, additionalClasses, enableSearch, enableFooter) {
	var tableID = toCamelCase(name);
	var classes = (additionalClasses) ? additionalClasses : ''
	var tableContainer = $('<div class="tableContainer '+ classes +'" data-table-id="'+ tableID +'"></div>');
	var tableTitle = $('<h4>'+ name +'</h4>');
	var tableElem = $('<table id="'+ tableID +'"></table>');

	tableContainer.append(tableTitle, tableElem);
	$(targetElemSelector).append(tableContainer);
	dataTableIDList.push(tableID);

	tableElem.bootstrapTable({
		showToggle: true,
		showColumns: true,
		multiToggleDefaults: [],
		search: enableSearch,
		searchAlign: 'left',
		buttonsAlign: (enableSearch) ? 'right':'left',
		showExport: true,
		showFooter: enableFooter,
		exportDataType: 'basic',
		exportTypes: ['csv', 'excel', 'txt', 'json'],
		exportOptions: {
			htmlContent: true,
			excelstyles: ['mso-data-placement', 'color', 'background-color'],
			fileName: 'Export-'+ getTodayString() +'-'+ name.replace(/\s/g, '-'),
			onCellHtmlData: function(cell, rowIndex, colIndex, htmlData) {
				var cleanedString = cell.html().replace(/<br\s*[\/]?>/gi, "\r\n");
				//htmlData = cleanedString;
				return htmlData;
			}
		},
		sortName: columns[0].field,
		cardView: false,
		locale: 'de-DE',
		columns: columns,
		data: tableData
	});
}

function resetTables(tableIDList) {
	for (var i = 0; i < tableIDList.length; i++) {
		$('#'+ tableIDList[i]).bootstrapTable('destroy');
		$('.tableContainer[data-table-id="'+ tableIDList[i] +'"]').remove();
	}
}

function getTodayString() {
	var today = new Date(),
		year = today.getFullYear(),
		month = ('0' + (today.getMonth() + 1)).slice(-2),
		day = ('0' + today.getDate()).slice(-2),
		hours = ('0' + today.getHours()).slice(-2),
		minutes = ('0' + today.getMinutes()).slice(-2),
		todayString = year +''+ month +''+ day +'-'+ hours +''+ minutes;

	return todayString;
}

function toCamelCase(str) {
    var camelCased = str.replace(/[-_ .]+(.)?/g, function (match, p) {
        if (p) {
            return p.toUpperCase();
        }
        return '';
    }).replace(/[^\w]/gi, '');
    return camelCased;
};

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

function showWorking(message) {
	if (message) {
		$('.workingMessage').html(message);
	}
	$('.workingIndicator').show();
}

function hideWorking() {
	setTimeout(function() {
		$('.workingIndicator').fadeOut(200, function() {
			$('.workingMessage').html('');
		});
	}, 2000);
}

/*
  QueryableWorker instances methods:
    * sendQuery(queryable function name, argument to pass 1, argument to pass 2, etc. etc): calls a Worker's queryable function
    * postMessage(string or JSON Data): see Worker.prototype.postMessage()
    * terminate(): terminates the Worker
    * addListener(name, function): adds a listener
    * removeListener(name): removes a listener
  QueryableWorker instances properties:
    * defaultListener: the default listener executed only when the Worker calls the postMessage() function directly
 */
function QueryableWorker(workerWrapperFunction, defaultListener, onError) {
  var instance = this,
  worker = new Worker(URL.createObjectURL(new Blob(["("+workerWrapperFunction.toString()+")()"], {type: 'text/javascript'}))),
  listeners = {};

  this.defaultListener = defaultListener || function() {};

  if (onError) {worker.onerror = onError;}

  this.postMessage = function(message) {
    worker.postMessage(message);
  }

  this.terminate = function() {
    worker.terminate();
  }

  this.addListener = function(name, listener) {
    listeners[name] = listener; 
  }

  this.removeListener = function(name) { 
    delete listeners[name];
  }

  /* 
    This functions takes at least one argument, the method name we want to query.
    Then we can pass in the arguments that the method needs.
  */
  this.sendQuery = function() {
    if (arguments.length < 1) {
      throw new TypeError('QueryableWorker.sendQuery takes at least one argument'); 
      return;
    }
    worker.postMessage({
      'queryMethod': arguments[0],
      'queryMethodArguments': Array.prototype.slice.call(arguments, 1)
    });
  }

  worker.onmessage = function(event) {
    if (event.data instanceof Object &&
      event.data.hasOwnProperty('queryMethodListener') &&
      event.data.hasOwnProperty('queryMethodArguments')) {
      listeners[event.data.queryMethodListener].apply(instance, event.data.queryMethodArguments);
    } else {
      this.defaultListener.call(instance, event.data);
    }
  }
}