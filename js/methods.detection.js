function analyseSequences() {
  console.log("sequenceData BEFORE", sequenceData);
  for (var i = 0; i < sequenceData.length; i++) {
    var detectedSequences = detectSequences(sequenceData[i].actions);
    sequenceData[i].sequences = detectedSequences;
  }
  console.log("sequenceData AFTER", sequenceData);
  updateVisualResult(sequenceData);
  updateDataTextarea(sequenceData);
}

function encodeActionArray(actionArray) {
  var ACTIONS = {
    VideoPlay: "A",
    VideoPause: "B",
    VideoJumpBackward: "C",
    VideoJumpForward: "D",
    AnnotationAdd: "E",
    AnnotationChangeText: "F",
    AnnotationChangeTime: "G",
  };
  return actionArray
    .map(({ Aktion }) => Aktion)
    .map((actionName) => ACTIONS[actionName] || "X")
    .join("");
}

function detectSequences(actionArray) {
  var sequenceResults = [];
  var encodedActionArray = encodeActionArray(actionArray);
  var patterns = SequenceDetector.generatePatternMatchers();

  for (pattern of patterns) {
    console.log(pattern);
    var matchFn = pattern.fn;
    var matches = matchFn(encodedActionArray);
    for (match of matches) {
      console.log(match);
      sequenceResults.push({
        label: pattern.label,
        number: pattern.number,
        actionIndexFrom: match.startPos,
        actionIndexTo: match.endPos,
      });
    }
  }
  console.log("sequenceREsults", sequenceResults);
  return sequenceResults;
}

function getRules() {
  getSheetData("1bXfSB9tCW_0-5X_4Swmxl-sZ9Ivn5WgzmpBztZTbx8g", function (
    ruleSheetData
  ) {
    sequenceRules = ruleSheetData;
  });
}
