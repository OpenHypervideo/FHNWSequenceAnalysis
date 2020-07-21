var window = self;

importScripts('libs/sequence-detector.js');

var queryableFunctions = {
  // example #1: get the difference between two numbers:
  getDifference: function(nMinuend, nSubtrahend) {
      reply('printStuff', nMinuend - nSubtrahend);
  },
  // example #2: wait three seconds
  waitSomeTime: function() {
      setTimeout(function() { reply('doAlert', 3, 'seconds'); }, 3000);
  },
  getResult: function(inputData) {
    
    var prioritizedSequenceData = inputData;

    for (var i = 0; i < prioritizedSequenceData.length; i++) {
      
      reply('logMessage', 'Analyzing file '+ (i+1) +'/'+ prioritizedSequenceData.length +'<br>'+ prioritizedSequenceData[i].fileName);
      
      var detectedSequences = detectSequences(prioritizedSequenceData[i].actions);
      prioritizedSequenceData[i].sequences = detectedSequences;
      
      var prioritizedSequences = getPrioritizedSequences(prioritizedSequenceData[i].sequences).filter((v,i,a)=>a.findIndex(t=>(JSON.stringify(t) === JSON.stringify(v)))===i);
      
      //console.log(prioritizedSequences);

      for (var s = 0; s < prioritizedSequenceData[i].sequences.length; s++) {
        for (var p = 0; p < prioritizedSequences.length; p++) {
          if (prioritizedSequenceData[i].sequences[s].sequenceNumber === prioritizedSequences[p].sequenceNumber && 
              prioritizedSequenceData[i].sequences[s].actionIndexFrom === prioritizedSequences[p].actionIndexFrom && 
              prioritizedSequenceData[i].sequences[s].actionIndexTo === prioritizedSequences[p].actionIndexTo) {
            prioritizedSequenceData[i].sequences[s].prioritized = true;
          }
        }
      }

    }

    reply('logMessage', 'Analysis successfully finished');
    
    reply('returnResult', prioritizedSequenceData);
  }
};

// system functions

function defaultReply(message) {
  // your default PUBLIC function executed only when main page calls the queryableWorker.postMessage() method directly
  // do something
}

function reply() {
  if (arguments.length < 1) { throw new TypeError('reply - not enough arguments'); return; }
  postMessage({ 'queryMethodListener': arguments[0], 'queryMethodArguments': Array.prototype.slice.call(arguments, 1) });
}

onmessage = function(oEvent) {
  if (oEvent.data instanceof Object && oEvent.data.hasOwnProperty('queryMethod') && oEvent.data.hasOwnProperty('queryMethodArguments')) {
    queryableFunctions[oEvent.data.queryMethod].apply(self, oEvent.data.queryMethodArguments);
  } else {
    defaultReply(oEvent.data);
  }
};

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

  var sortedSequences = [],
      prioritizedSequences = [];
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
    sortedSequences.push(sequence);
  }

  // sort by start index and length first
  sortedSequences.sort(function (a, b) {
    var a_start = a.actionIndexFrom, 
        b_start = b.actionIndexFrom,
        a_length = a.actionIndexTo - a.actionIndexFrom,
        b_length = b.actionIndexTo - b.actionIndexFrom;

    if (a_start == b_start) {
      // same start index
      // sort by length (shorter to longer)
      return (a_length < b_length) ? -1 : (a_length > b_length) ? 1 : 0;
    } else {
      // sort by start index (lower to higher)
      return (a_start < b_start) ? -1 : 1;
    }
  });

  var sequenceGroups = getSequenceGroups(sortedSequences);
  
  //prioritizedSequences = detectPrioritizedSequences(sequenceGroups[0]);
  for (var sg = 0; sg < sequenceGroups.length; sg++) {
    var prioritizedSequencesInGroup = detectPrioritizedSequences(sequenceGroups[sg]);
    for (var ps = 0; ps < prioritizedSequencesInGroup.length; ps++) {
      prioritizedSequences.push(prioritizedSequencesInGroup[ps]);
    }
  }
  return prioritizedSequences;

}

