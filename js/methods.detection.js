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

function findMatchesWithStartEnd(string, regex) {
  var matches = [];
  while ((match = regex.exec(string)) != null) {
    matches.push({
      match: match[0],
      actionIndexFrom: match.index,
      actionIndexTo: match.index + match[0].length - 1,
    });
  }
  return matches;
}

function detectSequences(actionArray) {
  var sequenceResults = [];
  var encodedActionArray = encodeActionArray(actionArray);

  var patterns = [
    {
      name: "1.1",
      sequenceLabel: "Search position and add annotation",
      regex: /([AB](?=.*[CD].*E)[^EFG]{1,3}E)|([CD][^EFG]{1,3}E)/g,
    },
    {
      name: "2.1",
      sequenceLabel: "Search to adjust annotation time",
      regex: /([AB](?=.*[CD].*G)[^EF]{3}G)|([CD][^EF]{3}G)/g,
    },
  ];
  for (pattern of patterns) {
    var matches = findMatchesWithStartEnd(encodedActionArray, pattern.regex);
    for (match of matches) {
      sequenceResults.push({
        label: pattern.sequenceLabel,
        number: pattern.name,
        actionIndexFrom: match.actionIndexFrom,
        actionIndexTo: match.actionIndexTo,
      });
    }
  }

  return sequenceResults;
}

function getRules() {
  getSheetData("1bXfSB9tCW_0-5X_4Swmxl-sZ9Ivn5WgzmpBztZTbx8g", function (
    ruleSheetData
  ) {
    sequenceRules = ruleSheetData;
  });
}
