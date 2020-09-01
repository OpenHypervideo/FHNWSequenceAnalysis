// Data Analysis Methods

var dataTableIDList = [];

function updateDataTables() {
	resetTables(dataTableIDList);

	var genericSequenceColumnData = [
		{
			field: 'sequenceNumber',
			title: 'Sequenz',
			sortable: true,
			searchable: true
		},
		{
			field: 'count',
			title: 'Anzahl',
			sortable: true,
			searchable: false
		},
		{
			field: 'percentage',
			title: 'Prozent',
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

	// Render Sequence Count Data per Sequence
	for (var s = 0; s < cleanSequenceData.length; s++) {
		var sequenceCountData = getSequenceCountData(cleanSequenceData[s]);
		renderTable('#singleAnalysisResultContainer', cleanSequenceData[s].fileName +' Sequences', sequenceCountData.sequences, genericSequenceColumnData, 'col-12 col-sm-12 col-md-6 col-lg-6 col-xl-6', true, false);
		renderTable('#singleAnalysisResultContainer', cleanSequenceData[s].fileName +' Main Sequences', sequenceCountData.mainSequences, genericSequenceColumnData, 'col-12 col-sm-12 col-md-6 col-lg-6 col-xl-6', true, false);
	}

	// Render Action Data
	var genericActionColumnData = [
		{
			field: 'actionsUsed',
			title: 'Verwendete Aktionen',
			sortable: true,
			searchable: false
		},
		{
			field: 'actionsNotUsed',
			title: 'Nicht verwendete Aktionen',
			sortable: true,
			searchable: false
		},
		{
			field: 'actionsTotal',
			title: 'Aktionen insgesamt',
			sortable: true,
			searchable: false
		},
		{
			field: 'actionsUsedPercent',
			title: 'Prozent verwendete Aktionen',
			sortable: true,
			searchable: false
		}
	];
	var genericActionTypeColumnData = [
		{
			field: 'actionName',
			title: 'Aktion',
			sortable: true,
			searchable: true,
			footerFormatter: function(items) {
				return 'TOTAL';
			}
		},
		{
			field: 'countTotal',
			title: 'Anzahl gesamt',
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
			title: 'Anzahl verwendet',
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
			title: 'Prozent verwendet',
			sortable: true,
			searchable: false,
			footerFormatter: function(items) {
				var totalCount = 0;
				items.forEach(function(item) {
					totalCount = totalCount + item.percentageUsed;
				});
				return totalCount;
			}
		},
		{
			field: 'percentageTotal',
			title: 'Prozent gesamt',
			sortable: true,
			searchable: false,
			footerFormatter: function(items) {
				var totalCount = 0;
				items.forEach(function(item) {
					totalCount = totalCount + item.percentageTotal;
				});
				return totalCount;
			}
		}
	];
	renderTable('#actionDataResultContainer', 'TOTAL Actions used', sequenceCountDataAll.actions, genericActionTypeColumnData, 'col-12', true, true);
	renderTable('#actionDataResultContainer', 'Actions used → Individual | Annotations', sequenceCountDataIA.actions, genericActionTypeColumnData, 'col-12', true, true);
	renderTable('#actionDataResultContainer', 'Actions used → Individual | Hyperlinks', sequenceCountDataIH.actions, genericActionTypeColumnData, 'col-12', true, true);
	renderTable('#actionDataResultContainer', 'Actions used → Individual | Control Group', sequenceCountDataIC.actions, genericActionTypeColumnData, 'col-12', true, true);
	renderTable('#actionDataResultContainer', 'Actions used → Collaborative | Annotations', sequenceCountDataCA.actions, genericActionTypeColumnData, 'col-12', true, true);
	renderTable('#actionDataResultContainer', 'Actions used → Collaborative | Hyperlinks', sequenceCountDataCH.actions, genericActionTypeColumnData, 'col-12', true, true);
	renderTable('#actionDataResultContainer', 'Actions used → Collaborative | Control Group', sequenceCountDataCC.actions, genericActionTypeColumnData, 'col-12', true, true);
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
		}]
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
			}
			// iterate sequences
			for (var s = 0; s < data[i].sequences.length; s++) {
				var currentSequence = data[i].sequences[s];
				var currentMainSequenceNumber = currentSequence.sequenceNumber.split('.')[0];
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
			}
			for (var s = 0; s < data.sequences.length; s++) {
				var currentSequence = data.sequences[s];
				var currentMainSequenceNumber = currentSequence.sequenceNumber.split('.')[0];
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
		var percentage = 100*(countsPerSequence[sequenceNumber]/totalSequenceCount);
		returnData.sequences.push({
			'sequenceNumber': sequenceNumber,
			'count': countsPerSequence[sequenceNumber],
			'percentage': Math.round(percentage*100)/100
		});
	}

	//iterate countsPerMainSequence 
	for (var sequenceNumber in countsPerMainSequence) {
		// push to table data
		var percentage = 100*(countsPerMainSequence[sequenceNumber]/totalSequenceCount);
		returnData.mainSequences.push({
			'sequenceNumber': sequenceNumber,
			'count': countsPerMainSequence[sequenceNumber],
			'percentage': Math.round(percentage*100)/100
		});
	}

	//iterate countsPerAction 
	for (var actionName in countsPerAction) {
		// push to table data
		var percentageTotal = 100*(countsPerAction[actionName]/returnData.statistics[0].actionsTotal);
		var percentageUsed = 100*(countsPerUsedAction[actionName]/returnData.statistics[0].actionsTotal);
		returnData.actions.push({
			'actionName': actionName,
			'countTotal': countsPerAction[actionName],
			'countUsed': countsPerUsedAction[actionName],
			'percentageTotal': percentageTotal,
			'percentageUsed': percentageUsed
		});
	}

	return returnData;
}