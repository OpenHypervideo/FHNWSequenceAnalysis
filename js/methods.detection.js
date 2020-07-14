function analyseSequences() {
  //console.log("sequenceData BEFORE", sequenceData);
  for (var i = 0; i < sequenceData.length; i++) {
    var detectedSequences = detectSequences(sequenceData[i].actions);
    var prioritizedSequences = getPrioritizedSequences(detectedSequences);
    sequenceData[i].sequences = prioritizedSequences;
  }
  //console.log("sequenceData AFTER", sequenceData);
  updateVisualResult(sequenceData);
  updateDataTextarea(sequenceData);
}

function detectSequences(actionArray) {
  var sequenceResults = [];
  var encodedActionArray = encodeActionArray(actionArray);
  var patterns = SequenceDetector.generatePatternMatchers();

  for (pattern of patterns) {
    var matchFn = pattern.fn;
    var matches = matchFn(encodedActionArray);
    //console.log(pattern);
    for (match of matches) {
      sequenceResults.push({
        sequenceLabel: pattern.sequenceLabel,
        sequenceNumber: pattern.sequenceNumber,
        sequenceColor: pattern.sequenceColor,
        actionIndexFrom: match.startPos,
        actionIndexTo: match.endPos,
      });
    }
  }
  return sequenceResults;
}

function getPrioritizedSequences(rawSequences) {

  var prioritizedSequences = [];
  var staticPriorityMapping = {
    "1.1": 3,
    "1.2": 2,
    "1.3": 2,
    "1.4": 1,
    "2.1": 5,
    "2.2": 5,
    "2.3": 4,
    "3.1": 8,
    "3.2": 7,
    "3.3": 7,
    "3.4": 6,
    "4.1": 10,
    "4.2": 10,
    "4.3": 9,
    "5.1": 11,
    "5.2": 11,
    "5.3": 11
  };
  
  for (var i = 0; i < rawSequences.length; i++) {
    var sequence = rawSequences[i];
    sequence.staticPriority = staticPriorityMapping[rawSequences[i].sequenceNumber];
    prioritizedSequences.push(sequence);
  }

  // sort by start index and length first
  prioritizedSequences.sort(function (a, b) {
    var a_start = a.actionIndexFrom, 
        b_start = b.actionIndexFrom,
        a_length = a.actionIndexTo - a.actionIndexFrom,
        b_length = b.actionIndexTo - b.actionIndexFrom;

    if (a_start == b_start) {
      // same start index
      // sort by length (longer to shorter)
      return (a_length < b_length) ? 1 : (a_length > b_length) ? -1 : 0;
    } else {
      // sort by start index (lower to higher)
      return (a_start < b_start) ? -1 : 1;
    }
  });

  // sort by priority
  /*
  prioritizedSequences.sort(function (a, b) {
    var a_start = a.actionIndexFrom, 
        b_start = b.actionIndexFrom,
        a_length = a.actionIndexTo - a.actionIndexFrom,
        b_length = b.actionIndexTo - b.actionIndexFrom,
        a_priority = a.staticPriority,
        b_priority = b.staticPriority;
        
    if (b_start >= a_start && b_start < a_start + a_length) {
        // sequences overlap
        if (a_priority == b_priority) {
          // same priority
          return 0;
        } else {
          // sort by priority (higher to lower)
          return (a_priority < b_priority) ? -1 : 1;
        }
    } else {
      return 0;
    }
  });
  */

  return prioritizedSequences;

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

function getRules() {
  getSheetData("1bXfSB9tCW_0-5X_4Swmxl-sZ9Ivn5WgzmpBztZTbx8g", function (
    ruleSheetData
  ) {
    sequenceRules = ruleSheetData;
  });
}
