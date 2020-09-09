// Data Analysis Methods

var dataTableIDList = [];

function updateDataTables() {
	resetTables(dataTableIDList);

	var genericSequenceColumnData = [
		{
			field: 'sequenceNumber',
			title: 'Sequence',
			sortable: true,
			searchable: true
		},
		{
			field: 'count',
			title: 'Amount',
			sortable: true,
			searchable: false
		},
		{
			field: 'percentage',
			title: 'Percentage',
			sortable: true,
			searchable: false
		}
	];

	// Render Total Sequence Count Data
	var sequenceCountDataAll = getSequenceCountData(cleanSequenceData);
	renderTable('#totalAnalysisResultContainer', 'TOTAL Sequences', sequenceCountDataAll.sequences, genericSequenceColumnData, 'col-12 col-sm-12 col-md-6 col-lg-6 col-xl-6', true, false);
	renderTable('#totalAnalysisResultContainer', 'TOTAL Main Sequences', sequenceCountDataAll.mainSequences, genericSequenceColumnData, 'col-12 col-sm-12 col-md-6 col-lg-6 col-xl-6', true, false);

	// Render Total Sequence Count Data per scenario & setting
	var sequenceCountDataIA = getSequenceCountData(cleanSequenceData, 'individual', 'annotations');
	renderTable('#totalAnalysisResultContainer', 'TOTAL Sequences → Individual | Annotations', sequenceCountDataIA.sequences, genericSequenceColumnData, 'col-12 col-sm-12 col-md-6 col-lg-6 col-xl-6', true, false);
	renderTable('#totalAnalysisResultContainer', 'TOTAL Main Sequences → Individual | Annotations', sequenceCountDataIA.mainSequences, genericSequenceColumnData, 'col-12 col-sm-12 col-md-6 col-lg-6 col-xl-6', true, false);
	var sequenceCountDataIH = getSequenceCountData(cleanSequenceData, 'individual', 'hyperlinks');
	renderTable('#totalAnalysisResultContainer', 'TOTAL Sequences → Individual | Hyperlinks', sequenceCountDataIH.sequences, genericSequenceColumnData, 'col-12 col-sm-12 col-md-6 col-lg-6 col-xl-6', true, false);
	renderTable('#totalAnalysisResultContainer', 'TOTAL Main Sequences → Individual | Hyperlinks', sequenceCountDataIH.mainSequences, genericSequenceColumnData, 'col-12 col-sm-12 col-md-6 col-lg-6 col-xl-6', true, false);
	var sequenceCountDataIC = getSequenceCountData(cleanSequenceData, 'individual', 'controlGroup');
	renderTable('#totalAnalysisResultContainer', 'TOTAL Sequences → Individual | Control Group', sequenceCountDataIC.sequences, genericSequenceColumnData, 'col-12 col-sm-12 col-md-6 col-lg-6 col-xl-6', true, false);
	renderTable('#totalAnalysisResultContainer', 'TOTAL Main Sequences → Individual | Control Group', sequenceCountDataIC.mainSequences, genericSequenceColumnData, 'col-12 col-sm-12 col-md-6 col-lg-6 col-xl-6', true, false);
	var sequenceCountDataCA = getSequenceCountData(cleanSequenceData, 'collaborative', 'annotations');
	renderTable('#totalAnalysisResultContainer', 'TOTAL Sequences → Collaborative | Annotations', sequenceCountDataCA.sequences, genericSequenceColumnData, 'col-12 col-sm-12 col-md-6 col-lg-6 col-xl-6', true, false);
	renderTable('#totalAnalysisResultContainer', 'TOTAL Main Sequences → Collaborative | Annotations', sequenceCountDataCA.mainSequences, genericSequenceColumnData, 'col-12 col-sm-12 col-md-6 col-lg-6 col-xl-6', true, false);
	var sequenceCountDataCH = getSequenceCountData(cleanSequenceData, 'collaborative', 'hyperlinks');
	renderTable('#totalAnalysisResultContainer', 'TOTAL Sequences → Collaborative | Hyperlinks', sequenceCountDataCH.sequences, genericSequenceColumnData, 'col-12 col-sm-12 col-md-6 col-lg-6 col-xl-6', true, false);
	renderTable('#totalAnalysisResultContainer', 'TOTAL Main Sequences → Collaborative | Hyperlinks', sequenceCountDataCH.mainSequences, genericSequenceColumnData, 'col-12 col-sm-12 col-md-6 col-lg-6 col-xl-6', true, false);
	var sequenceCountDataCC = getSequenceCountData(cleanSequenceData, 'collaborative', 'controlGroup');
	renderTable('#totalAnalysisResultContainer', 'TOTAL Sequences → Collaborative | Control Group', sequenceCountDataCC.sequences, genericSequenceColumnData, 'col-12 col-sm-12 col-md-6 col-lg-6 col-xl-6', true, false);
	renderTable('#totalAnalysisResultContainer', 'TOTAL Main Sequences → Collaborative | Control Group', sequenceCountDataCC.mainSequences, genericSequenceColumnData, 'col-12 col-sm-12 col-md-6 col-lg-6 col-xl-6', true, false);

	var mergedSequenceColumnData = [
		{
			field: 'group',
			title: 'Group',
			sortable: true,
			searchable: false
		},
		{
			field: 'user',
			title: 'User',
			sortable: true,
			searchable: true
		},
		{
			field: 'scenario',
			title: 'Task',
			sortable: true,
			searchable: false
		},
		{
			field: 'setting',
			title: 'Setting',
			sortable: true,
			searchable: false
		}
	];
	// Render Sequence Count Data per Sequence
	var mergedTableData = [];
	for (var s = 0; s < cleanSequenceData.length; s++) {
		var sequenceCountData = getSequenceCountData(cleanSequenceData[s]),
			userString = cleanSequenceData[s].fileName.split('_')[0],
			groupString = userString.substring(0, 2),
			scenarioString = '';

		if (groupString == 'IA') {
			groupString = '1';
		} else if (groupString == 'IH') {
			groupString = '2';
		} else if (groupString == 'IC') {
			groupString = '3';
		} else if (groupString == 'CA') {
			groupString = '4';
		} else if (groupString == 'CH') {
			groupString = '5';
		} else if (groupString == 'CC') {
			groupString = '6';
		}

		if (cleanSequenceData[s].scenario == 'annotations') {
			scenarioString = '1';
		} else if (cleanSequenceData[s].scenario == 'hyperlinks') {
			scenarioString = '2';
		} else {
			scenarioString = '3';
		}
		var rowData = {
			'group': groupString,
			'user': userString,
			'scenario': scenarioString,
			'setting': (cleanSequenceData[s].setting == 'individual') ? '1' : '2'
		}

		console.log(sequenceCountData);
		for (var sc = 0; sc < sequenceCountData.sequences.length; sc++) {
			var absoluteFieldName = sequenceCountData.sequences[sc].sequenceNumber + '_absolute';
			if (s === 0) {
				mergedSequenceColumnData.push({
					field: absoluteFieldName,
					title: sequenceCountData.sequences[sc].sequenceNumber + '_abs',
					sortable: true,
					searchable: false
				});
			}
			rowData[absoluteFieldName] = sequenceCountData.sequences[sc].count;
		}
		for (var scm = 0; scm < sequenceCountData.mainSequences.length; scm++) {
			var absoluteFieldName = sequenceCountData.mainSequences[scm].sequenceNumber + '_absolute';
			if (s === 0) {
				mergedSequenceColumnData.push({
					field: absoluteFieldName,
					title: sequenceCountData.mainSequences[scm].sequenceNumber + '_abs',
					sortable: true,
					searchable: false
				});
			}
			rowData[absoluteFieldName] = sequenceCountData.mainSequences[scm].count;
		}
		for (var sc = 0; sc < sequenceCountData.sequences.length; sc++) {
			var relativeFieldName = sequenceCountData.sequences[sc].sequenceNumber + '_relative';
			if (s === 0) {
				mergedSequenceColumnData.push({
					field: relativeFieldName,
					title: sequenceCountData.sequences[sc].sequenceNumber + '_rel',
					sortable: true,
					searchable: false
				});
			}
			rowData[relativeFieldName] = sequenceCountData.sequences[sc].percentage;
		}
		for (var scm = 0; scm < sequenceCountData.mainSequences.length; scm++) {
			var relativeFieldName = sequenceCountData.mainSequences[scm].sequenceNumber + '_relative';	
			if (s === 0) {
				mergedSequenceColumnData.push({
					field: relativeFieldName,
					title: sequenceCountData.mainSequences[scm].sequenceNumber + '_rel',
					sortable: true,
					searchable: false
				});
			}
			rowData[relativeFieldName] = sequenceCountData.mainSequences[scm].percentage;
		}

		mergedTableData.push(rowData);
	}
	
	renderTable('#singleAnalysisResultContainer', '', mergedTableData, mergedSequenceColumnData, 'col-12', true, false);
	/*
	renderTable('#singleAnalysisResultContainer', cleanSequenceData[s].fileName +' Sequences', sequenceCountData.sequences, genericSequenceColumnData, 'col-12 col-sm-12 col-md-6 col-lg-6 col-xl-6', true, false);
	renderTable('#singleAnalysisResultContainer', cleanSequenceData[s].fileName +' Main Sequences', sequenceCountData.mainSequences, genericSequenceColumnData, 'col-12 col-sm-12 col-md-6 col-lg-6 col-xl-6', true, false);
	*/

	// Render Action Data
	var genericActionColumnData = [
		{
			field: 'actionsUsed',
			title: 'Used Actions',
			sortable: true,
			searchable: false
		},
		{
			field: 'actionsNotUsed',
			title: 'Actions not used',
			sortable: true,
			searchable: false
		},
		{
			field: 'actionsTotal',
			title: 'TOTAL Actions',
			sortable: true,
			searchable: false
		},
		{
			field: 'actionsUsedPercent',
			title: 'Percentage Used Actions',
			sortable: true,
			searchable: false
		}
	];
	var genericActionTypeColumnData = [
		{
			field: 'actionName',
			title: 'Action',
			sortable: true,
			searchable: true,
			footerFormatter: function(items) {
				return 'TOTAL';
			}
		},
		{
			field: 'countTotal',
			title: 'Total amount',
			sortable: true,
			searchable: false,
			footerFormatter: function(items) {
				var totalCount = 0;
				items.forEach(function(item) {
					totalCount = totalCount + item.countTotal;
				});
				return totalCount;
			}
		},
		{
			field: 'countUsed',
			title: 'Amount used',
			sortable: true,
			searchable: false,
			footerFormatter: function(items) {
				var totalCount = 0;
				items.forEach(function(item) {
					totalCount = totalCount + item.countUsed;
				});
				return totalCount;
			}
		},
		{
			field: 'percentageUsed',
			title: 'Percentage used',
			sortable: true,
			searchable: false,
			footerFormatter: function(items) {
				var totalCount = 0;
				items.forEach(function(item) {
					totalCount = totalCount + item.percentageUsed;
				});
				return Math.round(totalCount*100)/100;
			}
		},
		{
			field: 'percentageTotal',
			title: 'Percentage total',
			sortable: true,
			searchable: false,
			footerFormatter: function(items) {
				var totalCount = 0;
				items.forEach(function(item) {
					totalCount = totalCount + item.percentageTotal;
				});
				return Math.round(totalCount*100)/100;
			}
		}
	];
	renderTable('#actionDataResultContainer', 'TOTAL Actions used', sequenceCountDataAll.actions, genericActionTypeColumnData, 'col-12', true, true);
	renderTable('#actionDataResultContainer', 'Actions used  → Individual | Annotations', sequenceCountDataIA.actions, genericActionTypeColumnData, 'col-12', true, true);
	renderTable('#actionDataResultContainer', 'Actions used → Individual | Hyperlinks', sequenceCountDataIH.actions, genericActionTypeColumnData, 'col-12', true, true);
	renderTable('#actionDataResultContainer', 'Actions used → Individual | Control Group', sequenceCountDataIC.actions, genericActionTypeColumnData, 'col-12', true, true);
	renderTable('#actionDataResultContainer', 'Actions used → Collaborative | Annotations', sequenceCountDataCA.actions, genericActionTypeColumnData, 'col-12', true, true);
	renderTable('#actionDataResultContainer', 'Actions used → Collaborative | Hyperlinks', sequenceCountDataCH.actions, genericActionTypeColumnData, 'col-12', true, true);
	renderTable('#actionDataResultContainer', 'Actions used → Collaborative | Control Group', sequenceCountDataCC.actions, genericActionTypeColumnData, 'col-12', true, true);

	var markovSequenceColumnData = [
		{
			field: 'sequenceNumber',
			title: '',
			sortable: false,
			searchable: false,
			class: 'font-weight-bold'
		},
		{
			field: '1.1',
			title: '1.1',
			sortable: false,
			searchable: false
		},
		{
			field: '1.2',
			title: '1.2',
			sortable: false,
			searchable: false
		},
		{
			field: '1.3',
			title: '1.3',
			sortable: false,
			searchable: false
		},
		{
			field: '1.4',
			title: '1.4',
			sortable: false,
			searchable: false
		},
		{
			field: '2.1',
			title: '2.1',
			sortable: false,
			searchable: false
		},
		{
			field: '2.2',
			title: '2.2',
			sortable: false,
			searchable: false
		},
		{
			field: '2.3',
			title: '2.3',
			sortable: false,
			searchable: false
		},
		{
			field: '3.1',
			title: '3.1',
			sortable: false,
			searchable: false
		},
		{
			field: '3.2',
			title: '3.2',
			sortable: false,
			searchable: false
		},
		{
			field: '3.3',
			title: '3.3',
			sortable: false,
			searchable: false
		},
		{
			field: '3.4',
			title: '3.4',
			sortable: false,
			searchable: false
		},
		{
			field: '4.1',
			title: '4.1',
			sortable: false,
			searchable: false
		},
		{
			field: '4.2',
			title: '4.2',
			sortable: false,
			searchable: false
		},
		{
			field: '4.3',
			title: '4.3',
			sortable: false,
			searchable: false
		},
		{
			field: '5.1',
			title: '5.1',
			sortable: false,
			searchable: false
		},
		{
			field: '5.2',
			title: '5.2',
			sortable: false,
			searchable: false
		},
		{
			field: '5.3',
			title: '5.3',
			sortable: false,
			searchable: false
		}
	];
	var markovMainSequenceColumnData = [
		{
			field: 'sequenceNumber',
			title: '',
			sortable: false,
			searchable: false,
			class: 'font-weight-bold'
		},
		{
			field: '1',
			title: '1',
			sortable: false,
			searchable: false
		},
		{
			field: '2',
			title: '2',
			sortable: false,
			searchable: false
		},
		{
			field: '3',
			title: '3',
			sortable: false,
			searchable: false
		},
		{
			field: '4',
			title: '4',
			sortable: false,
			searchable: false
		},
		{
			field: '5',
			title: '5',
			sortable: false,
			searchable: false
		}
	];
	var markovActionColumnData = [
		{
			field: 'actionName',
			title: '',
			sortable: false,
			searchable: false,
			class: 'font-weight-bold'
		},
		{
			field: 'VideoPlay',
			title: 'VideoPlay',
			sortable: false,
			searchable: false
		},
		{
			field: 'VideoPause',
			title: 'VideoPause',
			sortable: false,
			searchable: false
		},
		{
			field: 'VideoJumpBackward',
			title: 'VideoJumpBackward',
			sortable: false,
			searchable: false
		},
		{
			field: 'VideoJumpForward',
			title: 'VideoJumpForward',
			sortable: false,
			searchable: false
		},
		{
			field: 'AnnotationAdd',
			title: 'AnnotationAdd',
			sortable: false,
			searchable: false
		},
		{
			field: 'AnnotationChangeText',
			title: 'AnnotationChangeText',
			sortable: false,
			searchable: false
		},
		{
			field: 'AnnotationChangeTime',
			title: 'AnnotationChangeTime',
			sortable: false,
			searchable: false
		}
	];

	renderTable('#transitionMatrixResultContainer', 'Transition Matrix → Actions', sequenceCountDataAll.MarkovChainData.actions, markovActionColumnData, 'col-12', false, false, true);
	renderTable('#transitionMatrixResultContainer', 'Transition Matrix → Sequences', sequenceCountDataAll.MarkovChainData.sequences, markovSequenceColumnData, 'col-12', false, false, true);
	renderTable('#transitionMatrixResultContainer', 'Transition Matrix → Main Sequences', sequenceCountDataAll.MarkovChainData.mainSequences, markovMainSequenceColumnData, 'col-12', false, false, true);
}

