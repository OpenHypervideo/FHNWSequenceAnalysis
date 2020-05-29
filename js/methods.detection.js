function analyseSequences() {
	for (var i = 0; i < sequenceData.length; i++) {
		var detectedSequences = detectSequences(sequenceData[i].actions);
		sequenceData[i].sequences = detectedSequences;
	}

	updateVisualResult(sequenceData);
	updateDataTextarea(sequenceData);
}

function detectSequences(actionArray) {

	console.log(actionArray);

	var sequenceResults = [];

	/**** 
	* DUMMY SEQUENCE DETECTION 
	* (add dummy sequence for all action arrays which start with the action "UserLogin")
	****/
	if (actionArray[0]['Aktion'] == 'UserLogin') {
		
		sequenceResults.push({
			label: 'Find position and add new annotation',
			number: 3.1,
			actionIndexFrom: 2,
			actionIndexTo: 5
		});

	}

	return sequenceResults;

}

function getRules() {
	getSheetData('1bXfSB9tCW_0-5X_4Swmxl-sZ9Ivn5WgzmpBztZTbx8g', function(ruleSheetData) {
		
		console.log(ruleSheetData);
		sequenceRules = ruleSheetData;

	});
}