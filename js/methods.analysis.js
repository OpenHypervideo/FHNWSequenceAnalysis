// Data Analysis Methods

var dataTableIDList = [],
	sequenceCountDataAll,
	sequenceCountDataIA,
	sequenceCountDataIH,
	sequenceCountDataIC,
	sequenceCountDataCA,
	sequenceCountDataCH,
	sequenceCountDataCC;

function updateDataTables() {
	resetTables(dataTableIDList);

	// Get Sequence Count Data (global vars)
	sequenceCountDataAll = getSequenceCountData(cleanSequenceData);
	sequenceCountDataIA = getSequenceCountData(cleanSequenceData, 'individual', 'annotations');
	sequenceCountDataIH = getSequenceCountData(cleanSequenceData, 'individual', 'hyperlinks');
	sequenceCountDataIC = getSequenceCountData(cleanSequenceData, 'individual', 'controlGroup');
	sequenceCountDataCA = getSequenceCountData(cleanSequenceData, 'collaborative', 'annotations');
	sequenceCountDataCH = getSequenceCountData(cleanSequenceData, 'collaborative', 'hyperlinks');
	sequenceCountDataCC = getSequenceCountData(cleanSequenceData, 'collaborative', 'controlGroup');
	
	// Render Sequence Count Data per Sequence
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
	renderTable('#singleAnalysisResultContainer', cleanSequenceData[s].fileName +' Behaviour Patterns', sequenceCountData.mainSequences, genericSequenceColumnData, 'col-12 col-sm-12 col-md-6 col-lg-6 col-xl-6', true, false);
	*/

	// Render Action Data
	renderTable('#actionDataResultContainer', 'TOTAL Actions used', sequenceCountDataAll.actions, genericActionTypeColumnData, 'col-12', true, true);
	renderTable('#actionDataResultContainer', 'Actions used  → Individual | Annotations', sequenceCountDataIA.actions, genericActionTypeColumnData, 'col-12', true, true);
	renderTable('#actionDataResultContainer', 'Actions used → Individual | Hyperlinks', sequenceCountDataIH.actions, genericActionTypeColumnData, 'col-12', true, true);
	renderTable('#actionDataResultContainer', 'Actions used → Individual | Control Group', sequenceCountDataIC.actions, genericActionTypeColumnData, 'col-12', true, true);
	renderTable('#actionDataResultContainer', 'Actions used → Collaborative | Annotations', sequenceCountDataCA.actions, genericActionTypeColumnData, 'col-12', true, true);
	renderTable('#actionDataResultContainer', 'Actions used → Collaborative | Hyperlinks', sequenceCountDataCH.actions, genericActionTypeColumnData, 'col-12', true, true);
	renderTable('#actionDataResultContainer', 'Actions used → Collaborative | Control Group', sequenceCountDataCC.actions, genericActionTypeColumnData, 'col-12', true, true);

	// Render Colored Transition Matrices
	//renderTable('#transitionMatrixColoredResultContainer', 'Transition Matrix → Actions', sequenceCountDataAll.MarkovChainData.actions, coloredMarkovActionColumnData, 'col-12', false, false, true);
	//renderTable('#transitionMatrixColoredResultContainer', 'Transition Matrix → Behaviour Sequences', sequenceCountDataAll.MarkovChainData.sequences, coloredMarkovSequenceColumnData, 'col-12', false, false, true);
	//renderTable('#transitionMatrixColoredResultContainer', 'Transition Matrix → Behaviour Patterns', sequenceCountDataAll.MarkovChainData.mainSequences, coloredMarkovMainSequenceColumnData, 'col-12', false, false, true);

	// Render Summarized Transition Matrices
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
		},
		{
			field: 'totalRowCount',
			title: 'TOTAL (abs)',
			sortable: false,
			searchable: false,
			class: 'font-weight-bold'
		},
		{
			field: '1.1_rel',
			title: '1.1_rel',
			sortable: false,
			searchable: false
		},
		{
			field: '1.2_rel',
			title: '1.2_rel',
			sortable: false,
			searchable: false
		},
		{
			field: '1.3_rel',
			title: '1.3_rel',
			sortable: false,
			searchable: false
		},
		{
			field: '1.4_rel',
			title: '1.4_rel',
			sortable: false,
			searchable: false
		},
		{
			field: '2.1_rel',
			title: '2.1_rel',
			sortable: false,
			searchable: false
		},
		{
			field: '2.2_rel',
			title: '2.2_rel',
			sortable: false,
			searchable: false
		},
		{
			field: '2.3_rel',
			title: '2.3_rel',
			sortable: false,
			searchable: false
		},
		{
			field: '3.1_rel',
			title: '3.1_rel',
			sortable: false,
			searchable: false
		},
		{
			field: '3.2_rel',
			title: '3.2_rel',
			sortable: false,
			searchable: false
		},
		{
			field: '3.3_rel',
			title: '3.3_rel',
			sortable: false,
			searchable: false
		},
		{
			field: '3.4_rel',
			title: '3.4_rel',
			sortable: false,
			searchable: false
		},
		{
			field: '4.1_rel',
			title: '4.1_rel',
			sortable: false,
			searchable: false
		},
		{
			field: '4.2_rel',
			title: '4.2_rel',
			sortable: false,
			searchable: false
		},
		{
			field: '4.3_rel',
			title: '4.3_rel',
			sortable: false,
			searchable: false
		},
		{
			field: '5.1_rel',
			title: '5.1_rel',
			sortable: false,
			searchable: false
		},
		{
			field: '5.2_rel',
			title: '5.2_rel',
			sortable: false,
			searchable: false
		},
		{
			field: '5.3_rel',
			title: '5.3_rel',
			sortable: false,
			searchable: false
		},
		{
			field: 'totalRowCountRelative',
			title: 'TOTAL (rel)',
			sortable: false,
			searchable: false,
			class: 'font-weight-bold'
		},
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
		},
		{
			field: 'totalRowCount',
			title: 'TOTAL (abs)',
			sortable: false,
			searchable: false,
			class: 'font-weight-bold'
		},
		{
			field: '1_rel',
			title: '1_rel',
			sortable: false,
			searchable: false
		},
		{
			field: '2_rel',
			title: '2_rel',
			sortable: false,
			searchable: false
		},
		{
			field: '3_rel',
			title: '3_rel',
			sortable: false,
			searchable: false
		},
		{
			field: '4_rel',
			title: '4_rel',
			sortable: false,
			searchable: false
		},
		{
			field: '5_rel',
			title: '5_rel',
			sortable: false,
			searchable: false
		},
		{
			field: 'totalRowCountRelative',
			title: 'TOTAL (rel)',
			sortable: false,
			searchable: false,
			class: 'font-weight-bold'
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
		},
		{
			field: 'totalRowCount',
			title: 'TOTAL (abs)',
			sortable: false,
			searchable: false,
			class: 'font-weight-bold'
		},
		{
			field: 'VideoPlay_rel',
			title: 'VideoPlay_rel',
			sortable: false,
			searchable: false
		},
		{
			field: 'VideoPause_rel',
			title: 'VideoPause_rel',
			sortable: false,
			searchable: false
		},
		{
			field: 'VideoJumpBackward_rel',
			title: 'VideoJumpBackward_rel',
			sortable: false,
			searchable: false
		},
		{
			field: 'VideoJumpForward_rel',
			title: 'VideoJumpForward_rel',
			sortable: false,
			searchable: false
		},
		{
			field: 'AnnotationAdd_rel',
			title: 'AnnotationAdd_rel',
			sortable: false,
			searchable: false
		},
		{
			field: 'AnnotationChangeText_rel',
			title: 'AnnotationChangeText_rel',
			sortable: false,
			searchable: false
		},
		{
			field: 'AnnotationChangeTime_rel',
			title: 'AnnotationChangeTime_rel',
			sortable: false,
			searchable: false
		},
		{
			field: 'totalRowCountRelative',
			title: 'TOTAL (rel)',
			sortable: false,
			searchable: false,
			class: 'font-weight-bold'
		}
	];

	renderTable('#transitionMatrixResultContainer', 'Transition Matrix → Actions', sequenceCountDataAll.MarkovChainData.actions, markovActionColumnData, 'col-12', false, false, true);
	renderTable('#transitionMatrixResultContainer', 'Transition Matrix → Behaviour Sequences', sequenceCountDataAll.MarkovChainData.sequences, markovSequenceColumnData, 'col-12', false, false, true);
	renderTable('#transitionMatrixResultContainer', 'Transition Matrix → Behaviour Patterns', sequenceCountDataAll.MarkovChainData.mainSequences, markovMainSequenceColumnData, 'col-12', false, false, true);
	renderTable('#transitionMatrixResultContainer', 'Transition Matrix → Behaviour Sequences: Individual | Annotations', sequenceCountDataIA.MarkovChainData.sequences, markovSequenceColumnData, 'col-12', false, false, true);
	renderTable('#transitionMatrixResultContainer', 'Transition Matrix → Behaviour Sequences: Individual | Hyperlinks', sequenceCountDataIH.MarkovChainData.sequences, markovSequenceColumnData, 'col-12', false, false, true);
	renderTable('#transitionMatrixResultContainer', 'Transition Matrix → Behaviour Sequences: Individual | Control Group', sequenceCountDataIC.MarkovChainData.sequences, markovSequenceColumnData, 'col-12', false, false, true);
	renderTable('#transitionMatrixResultContainer', 'Transition Matrix → Behaviour Sequences: Collaborative | Annotations', sequenceCountDataCA.MarkovChainData.sequences, markovSequenceColumnData, 'col-12', false, false, true);
	renderTable('#transitionMatrixResultContainer', 'Transition Matrix → Behaviour Sequences: Collaborative | Hyperlinks', sequenceCountDataCH.MarkovChainData.sequences, markovSequenceColumnData, 'col-12', false, false, true);
	renderTable('#transitionMatrixResultContainer', 'Transition Matrix → Behaviour Sequences: Collaborative | Control Group', sequenceCountDataCC.MarkovChainData.sequences, markovSequenceColumnData, 'col-12', false, false, true);
}