function getSequenceCountData(data, setting, scenario) {
	var returnData = {
		'sequences': [],
		'mainSequences': [],
		'actions': [],
		'statistics': [{
			'actionsTotal': 0,
			'actionsUsed': 0,
			'actionsUsedPercent': 0,
			'actionsNotUsed': 0
		}],
		'MarkovChainData': {
			'sequences': [],
			'mainSequences': [],
			'actions': []
		}
	};
	var countsPerSequence = {
		"1.1": 0,
		"1.2": 0,
		"1.3": 0,
		"1.4": 0,
		"2.1": 0,
		"2.2": 0,
		"2.3": 0,
		"3.1": 0,
		"3.2": 0,
		"3.3": 0,
		"3.4": 0,
		"4.1": 0,
		"4.2": 0,
		"4.3": 0,
		"5.1": 0,
		"5.2": 0,
		"5.3": 0
    };
    var countsPerMainSequence = {
		"1": 0,
		"2": 0,
		"3": 0,
		"4": 0,
		"5": 0
    };
    var countsPerAction = {
		'VideoPlay': 0,
		'VideoPause': 0,
		'VideoJumpBackward': 0,
		'VideoJumpForward': 0,
		'AnnotationAdd': 0,
		'AnnotationChangeText': 0,
		'AnnotationChangeTime': 0
	};
	var countsPerUsedAction = {
		'VideoPlay': 0,
		'VideoPause': 0,
		'VideoJumpBackward': 0,
		'VideoJumpForward': 0,
		'AnnotationAdd': 0,
		'AnnotationChangeText': 0,
		'AnnotationChangeTime': 0
	};

	var markovCountsPerSequence = {
		"1.1": Object.assign({}, countsPerSequence),
		"1.2": Object.assign({}, countsPerSequence),
		"1.3": Object.assign({}, countsPerSequence),
		"1.4": Object.assign({}, countsPerSequence),
		"2.1": Object.assign({}, countsPerSequence),
		"2.2": Object.assign({}, countsPerSequence),
		"2.3": Object.assign({}, countsPerSequence),
		"3.1": Object.assign({}, countsPerSequence),
		"3.2": Object.assign({}, countsPerSequence),
		"3.3": Object.assign({}, countsPerSequence),
		"3.4": Object.assign({}, countsPerSequence),
		"4.1": Object.assign({}, countsPerSequence),
		"4.2": Object.assign({}, countsPerSequence),
		"4.3": Object.assign({}, countsPerSequence),
		"5.1": Object.assign({}, countsPerSequence),
		"5.2": Object.assign({}, countsPerSequence),
		"5.3": Object.assign({}, countsPerSequence)
    };
    var markovCountsPerMainSequence = {
		"1": Object.assign({}, countsPerMainSequence),
		"2": Object.assign({}, countsPerMainSequence),
		"3": Object.assign({}, countsPerMainSequence),
		"4": Object.assign({}, countsPerMainSequence),
		"5": Object.assign({}, countsPerMainSequence)
    };
    var markovCountsPerAction = {
		'VideoPlay': Object.assign({}, countsPerAction),
		'VideoPause': Object.assign({}, countsPerAction),
		'VideoJumpBackward': Object.assign({}, countsPerAction),
		'VideoJumpForward': Object.assign({}, countsPerAction),
		'AnnotationAdd': Object.assign({}, countsPerAction),
		'AnnotationChangeText': Object.assign({}, countsPerAction),
		'AnnotationChangeTime': Object.assign({}, countsPerAction)
    };

   	var totalSequenceCount = 0;

	// iterate files
	if (Array.isArray(data)) {
		for (var i = 0; i < data.length; i++) {
			//console.log(data[i].fileName);
			
			if ((setting && setting != data[i].setting) || (scenario && scenario != data[i].scenario)) {
				continue;
			}
			returnData.statistics[0].actionsTotal += data[i].actions.length;
			// iterate actions
			for (var ta = 0; ta < data[i].actions.length; ta++) {
				countsPerAction[data[i].actions[ta].Aktion]++;

				var nextAction = (ta < data[i].actions.length - 1) ? data[i].actions[(ta+1)] : null;
				if (nextAction) {
					markovCountsPerAction[data[i].actions[ta].Aktion][nextAction.Aktion]++;
				}
			}
			// iterate sequences
			for (var s = 0; s < data[i].sequences.length; s++) {
				var currentSequence = data[i].sequences[s];
				var currentMainSequenceNumber = currentSequence.sequenceNumber.split('.')[0];

				var nextSequence = (s < data[i].sequences.length - 1) ? data[i].sequences[(s+1)] : null;
				if (nextSequence) {
					var nextMainSequenceNumber = nextSequence.sequenceNumber.split('.')[0];

					markovCountsPerSequence[currentSequence.sequenceNumber][nextSequence.sequenceNumber]++;
					markovCountsPerMainSequence[currentMainSequenceNumber][nextMainSequenceNumber]++;
				}

				countsPerSequence[currentSequence.sequenceNumber]++;
				countsPerMainSequence[currentMainSequenceNumber]++;
				totalSequenceCount++;
				returnData.statistics[0].actionsUsed += (currentSequence.actionIndexTo - currentSequence.actionIndexFrom + 1);
				for (var a = 0; a < currentSequence.actions.length; a++) {
					countsPerUsedAction[currentSequence.actions[a].Aktion]++;
				}
			}
		}
	} else {
		
		if ((setting && setting != data[i].setting) || (scenario && scenario != data[i].scenario)) {
			// do nothing
		} else {
			returnData.statistics[0].actionsTotal += data.actions.length;
			// iterate actions
			for (var ta = 0; ta < data.actions.length; ta++) {
				countsPerAction[data.actions[ta].Aktion]++;

				var nextAction = (ta < data.actions.length - 1) ? data.actions[(ta+1)] : null;
				if (nextAction) {
					markovCountsPerAction[data.actions[ta].Aktion][nextAction.Aktion]++;
				}
			}
			for (var s = 0; s < data.sequences.length; s++) {
				var currentSequence = data.sequences[s];
				var currentMainSequenceNumber = currentSequence.sequenceNumber.split('.')[0];

				var nextSequence = (s < data.sequences.length - 1) ? data.sequences[(s+1)] : null;
				if (nextSequence) {
					var nextMainSequenceNumber = nextSequence.sequenceNumber.split('.')[0];

					markovCountsPerSequence[currentSequence.sequenceNumber][nextSequence.sequenceNumber]++;
					markovCountsPerMainSequence[currentMainSequenceNumber][nextMainSequenceNumber]++;
				}

				countsPerSequence[currentSequence.sequenceNumber]++;
				countsPerMainSequence[currentMainSequenceNumber]++;
				totalSequenceCount++;
				returnData.statistics[0].actionsUsed += (currentSequence.actionIndexTo - currentSequence.actionIndexFrom + 1);
				for (var a = 0; a < currentSequence.actions.length; a++) {
					countsPerUsedAction[currentSequence.actions[a].Aktion]++;
				}
			}
		}
	}

	returnData.statistics[0].actionsNotUsed = returnData.statistics[0].actionsTotal - returnData.statistics[0].actionsUsed;

	var usedPercentage = 100*(returnData.statistics[0].actionsUsed/returnData.statistics[0].actionsTotal)
	returnData.statistics[0].actionsUsedPercent = Math.round(usedPercentage*100)/100;
	

	//iterate countsPerSequence 
	for (var sequenceNumber in countsPerSequence) {
		// push to table data
		var percentage = (totalSequenceCount == 0) ? 0 : 100*(countsPerSequence[sequenceNumber]/totalSequenceCount);
		returnData.sequences.push({
			'sequenceNumber': sequenceNumber,
			'count': countsPerSequence[sequenceNumber],
			'percentage': Math.round(percentage*100)/100
		});
	}

	//iterate countsPerMainSequence 
	for (var sequenceNumber in countsPerMainSequence) {
		// push to table data
		var percentage = (totalSequenceCount == 0) ? 0 : 100*(countsPerMainSequence[sequenceNumber]/totalSequenceCount);
		returnData.mainSequences.push({
			'sequenceNumber': sequenceNumber,
			'count': countsPerMainSequence[sequenceNumber],
			'percentage': Math.round(percentage*100)/100
		});
	}

	//iterate countsPerAction 
	for (var actionName in countsPerAction) {
		// push to table data
		var percentageTotal = (returnData.statistics[0].actionsTotal == 0) ? 0 : 100*(countsPerAction[actionName]/returnData.statistics[0].actionsTotal);
		var percentageUsed = (returnData.statistics[0].actionsTotal == 0) ? 0 : 100*(countsPerUsedAction[actionName]/returnData.statistics[0].actionsTotal);
		returnData.actions.push({
			'actionName': actionName,
			'countTotal': countsPerAction[actionName],
			'countUsed': countsPerUsedAction[actionName],
			'percentageTotal': percentageTotal,
			'percentageUsed': percentageUsed
		});
	}

	//iterate markovCountsPerSequence 
	for (var sequenceNumber in markovCountsPerSequence) {
		// push to table data
		var mergedData = markovCountsPerSequence[sequenceNumber];
		mergedData.sequenceNumber = sequenceNumber;
		returnData.MarkovChainData.sequences.push(mergedData);
	}

	//iterate markovCountsPerMainSequence 
	for (var sequenceNumber in markovCountsPerMainSequence) {
		// push to table data
		var mergedData = markovCountsPerMainSequence[sequenceNumber];
		mergedData.sequenceNumber = sequenceNumber;
		returnData.MarkovChainData.mainSequences.push(mergedData);
	}

	//iterate markovCountsPerAction 
	for (var actionName in markovCountsPerAction) {
		// push to table data
		var mergedData = markovCountsPerAction[actionName];
		mergedData.actionName = actionName;
		returnData.MarkovChainData.actions.push(mergedData);
	}

	console.log(returnData);

	return returnData;
}