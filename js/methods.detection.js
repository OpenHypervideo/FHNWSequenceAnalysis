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
	* (add dummy sequence for all action arrays which start with the action "VideoPlay"
	*  and contain at least 3 actions)
	****/
	if (actionArray[0]['Aktion'] == 'VideoPlay' && actionArray.length >= 3) {
		
		var randomRule = sequenceRules[getRandomInt(0,19)];

		sequenceResults.push({
			label: randomRule.sequenceLabel,
			number: randomRule.sequenceNumber,
			actionIndexFrom: getRandomInt(0,2),
			actionIndexTo: getRandomInt(4,6)
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