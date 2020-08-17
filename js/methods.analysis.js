// Data Analysis Methods

var dataTableIDList = [];

function updateDataTables() {
	resetTables(dataTableIDList);

	var genericColumnData = [
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
	renderTable('#totalAnalysisResultContainer', 'TOTAL Sequences', sequenceCountDataAll.sequences, genericColumnData, 'col-12 col-sm-12 col-md-6 col-lg-6 col-xl-6');
	renderTable('#totalAnalysisResultContainer', 'TOTAL Main Sequences', sequenceCountDataAll.mainSequences, genericColumnData, 'col-12 col-sm-12 col-md-6 col-lg-6 col-xl-6');

	// Render Total Sequence Count Data per scenario & setting
	var sequenceCountDataIA = getSequenceCountData(cleanSequenceData, 'individual', 'annotations');
	renderTable('#totalAnalysisResultContainer', 'TOTAL Sequences → Individual | Annotations', sequenceCountDataIA.sequences, genericColumnData, 'col-12 col-sm-12 col-md-6 col-lg-6 col-xl-6');
	renderTable('#totalAnalysisResultContainer', 'TOTAL Main Sequences → Individual | Annotations', sequenceCountDataIA.mainSequences, genericColumnData, 'col-12 col-sm-12 col-md-6 col-lg-6 col-xl-6');
	var sequenceCountDataIH = getSequenceCountData(cleanSequenceData, 'individual', 'hyperlinks');
	renderTable('#totalAnalysisResultContainer', 'TOTAL Sequences → Individual | Hyperlinks', sequenceCountDataIH.sequences, genericColumnData, 'col-12 col-sm-12 col-md-6 col-lg-6 col-xl-6');
	renderTable('#totalAnalysisResultContainer', 'TOTAL Main Sequences → Individual | Hyperlinks', sequenceCountDataIH.mainSequences, genericColumnData, 'col-12 col-sm-12 col-md-6 col-lg-6 col-xl-6');
	var sequenceCountDataIC = getSequenceCountData(cleanSequenceData, 'individual', 'controlGroup');
	renderTable('#totalAnalysisResultContainer', 'TOTAL Sequences → Individual | Control Group', sequenceCountDataIC.sequences, genericColumnData, 'col-12 col-sm-12 col-md-6 col-lg-6 col-xl-6');
	renderTable('#totalAnalysisResultContainer', 'TOTAL Main Sequences → Individual | Control Group', sequenceCountDataIC.mainSequences, genericColumnData, 'col-12 col-sm-12 col-md-6 col-lg-6 col-xl-6');
	var sequenceCountDataCA = getSequenceCountData(cleanSequenceData, 'collaborative', 'annotations');
	renderTable('#totalAnalysisResultContainer', 'TOTAL Sequences → Collaborative | Annotations', sequenceCountDataCA.sequences, genericColumnData, 'col-12 col-sm-12 col-md-6 col-lg-6 col-xl-6');
	renderTable('#totalAnalysisResultContainer', 'TOTAL Main Sequences → Collaborative | Annotations', sequenceCountDataCA.mainSequences, genericColumnData, 'col-12 col-sm-12 col-md-6 col-lg-6 col-xl-6');
	var sequenceCountDataCH = getSequenceCountData(cleanSequenceData, 'collaborative', 'hyperlinks');
	renderTable('#totalAnalysisResultContainer', 'TOTAL Sequences → Collaborative | Hyperlinks', sequenceCountDataCH.sequences, genericColumnData, 'col-12 col-sm-12 col-md-6 col-lg-6 col-xl-6');
	renderTable('#totalAnalysisResultContainer', 'TOTAL Main Sequences → Collaborative | Hyperlinks', sequenceCountDataCH.mainSequences, genericColumnData, 'col-12 col-sm-12 col-md-6 col-lg-6 col-xl-6');
	var sequenceCountDataCC = getSequenceCountData(cleanSequenceData, 'collaborative', 'controlGroup');
	renderTable('#totalAnalysisResultContainer', 'TOTAL Sequences → Collaborative | Control Group', sequenceCountDataCC.sequences, genericColumnData, 'col-12 col-sm-12 col-md-6 col-lg-6 col-xl-6');
	renderTable('#totalAnalysisResultContainer', 'TOTAL Main Sequences → Collaborative | Control Group', sequenceCountDataCC.mainSequences, genericColumnData, 'col-12 col-sm-12 col-md-6 col-lg-6 col-xl-6');

	// Render Sequence Count Data per Sequence
	for (var s = 0; s < cleanSequenceData.length; s++) {
		var sequenceCountData = getSequenceCountData(cleanSequenceData[s]);
		renderTable('#singleAnalysisResultContainer', cleanSequenceData[s].fileName +' Sequences', sequenceCountData.sequences, genericColumnData, 'col-12 col-sm-12 col-md-6 col-lg-6 col-xl-6');
		renderTable('#singleAnalysisResultContainer', cleanSequenceData[s].fileName +' Main Sequences', sequenceCountData.mainSequences, genericColumnData, 'col-12 col-sm-12 col-md-6 col-lg-6 col-xl-6');
	}
}

function getSequenceCountData(data, setting, scenario) {
	var returnData = {
		'sequences': [],
		'mainSequences': []
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
	var totalSequenceCount = 0;

	// iterate files
	if (Array.isArray(data)) {
		for (var i = 0; i < data.length; i++) {
			//console.log(data[i].fileName);
			
			if ((setting && setting != data[i].setting) || (scenario && scenario != data[i].scenario)) {
				continue;
			}
			// iterate sequences
			for (var s = 0; s < data[i].sequences.length; s++) {
				var currentSequence = data[i].sequences[s];
				var currentMainSequenceNumber = currentSequence.sequenceNumber.split('.')[0];
				countsPerSequence[currentSequence.sequenceNumber]++;
				countsPerMainSequence[currentMainSequenceNumber]++;
				totalSequenceCount++;
			}
		}
	} else {
		for (var s = 0; s < data.sequences.length; s++) {
			var currentSequence = data.sequences[s];
			var currentMainSequenceNumber = currentSequence.sequenceNumber.split('.')[0];
			countsPerSequence[currentSequence.sequenceNumber]++;
			countsPerMainSequence[currentMainSequenceNumber]++;
			totalSequenceCount++;
		}
	}
	

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

	//iterate countsPerSequence 
	for (var sequenceNumber in countsPerMainSequence) {
		// push to table data
		var percentage = 100*(countsPerMainSequence[sequenceNumber]/totalSequenceCount);
		returnData.mainSequences.push({
			'sequenceNumber': sequenceNumber,
			'count': countsPerMainSequence[sequenceNumber],
			'percentage': Math.round(percentage*100)/100
		});
	}

	return returnData;
}