function detectPrioritizedSequences(sequenceSubset) {
  
  // step 1: get potential candidates 
  // (sequences in the subset which don't overlap)
  var potentialSequenceMatches = [],
      maxLength = 1,
      minPriority = 11;

  for (var i = 0; i < sequenceSubset.length; i++) {
    
    findNextSequences(sequenceSubset[i].actionIndexTo);

    function findNextSequences(fromStartIndex) {      
      
      var subCandidates = [];

      for (var n = 0; n < sequenceSubset.length; n++) {
        if (sequenceSubset[n].actionIndexFrom > fromStartIndex) {
          subCandidates.push(sequenceSubset[n]);
        }
      }
            
      for (var s = 0; s < subCandidates.length; s++) {
        
        var potentialPairCandidates = [];
            accumulatedPairLength = 0,
            accumulatedPairGaps = 0,
            nextCandidate = (s < subCandidates.length-1) ? subCandidates[(s+1)] : null;

        potentialPairCandidates.push(sequenceSubset[i]);
        accumulatedPairLength += (sequenceSubset[i].actionIndexTo - sequenceSubset[i].actionIndexFrom + 1);

        potentialPairCandidates.push(subCandidates[s]);
        accumulatedPairLength += (subCandidates[s].actionIndexTo - subCandidates[s].actionIndexFrom + 1); 
        accumulatedPairGaps += subCandidates[s].actionIndexFrom - sequenceSubset[i].actionIndexTo - 1;

        potentialSequenceMatches.push({
          'averagePriority': (sequenceSubset[i].staticPriority + subCandidates[s].staticPriority) / 2,
          'accumulatedLength': accumulatedPairLength,
          'accumulatedGaps': accumulatedPairGaps,
          'sequences': potentialPairCandidates
        });

        if (accumulatedPairLength > maxLength) maxLength = accumulatedPairLength;
        if ((sequenceSubset[i].staticPriority + subCandidates[s].staticPriority) / 2 < minPriority) minPriority = (sequenceSubset[i].staticPriority + subCandidates[s].staticPriority) / 2;
          
        for (var p = 0; p < potentialSequenceMatches.length; p++) {
          var lastSequence = potentialSequenceMatches[p].sequences[potentialSequenceMatches[p].sequences.length -1];
          
          if (subCandidates[s].actionIndexFrom > lastSequence.actionIndexTo) {
            if (nextCandidate && nextCandidate.actionIndexFrom == subCandidates[s].actionIndexFrom) {
              var potentialSequenceMatchCopy = JSON.parse(JSON.stringify(potentialSequenceMatches[p]));
              var newAveragePriority = ((potentialSequenceMatchCopy.averagePriority * potentialSequenceMatchCopy.sequences.length) + subCandidates[s].staticPriority) / (potentialSequenceMatchCopy.sequences.length+1);
              
              potentialSequenceMatchCopy.sequences.push(subCandidates[s]);
              potentialSequenceMatchCopy.averagePriority = newAveragePriority;
              potentialSequenceMatchCopy.accumulatedLength += (subCandidates[s].actionIndexTo - subCandidates[s].actionIndexFrom + 1);
              potentialSequenceMatchCopy.accumulatedGaps += subCandidates[s].actionIndexFrom - lastSequence.actionIndexTo - 1;
              var alreadyExists = false;
              for (var p2 = 0; p2 < potentialSequenceMatches.length; p2++) {
                if (JSON.stringify(potentialSequenceMatches[p2].sequences) == JSON.stringify(potentialSequenceMatchCopy.sequences)) {
                  alreadyExists = true;
                  break;
                }
              }
              if (!alreadyExists) {
                potentialSequenceMatches.push(potentialSequenceMatchCopy);
                if (potentialSequenceMatchCopy.accumulatedLength > maxLength) maxLength = potentialSequenceMatchCopy.accumulatedLength;
                if (potentialSequenceMatchCopy.averagePriority < minPriority) minPriority = potentialSequenceMatchCopy.averagePriority;
              }

            } else {
              var newAveragePriority = ((potentialSequenceMatches[p].averagePriority * potentialSequenceMatches[p].sequences.length) + subCandidates[s].staticPriority) / (potentialSequenceMatches[p].sequences.length+1);
              
              potentialSequenceMatches[p].sequences.push(subCandidates[s]);
              potentialSequenceMatches[p].averagePriority = newAveragePriority;
              potentialSequenceMatches[p].accumulatedLength += (subCandidates[s].actionIndexTo - subCandidates[s].actionIndexFrom + 1);
              potentialSequenceMatches[p].accumulatedGaps += subCandidates[s].actionIndexFrom - lastSequence.actionIndexTo - 1;

              if (potentialSequenceMatches[p].accumulatedLength > maxLength) maxLength = potentialSequenceMatches[p].accumulatedLength;
              if (potentialSequenceMatches[p].averagePriority < minPriority) minPriority = potentialSequenceMatches[p].averagePriority;
            }
          }
        }
        
      }

    }

    var sequenceInArray = [];
        sequenceInArray.push(sequenceSubset[i]);
    // push entry for single sequence
    potentialSequenceMatches.push({
      'averagePriority': sequenceSubset[i].staticPriority,
      'accumulatedLength': (sequenceSubset[i].actionIndexTo - sequenceSubset[i].actionIndexFrom + 1),
      'accumulatedGaps': 0,
      'sequences': sequenceInArray
    });
    
    if ((sequenceSubset[i].actionIndexTo - sequenceSubset[i].actionIndexFrom + 1) > maxLength) maxLength = (sequenceSubset[i].actionIndexTo - sequenceSubset[i].actionIndexFrom + 1);
    if (sequenceSubset[i].staticPriority < minPriority) minPriority = sequenceSubset[i].staticPriority;

    if (sequenceSubset.length > 6 && sequenceSubset[i].actionIndexFrom > sequenceSubset[5].actionIndexFrom) {
      break;
    }

  }
  
  var lengthFactor = 1.0,
      priorityFactor = 1.9;
  
  for (var sm = 0; sm < potentialSequenceMatches.length; sm++) {
    potentialSequenceMatches[sm].scoreLength = potentialSequenceMatches[sm].accumulatedLength / maxLength;
    potentialSequenceMatches[sm].scorePriority = (11-potentialSequenceMatches[sm].averagePriority)/(11-1);
    potentialSequenceMatches[sm].rating = ((potentialSequenceMatches[sm].scoreLength*lengthFactor) + (potentialSequenceMatches[sm].scorePriority*priorityFactor)) / 2;

  }

  // step 2: 
  
  // sort candidate matches by rating and length
  potentialSequenceMatches.sort(function (a, b) {
    var a_priority = a.averagePriority, 
        b_priority = b.averagePriority,
        a_length = a.accumulatedLength,
        b_length = b.accumulatedLength,
        a_gaps = a.accumulatedGaps,
        b_gaps = b.accumulatedGaps,
        a_rating = a.rating,
        b_rating = b.rating;

    if (a_rating == b_rating) {
      // same rating
      // sort by length (longer to shorter)
      return (a_length < b_length) ? 1 : (a_length > b_length) ? -1 : 0;
    } else {
      // sort by rating (higher to lower)
      return (a_rating < b_rating) ? 1 : -1;
    }
  });
  /*
  // sort candidate matches by length and priority
  potentialSequenceMatches.sort(function (a, b) {
    var a_priority = a.averagePriority, 
        b_priority = b.averagePriority,
        a_length = a.accumulatedLength,
        b_length = b.accumulatedLength,
        a_gaps = a.accumulatedGaps,
        b_gaps = b.accumulatedGaps;

    if (a_length == b_length) {
      // same length
      // sort by priority (higher to lower)
      return (a_priority < b_priority) ? -1 : (a_priority > b_priority) ? 1 : 0;
    } else {
      // sort by length (longer to shorter)
      return (a_length < b_length) ? 1 : -1;
    }
  });
  */
  /*
  // sort candidate matches by priority and length
  potentialSequenceMatches.sort(function (a, b) {
    var a_priority = a.averagePriority, 
        b_priority = b.averagePriority,
        a_length = a.accumulatedLength,
        b_length = b.accumulatedLength,
        a_gaps = a.accumulatedGaps,
        b_gaps = b.accumulatedGaps;

    if (a_priority == b_priority) {
      // same priority
      // sort by length (longer to shorter)
      return (a_length < b_length) ? 1 : (a_length > b_length) ? -1 : 0;
    } else {
      // sort by priority (higher to lower)
      return (a_priority < b_priority) ? -1 : 1;
    }
  });
  */

  //console.log(potentialSequenceMatches);
    
  return potentialSequenceMatches[0].sequences;

}