function getSequenceCountData(data, setting, scenario, fileName) {
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
			
			if ((setting && setting != data[i].setting) || (scenario && scenario != data[i].scenario) || (fileName && fileName != data[i].fileName)) {
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
		
		if ((setting && setting != data[i].setting) || (scenario && scenario != data[i].scenario) || (fileName && fileName != data[i].fileName)) {
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
	returnData.statistics[0].actionsUsedPercent = Math.round(usedPercentage*1000)/1000;
	

	//iterate countsPerSequence 
	for (var sequenceNumber in countsPerSequence) {
		// push to table data
		var percentage = (totalSequenceCount == 0) ? 0 : 100*(countsPerSequence[sequenceNumber]/totalSequenceCount);
		returnData.sequences.push({
			'sequenceNumber': sequenceNumber,
			'sequenceLabel': getSequenceLabel(sequenceNumber),
			'count': countsPerSequence[sequenceNumber],
			'percentage': Math.round(percentage*1000)/1000
		});
	}

	//iterate countsPerMainSequence 
	for (var sequenceNumber in countsPerMainSequence) {
		// push to table data
		var percentage = (totalSequenceCount == 0) ? 0 : 100*(countsPerMainSequence[sequenceNumber]/totalSequenceCount);
		returnData.mainSequences.push({
			'sequenceNumber': sequenceNumber,
			'sequenceLabel': getSequenceLabel(sequenceNumber),
			'count': countsPerMainSequence[sequenceNumber],
			'percentage': Math.round(percentage*1000)/1000
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
		var totalCount = 0;
		for (var sequenceCountNumber in mergedData) {
			totalCount += mergedData[sequenceCountNumber];
		}
		for (var sequenceCountNumber in mergedData) {
			mergedData[sequenceCountNumber+'_rel'] = (totalCount == 0) ? 0 : Math.round((mergedData[sequenceCountNumber] / totalCount)*1000)/1000;
		}
		mergedData.totalRowCount = totalCount;
		mergedData.totalRowCountRelative = (totalCount == 0) ? 0 : 1;
		mergedData.sequenceNumber = sequenceNumber;
		mergedData.sequenceLabel = getSequenceLabel(sequenceNumber);
		returnData.MarkovChainData.sequences.push(mergedData);
	}

	//iterate markovCountsPerMainSequence 
	for (var sequenceNumber in markovCountsPerMainSequence) {
		// push to table data
		var mergedData = markovCountsPerMainSequence[sequenceNumber];
		var totalCount = 0;
		for (var sequenceCountNumber in mergedData) {
			totalCount += mergedData[sequenceCountNumber];
		}
		for (var sequenceCountNumber in mergedData) {
			mergedData[sequenceCountNumber+'_rel'] = (totalCount == 0) ? 0 : Math.round((mergedData[sequenceCountNumber] / totalCount)*1000)/1000;
		}
		mergedData.totalRowCount = totalCount;
		mergedData.totalRowCountRelative = (totalCount == 0) ? 0 : 1;
		mergedData.sequenceNumber = sequenceNumber;
		mergedData.sequenceLabel = getSequenceLabel(sequenceNumber);
		returnData.MarkovChainData.mainSequences.push(mergedData);
	}

	//iterate markovCountsPerAction 
	for (var actionName in markovCountsPerAction) {
		// push to table data
		var mergedData = markovCountsPerAction[actionName];
		var totalCount = 0;
		for (var actionNameCount in mergedData) {
			totalCount += mergedData[actionNameCount];
		}
		for (var actionNameCount in mergedData) {
			mergedData[actionNameCount+'_rel'] = (totalCount == 0) ? 0 : Math.round((mergedData[actionNameCount] / totalCount)*1000)/1000;
		}
		mergedData.totalRowCount = totalCount;
		mergedData.totalRowCountRelative = (totalCount == 0) ? 0 : 1;
		mergedData.actionName = actionName;
		returnData.MarkovChainData.actions.push(mergedData);
	}

	//console.log(returnData);

	return returnData;
}