function getSequenceGroups(sequenceArray) {
  // sequences need to be already ordered by start index
  var sequenceGroups = [],
      groupCnt = 0,
      currentGroupSequences = [],
      currentGroupMaxIndex = 0;

  for (var i = 0; i < sequenceArray.length; i++) {
    var nextSequence = (i < sequenceArray.length-1) ? sequenceArray[(i+1)] : null,
        thisStart = sequenceArray[i].actionIndexFrom,
        thisLength = sequenceArray[i].actionIndexTo - thisStart + 1;

    if (nextSequence) {
      var nextStart = nextSequence.actionIndexFrom;
      if ((thisStart+thisLength) > nextStart || thisStart+thisLength < currentGroupMaxIndex) {
        currentGroupSequences.push(sequenceArray[i]);
        if ((thisStart+thisLength) > currentGroupMaxIndex) {
          currentGroupMaxIndex = (thisStart+thisLength);
        }
      } else {
        currentGroupSequences.push(sequenceArray[i]);
        sequenceGroups.push(currentGroupSequences);

        currentGroupSequences = [];
        
        currentGroupMaxIndex = 0;
        groupCnt++;        
      }
    } else {
      currentGroupSequences.push(sequenceArray[i]);
      sequenceGroups.push(currentGroupSequences);
    }
  }

  return sequenceGroups;
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