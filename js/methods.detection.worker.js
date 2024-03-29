function workerWrapper() {

  var window = self;

  var queryableFunctions = {
    getResult: function(inputData) {
      
      var prioritizedSequenceData = inputData;
      var cleanData = [];

      for (var i = 0; i < prioritizedSequenceData.length; i++) {
        
        reply('logMessage', 'Analyzing file '+ (i+1) +'/'+ prioritizedSequenceData.length +'<br>'+ prioritizedSequenceData[i].fileName);
        
        var detectedSequences = detectSequences(prioritizedSequenceData[i].actions);
        prioritizedSequenceData[i].sequences = detectedSequences;
        
        //console.log(prioritizedSequenceData[i].fileName);

        var prioritizedSequences = getPrioritizedSequences(prioritizedSequenceData[i].sequences).filter((v,i,a)=>a.findIndex(t=>(JSON.stringify(t) === JSON.stringify(v)))===i);
        
        //console.log(prioritizedSequences);

        var cleanSequence = {
        	'fileName': prioritizedSequenceData[i].fileName,
          'setting': prioritizedSequenceData[i].setting,
          'scenario': prioritizedSequenceData[i].scenario,
          'personID': prioritizedSequenceData[i].personID,
        	'actions': prioritizedSequenceData[i].actions,
        	'sequences': []
        }

        for (var s = 0; s < prioritizedSequenceData[i].sequences.length; s++) {
          for (var p = 0; p < prioritizedSequences.length; p++) {
            if (prioritizedSequenceData[i].sequences[s].sequenceNumber === prioritizedSequences[p].sequenceNumber && 
                prioritizedSequenceData[i].sequences[s].actionIndexFrom === prioritizedSequences[p].actionIndexFrom && 
                prioritizedSequenceData[i].sequences[s].actionIndexTo === prioritizedSequences[p].actionIndexTo) {
              	
              	prioritizedSequenceData[i].sequences[s].prioritized = true;
              	cleanSequence.sequences.push(prioritizedSequenceData[i].sequences[s]);
            }
          }

          // make sure sequences are sorted correctly
          cleanSequence.sequences.sort(function(a, b) {
            if (a.actionIndexFrom < b.actionIndexFrom) {
              return -1;
            }
            if (a.actionIndexFrom > b.actionIndexFrom) {
              return 1;
            }
            return 0;
          });
        }

        cleanData.push(cleanSequence);

      }

      reply('logMessage', 'Analysis successfully finished');
      
      reply('returnResult', prioritizedSequenceData, cleanData);
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
        var actionsInSequence = [];
        for (var i = 0; i < actionArray.length; i++) {
          if (i >= match.startPos && i <= match.endPos) {
            actionsInSequence.push(actionArray[i]);
          }
        }
        sequenceResults.push({
          sequenceLabel: pattern.sequenceLabel,
          sequenceNumber: pattern.sequenceNumber,
          sequenceColor: pattern.sequenceColor,
          actionIndexFrom: match.startPos,
          actionIndexTo: match.endPos,
          actions: actionsInSequence
        });
      }
    }
    return sequenceResults;
  }

  function getPrioritizedSequences(rawSequences) {

    var sortedSequences = [],
        prioritizedSequences = [];
    var staticPriorityMapping = {
      "1.1": 4,
      "1.2": 3,
      "1.3": 3,
      "1.4": 1,
      "2.1": 7,
      "2.2": 7,
      "2.3": 5,
      "3.1": 11,
      "3.2": 10,
      "3.3": 10,
      "3.4": 8,
      "4.1": 14,
      "4.2": 14,
      "4.3": 12,
      "5.1": 17,
      "5.2": 17,
      "5.3": 15
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
        minLength = 100,
        maxLength = 1,
        minPriority = 1,
        maxPriority = 17,
        minSequences = 1,
        maxSequences = 1;

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

          if (accumulatedPairLength < minLength) minLength = accumulatedPairLength;
          if (accumulatedPairLength > maxLength) maxLength = accumulatedPairLength;
          if ((sequenceSubset[i].staticPriority + subCandidates[s].staticPriority) / 2 > minPriority) minPriority = (sequenceSubset[i].staticPriority + subCandidates[s].staticPriority) / 2;
          if ((sequenceSubset[i].staticPriority + subCandidates[s].staticPriority) / 2 < maxPriority) maxPriority = (sequenceSubset[i].staticPriority + subCandidates[s].staticPriority) / 2;
          if (potentialPairCandidates.length > maxSequences) maxSequences = potentialPairCandidates.length;

          var fixedLength = potentialSequenceMatches.length;
          for (var p = 0; p < potentialSequenceMatches.length; p++) {
            var lastSequence = potentialSequenceMatches[p].sequences[potentialSequenceMatches[p].sequences.length -1];
            
            if (subCandidates[s].actionIndexFrom > lastSequence.actionIndexTo) {
              
              if (nextCandidate && nextCandidate.actionIndexFrom == subCandidates[s].actionIndexFrom) {
                /*
                var potentialSequenceMatchCopy = Object.assign({}, potentialSequenceMatches[p]);
                var newAveragePriority = ((potentialSequenceMatchCopy.averagePriority * potentialSequenceMatchCopy.sequences.length) + subCandidates[s].staticPriority) / (potentialSequenceMatchCopy.sequences.length+1);
                
                potentialSequenceMatchCopy.sequences.push(subCandidates[s]);
                potentialSequenceMatchCopy.averagePriority = newAveragePriority;
                potentialSequenceMatchCopy.accumulatedLength += (subCandidates[s].actionIndexTo - subCandidates[s].actionIndexFrom + 1);
                potentialSequenceMatchCopy.accumulatedGaps += subCandidates[s].actionIndexFrom - lastSequence.actionIndexTo - 1;
                potentialSequenceMatches.push(potentialSequenceMatchCopy);

                if (potentialSequenceMatchCopy.accumulatedLength < minLength) minLength = potentialSequenceMatchCopy.accumulatedLength;
                if (potentialSequenceMatchCopy.accumulatedLength > maxLength) maxLength = potentialSequenceMatchCopy.accumulatedLength;
                if (potentialSequenceMatchCopy.averagePriority > minPriority) minPriority = potentialSequenceMatchCopy.averagePriority;
                if (potentialSequenceMatchCopy.averagePriority < maxPriority) maxPriority = potentialSequenceMatchCopy.averagePriority;
                if (potentialSequenceMatchCopy.sequences.length > maxSequences) maxSequences = potentialSequenceMatchCopy.sequences.length;
                */
              } else {
                
                var newAveragePriority = ((potentialSequenceMatches[p].averagePriority * potentialSequenceMatches[p].sequences.length) + subCandidates[s].staticPriority) / (potentialSequenceMatches[p].sequences.length+1);
                
                potentialSequenceMatches[p].sequences.push(subCandidates[s]);
                potentialSequenceMatches[p].averagePriority = newAveragePriority;
                potentialSequenceMatches[p].accumulatedLength += (subCandidates[s].actionIndexTo - subCandidates[s].actionIndexFrom + 1);
                potentialSequenceMatches[p].accumulatedGaps += subCandidates[s].actionIndexFrom - lastSequence.actionIndexTo - 1;

                if (potentialSequenceMatches[p].accumulatedLength < minLength) minLength = potentialSequenceMatches[p].accumulatedLength;
                if (potentialSequenceMatches[p].accumulatedLength > maxLength) maxLength = potentialSequenceMatches[p].accumulatedLength;
                if (potentialSequenceMatches[p].averagePriority > minPriority) minPriority = potentialSequenceMatches[p].averagePriority;
                if (potentialSequenceMatches[p].averagePriority < maxPriority) maxPriority = potentialSequenceMatches[p].averagePriority;
                if (potentialSequenceMatches[p].sequences.length > maxSequences) maxSequences = potentialSequenceMatches[p].sequences.length;
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
      
      if ((sequenceSubset[i].actionIndexTo - sequenceSubset[i].actionIndexFrom + 1) < minLength) minLength = (sequenceSubset[i].actionIndexTo - sequenceSubset[i].actionIndexFrom + 1);
      if ((sequenceSubset[i].actionIndexTo - sequenceSubset[i].actionIndexFrom + 1) > maxLength) maxLength = (sequenceSubset[i].actionIndexTo - sequenceSubset[i].actionIndexFrom + 1);
      if (sequenceSubset[i].staticPriority > minPriority) minPriority = sequenceSubset[i].staticPriority;
      if (sequenceSubset[i].staticPriority < maxPriority) maxPriority = sequenceSubset[i].staticPriority;
      
      /*
      if (sequenceSubset.length > 6 && sequenceSubset[i].actionIndexFrom > sequenceSubset[5].actionIndexFrom) {
        break;
      }
      */

    }
    
    var lengthFactor = 1,
        priorityFactor = 2.2,
        heterogeneityFactor = 0.4;

    // TODO: Check why hack is necessary
    minPriority = minPriority - 0.0001;
    minSequences = minSequences - 0.0001;
    minLength = 1;
    //maxPriority = 1;
    
    for (var sm = 0; sm < potentialSequenceMatches.length; sm++) {
      potentialSequenceMatches[sm].scoreLength = (potentialSequenceMatches[sm].accumulatedLength-minLength)/(maxLength-minLength);
      potentialSequenceMatches[sm].scorePriority = ((minPriority-potentialSequenceMatches[sm].averagePriority)/(minPriority-maxPriority));
      potentialSequenceMatches[sm].scoreHeterogeneity = ((minSequences-potentialSequenceMatches[sm].sequences.length)/(minSequences-maxSequences));
      
      potentialSequenceMatches[sm].rating = (
        (potentialSequenceMatches[sm].scoreLength*lengthFactor) + 
        ((potentialSequenceMatches[sm].scorePriority*potentialSequenceMatches[sm].scoreLength)*priorityFactor) + 
        (potentialSequenceMatches[sm].scoreHeterogeneity*heterogeneityFactor)
      )/3;

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
    
    //console.log(minPriority, maxPriority, maxLength);
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

  // bundled sequence detector code
  !function(n,e){"object"==typeof exports&&"object"==typeof module?module.exports=e():"function"==typeof define&&define.amd?define("SequenceDetector",[],e):"object"==typeof exports?exports.SequenceDetector=e():n.SequenceDetector=e()}(window,(function(){return function(n){var e={};function t(r){if(e[r])return e[r].exports;var i=e[r]={i:r,l:!1,exports:{}};return n[r].call(i.exports,i,i.exports,t),i.l=!0,i.exports}return t.m=n,t.c=e,t.d=function(n,e,r){t.o(n,e)||Object.defineProperty(n,e,{enumerable:!0,get:r})},t.r=function(n){"undefined"!=typeof Symbol&&Symbol.toStringTag&&Object.defineProperty(n,Symbol.toStringTag,{value:"Module"}),Object.defineProperty(n,"__esModule",{value:!0})},t.t=function(n,e){if(1&e&&(n=t(n)),8&e)return n;if(4&e&&"object"==typeof n&&n&&n.__esModule)return n;var r=Object.create(null);if(t.r(r),Object.defineProperty(r,"default",{enumerable:!0,value:n}),2&e&&"string"!=typeof n)for(var i in n)t.d(r,i,function(e){return n[e]}.bind(null,i));return r},t.n=function(n){var e=n&&n.__esModule?function(){return n.default}:function(){return n};return t.d(e,"a",e),e},t.o=function(n,e){return Object.prototype.hasOwnProperty.call(n,e)},t.p="",t(t.s=1)}([function(n,e,t){"use strict";t.r(e),function(n){t.d(e,"default",(function(){return y})),t.d(e,"VERSION",(function(){return b})),t.d(e,"iteratee",(function(){return q})),t.d(e,"restArguments",(function(){return w})),t.d(e,"each",(function(){return E})),t.d(e,"forEach",(function(){return E})),t.d(e,"map",(function(){return C})),t.d(e,"collect",(function(){return C})),t.d(e,"reduce",(function(){return N})),t.d(e,"foldl",(function(){return N})),t.d(e,"inject",(function(){return N})),t.d(e,"reduceRight",(function(){return _})),t.d(e,"foldr",(function(){return _})),t.d(e,"find",(function(){return G})),t.d(e,"detect",(function(){return G})),t.d(e,"filter",(function(){return T})),t.d(e,"select",(function(){return T})),t.d(e,"reject",(function(){return M})),t.d(e,"every",(function(){return I})),t.d(e,"all",(function(){return I})),t.d(e,"some",(function(){return k})),t.d(e,"any",(function(){return k})),t.d(e,"contains",(function(){return V})),t.d(e,"includes",(function(){return V})),t.d(e,"include",(function(){return V})),t.d(e,"invoke",(function(){return R})),t.d(e,"pluck",(function(){return P})),t.d(e,"where",(function(){return W})),t.d(e,"findWhere",(function(){return $})),t.d(e,"max",(function(){return Z})),t.d(e,"min",(function(){return K})),t.d(e,"shuffle",(function(){return J})),t.d(e,"sample",(function(){return U})),t.d(e,"sortBy",(function(){return H})),t.d(e,"groupBy",(function(){return X})),t.d(e,"indexBy",(function(){return Y})),t.d(e,"countBy",(function(){return nn})),t.d(e,"toArray",(function(){return tn})),t.d(e,"size",(function(){return rn})),t.d(e,"partition",(function(){return on})),t.d(e,"first",(function(){return un})),t.d(e,"head",(function(){return un})),t.d(e,"take",(function(){return un})),t.d(e,"initial",(function(){return cn})),t.d(e,"last",(function(){return an})),t.d(e,"rest",(function(){return dn})),t.d(e,"tail",(function(){return dn})),t.d(e,"drop",(function(){return dn})),t.d(e,"compact",(function(){return sn})),t.d(e,"flatten",(function(){return ln})),t.d(e,"without",(function(){return mn})),t.d(e,"uniq",(function(){return pn})),t.d(e,"unique",(function(){return pn})),t.d(e,"union",(function(){return hn})),t.d(e,"intersection",(function(){return An})),t.d(e,"difference",(function(){return yn})),t.d(e,"unzip",(function(){return bn})),t.d(e,"zip",(function(){return vn})),t.d(e,"object",(function(){return gn})),t.d(e,"findIndex",(function(){return On})),t.d(e,"findLastIndex",(function(){return wn})),t.d(e,"sortedIndex",(function(){return xn})),t.d(e,"indexOf",(function(){return Bn})),t.d(e,"lastIndexOf",(function(){return Fn})),t.d(e,"range",(function(){return jn})),t.d(e,"chunk",(function(){return zn})),t.d(e,"bind",(function(){return En})),t.d(e,"partial",(function(){return Cn})),t.d(e,"bindAll",(function(){return Ln})),t.d(e,"memoize",(function(){return Nn})),t.d(e,"delay",(function(){return _n})),t.d(e,"defer",(function(){return Gn})),t.d(e,"throttle",(function(){return Tn})),t.d(e,"debounce",(function(){return Mn})),t.d(e,"wrap",(function(){return In})),t.d(e,"negate",(function(){return kn})),t.d(e,"compose",(function(){return Vn})),t.d(e,"after",(function(){return Rn})),t.d(e,"before",(function(){return Pn})),t.d(e,"once",(function(){return Wn})),t.d(e,"keys",(function(){return Jn})),t.d(e,"allKeys",(function(){return Un})),t.d(e,"values",(function(){return Hn})),t.d(e,"mapObject",(function(){return Qn})),t.d(e,"pairs",(function(){return Xn})),t.d(e,"invert",(function(){return Yn})),t.d(e,"functions",(function(){return ne})),t.d(e,"methods",(function(){return ne})),t.d(e,"extend",(function(){return te})),t.d(e,"extendOwn",(function(){return re})),t.d(e,"assign",(function(){return re})),t.d(e,"findKey",(function(){return ie})),t.d(e,"pick",(function(){return ue})),t.d(e,"omit",(function(){return ce})),t.d(e,"defaults",(function(){return ae})),t.d(e,"create",(function(){return de})),t.d(e,"clone",(function(){return se})),t.d(e,"tap",(function(){return fe})),t.d(e,"isMatch",(function(){return le})),t.d(e,"isEqual",(function(){return pe})),t.d(e,"isEmpty",(function(){return he})),t.d(e,"isElement",(function(){return Ae})),t.d(e,"isArray",(function(){return be})),t.d(e,"isObject",(function(){return ve})),t.d(e,"isArguments",(function(){return ge})),t.d(e,"isFunction",(function(){return qe})),t.d(e,"isString",(function(){return Oe})),t.d(e,"isNumber",(function(){return we})),t.d(e,"isDate",(function(){return xe})),t.d(e,"isRegExp",(function(){return Se})),t.d(e,"isError",(function(){return Be})),t.d(e,"isSymbol",(function(){return Fe})),t.d(e,"isMap",(function(){return je})),t.d(e,"isWeakMap",(function(){return ze})),t.d(e,"isSet",(function(){return De})),t.d(e,"isWeakSet",(function(){return Ee})),t.d(e,"isFinite",(function(){return Le})),t.d(e,"isNaN",(function(){return Ne})),t.d(e,"isBoolean",(function(){return _e})),t.d(e,"isNull",(function(){return Ge})),t.d(e,"isUndefined",(function(){return Te})),t.d(e,"has",(function(){return Me})),t.d(e,"identity",(function(){return Ie})),t.d(e,"constant",(function(){return ke})),t.d(e,"noop",(function(){return Ve})),t.d(e,"property",(function(){return Re})),t.d(e,"propertyOf",(function(){return Pe})),t.d(e,"matcher",(function(){return We})),t.d(e,"matches",(function(){return We})),t.d(e,"times",(function(){return $e})),t.d(e,"random",(function(){return Ze})),t.d(e,"now",(function(){return Ke})),t.d(e,"escape",(function(){return Qe})),t.d(e,"unescape",(function(){return Xe})),t.d(e,"result",(function(){return Ye})),t.d(e,"uniqueId",(function(){return et})),t.d(e,"templateSettings",(function(){return tt})),t.d(e,"template",(function(){return ct})),t.d(e,"chain",(function(){return at})),t.d(e,"mixin",(function(){return st}));var r="object"==typeof self&&self.self===self&&self||"object"==typeof n&&n.global===n&&n||Function("return this")()||{},i=Array.prototype,o=Object.prototype,u="undefined"!=typeof Symbol?Symbol.prototype:null,c=i.push,a=i.slice,d=o.toString,s=o.hasOwnProperty,f=Array.isArray,l=Object.keys,m=Object.create,p=r.isNaN,h=r.isFinite,A=function(){};function y(n){return n instanceof y?n:this instanceof y?void(this._wrapped=n):new y(n)}var b=y.VERSION="1.10.2";function v(n,e,t){if(void 0===e)return n;switch(null==t?3:t){case 1:return function(t){return n.call(e,t)};case 3:return function(t,r,i){return n.call(e,t,r,i)};case 4:return function(t,r,i,o){return n.call(e,t,r,i,o)}}return function(){return n.apply(e,arguments)}}function g(n,e,t){return null==n?Ie:qe(n)?v(n,e,t):ve(n)&&!be(n)?We(n):Re(n)}function q(n,e){return g(n,e,1/0)}function O(n,e,t){return y.iteratee!==q?y.iteratee(n,e):g(n,e,t)}function w(n,e){return e=null==e?n.length-1:+e,function(){for(var t=Math.max(arguments.length-e,0),r=Array(t),i=0;i<t;i++)r[i]=arguments[i+e];switch(e){case 0:return n.call(this,r);case 1:return n.call(this,arguments[0],r);case 2:return n.call(this,arguments[0],arguments[1],r)}var o=Array(e+1);for(i=0;i<e;i++)o[i]=arguments[i];return o[e]=r,n.apply(this,o)}}function x(n){if(!ve(n))return{};if(m)return m(n);A.prototype=n;var e=new A;return A.prototype=null,e}function S(n){return function(e){return null==e?void 0:e[n]}}function B(n,e){return null!=n&&s.call(n,e)}function F(n,e){for(var t=e.length,r=0;r<t;r++){if(null==n)return;n=n[e[r]]}return t?n:void 0}y.iteratee=q;var j=Math.pow(2,53)-1,z=S("length");function D(n){var e=z(n);return"number"==typeof e&&e>=0&&e<=j}function E(n,e,t){var r,i;if(e=v(e,t),D(n))for(r=0,i=n.length;r<i;r++)e(n[r],r,n);else{var o=Jn(n);for(r=0,i=o.length;r<i;r++)e(n[o[r]],o[r],n)}return n}function C(n,e,t){e=O(e,t);for(var r=!D(n)&&Jn(n),i=(r||n).length,o=Array(i),u=0;u<i;u++){var c=r?r[u]:u;o[u]=e(n[c],c,n)}return o}function L(n){var e=function(e,t,r,i){var o=!D(e)&&Jn(e),u=(o||e).length,c=n>0?0:u-1;for(i||(r=e[o?o[c]:c],c+=n);c>=0&&c<u;c+=n){var a=o?o[c]:c;r=t(r,e[a],a,e)}return r};return function(n,t,r,i){var o=arguments.length>=3;return e(n,v(t,i,4),r,o)}}var N=L(1),_=L(-1);function G(n,e,t){var r=(D(n)?On:ie)(n,e,t);if(void 0!==r&&-1!==r)return n[r]}function T(n,e,t){var r=[];return e=O(e,t),E(n,(function(n,t,i){e(n,t,i)&&r.push(n)})),r}function M(n,e,t){return T(n,kn(O(e)),t)}function I(n,e,t){e=O(e,t);for(var r=!D(n)&&Jn(n),i=(r||n).length,o=0;o<i;o++){var u=r?r[o]:o;if(!e(n[u],u,n))return!1}return!0}function k(n,e,t){e=O(e,t);for(var r=!D(n)&&Jn(n),i=(r||n).length,o=0;o<i;o++){var u=r?r[o]:o;if(e(n[u],u,n))return!0}return!1}function V(n,e,t,r){return D(n)||(n=Hn(n)),("number"!=typeof t||r)&&(t=0),Bn(n,e,t)>=0}var R=w((function(n,e,t){var r,i;return qe(e)?i=e:be(e)&&(r=e.slice(0,-1),e=e[e.length-1]),C(n,(function(n){var o=i;if(!o){if(r&&r.length&&(n=F(n,r)),null==n)return;o=n[e]}return null==o?o:o.apply(n,t)}))}));function P(n,e){return C(n,Re(e))}function W(n,e){return T(n,We(e))}function $(n,e){return G(n,We(e))}function Z(n,e,t){var r,i,o=-1/0,u=-1/0;if(null==e||"number"==typeof e&&"object"!=typeof n[0]&&null!=n)for(var c=0,a=(n=D(n)?n:Hn(n)).length;c<a;c++)null!=(r=n[c])&&r>o&&(o=r);else e=O(e,t),E(n,(function(n,t,r){((i=e(n,t,r))>u||i===-1/0&&o===-1/0)&&(o=n,u=i)}));return o}function K(n,e,t){var r,i,o=1/0,u=1/0;if(null==e||"number"==typeof e&&"object"!=typeof n[0]&&null!=n)for(var c=0,a=(n=D(n)?n:Hn(n)).length;c<a;c++)null!=(r=n[c])&&r<o&&(o=r);else e=O(e,t),E(n,(function(n,t,r){((i=e(n,t,r))<u||i===1/0&&o===1/0)&&(o=n,u=i)}));return o}function J(n){return U(n,1/0)}function U(n,e,t){if(null==e||t)return D(n)||(n=Hn(n)),n[Ze(n.length-1)];var r=D(n)?se(n):Hn(n),i=z(r);e=Math.max(Math.min(e,i),0);for(var o=i-1,u=0;u<e;u++){var c=Ze(u,o),a=r[u];r[u]=r[c],r[c]=a}return r.slice(0,e)}function H(n,e,t){var r=0;return e=O(e,t),P(C(n,(function(n,t,i){return{value:n,index:r++,criteria:e(n,t,i)}})).sort((function(n,e){var t=n.criteria,r=e.criteria;if(t!==r){if(t>r||void 0===t)return 1;if(t<r||void 0===r)return-1}return n.index-e.index})),"value")}function Q(n,e){return function(t,r,i){var o=e?[[],[]]:{};return r=O(r,i),E(t,(function(e,i){var u=r(e,i,t);n(o,e,u)})),o}}var X=Q((function(n,e,t){B(n,t)?n[t].push(e):n[t]=[e]})),Y=Q((function(n,e,t){n[t]=e})),nn=Q((function(n,e,t){B(n,t)?n[t]++:n[t]=1})),en=/[^\ud800-\udfff]|[\ud800-\udbff][\udc00-\udfff]|[\ud800-\udfff]/g;function tn(n){return n?be(n)?a.call(n):Oe(n)?n.match(en):D(n)?C(n,Ie):Hn(n):[]}function rn(n){return null==n?0:D(n)?n.length:Jn(n).length}var on=Q((function(n,e,t){n[t?0:1].push(e)}),!0);function un(n,e,t){return null==n||n.length<1?null==e?void 0:[]:null==e||t?n[0]:cn(n,n.length-e)}function cn(n,e,t){return a.call(n,0,Math.max(0,n.length-(null==e||t?1:e)))}function an(n,e,t){return null==n||n.length<1?null==e?void 0:[]:null==e||t?n[n.length-1]:dn(n,Math.max(0,n.length-e))}function dn(n,e,t){return a.call(n,null==e||t?1:e)}function sn(n){return T(n,Boolean)}function fn(n,e,t,r){for(var i=(r=r||[]).length,o=0,u=z(n);o<u;o++){var c=n[o];if(D(c)&&(be(c)||ge(c)))if(e)for(var a=0,d=c.length;a<d;)r[i++]=c[a++];else fn(c,e,t,r),i=r.length;else t||(r[i++]=c)}return r}function ln(n,e){return fn(n,e,!1)}var mn=w((function(n,e){return yn(n,e)}));function pn(n,e,t,r){_e(e)||(r=t,t=e,e=!1),null!=t&&(t=O(t,r));for(var i=[],o=[],u=0,c=z(n);u<c;u++){var a=n[u],d=t?t(a,u,n):a;e&&!t?(u&&o===d||i.push(a),o=d):t?V(o,d)||(o.push(d),i.push(a)):V(i,a)||i.push(a)}return i}var hn=w((function(n){return pn(fn(n,!0,!0))}));function An(n){for(var e=[],t=arguments.length,r=0,i=z(n);r<i;r++){var o=n[r];if(!V(e,o)){var u;for(u=1;u<t&&V(arguments[u],o);u++);u===t&&e.push(o)}}return e}var yn=w((function(n,e){return e=fn(e,!0,!0),T(n,(function(n){return!V(e,n)}))}));function bn(n){for(var e=n&&Z(n,z).length||0,t=Array(e),r=0;r<e;r++)t[r]=P(n,r);return t}var vn=w(bn);function gn(n,e){for(var t={},r=0,i=z(n);r<i;r++)e?t[n[r]]=e[r]:t[n[r][0]]=n[r][1];return t}function qn(n){return function(e,t,r){t=O(t,r);for(var i=z(e),o=n>0?0:i-1;o>=0&&o<i;o+=n)if(t(e[o],o,e))return o;return-1}}var On=qn(1),wn=qn(-1);function xn(n,e,t,r){for(var i=(t=O(t,r,1))(e),o=0,u=z(n);o<u;){var c=Math.floor((o+u)/2);t(n[c])<i?o=c+1:u=c}return o}function Sn(n,e,t){return function(r,i,o){var u=0,c=z(r);if("number"==typeof o)n>0?u=o>=0?o:Math.max(o+c,u):c=o>=0?Math.min(o+1,c):o+c+1;else if(t&&o&&c)return r[o=t(r,i)]===i?o:-1;if(i!=i)return(o=e(a.call(r,u,c),Ne))>=0?o+u:-1;for(o=n>0?u:c-1;o>=0&&o<c;o+=n)if(r[o]===i)return o;return-1}}var Bn=Sn(1,On,xn),Fn=Sn(-1,wn);function jn(n,e,t){null==e&&(e=n||0,n=0),t||(t=e<n?-1:1);for(var r=Math.max(Math.ceil((e-n)/t),0),i=Array(r),o=0;o<r;o++,n+=t)i[o]=n;return i}function zn(n,e){if(null==e||e<1)return[];for(var t=[],r=0,i=n.length;r<i;)t.push(a.call(n,r,r+=e));return t}function Dn(n,e,t,r,i){if(!(r instanceof e))return n.apply(t,i);var o=x(n.prototype),u=n.apply(o,i);return ve(u)?u:o}var En=w((function(n,e,t){if(!qe(n))throw new TypeError("Bind must be called on a function");var r=w((function(i){return Dn(n,r,e,this,t.concat(i))}));return r})),Cn=w((function(n,e){var t=Cn.placeholder,r=function(){for(var i=0,o=e.length,u=Array(o),c=0;c<o;c++)u[c]=e[c]===t?arguments[i++]:e[c];for(;i<arguments.length;)u.push(arguments[i++]);return Dn(n,r,this,this,u)};return r}));Cn.placeholder=y;var Ln=w((function(n,e){var t=(e=fn(e,!1,!1)).length;if(t<1)throw new Error("bindAll must be passed function names");for(;t--;){var r=e[t];n[r]=En(n[r],n)}}));function Nn(n,e){var t=function(r){var i=t.cache,o=""+(e?e.apply(this,arguments):r);return B(i,o)||(i[o]=n.apply(this,arguments)),i[o]};return t.cache={},t}var _n=w((function(n,e,t){return setTimeout((function(){return n.apply(null,t)}),e)})),Gn=Cn(_n,y,1);function Tn(n,e,t){var r,i,o,u,c=0;t||(t={});var a=function(){c=!1===t.leading?0:Ke(),r=null,u=n.apply(i,o),r||(i=o=null)},d=function(){var d=Ke();c||!1!==t.leading||(c=d);var s=e-(d-c);return i=this,o=arguments,s<=0||s>e?(r&&(clearTimeout(r),r=null),c=d,u=n.apply(i,o),r||(i=o=null)):r||!1===t.trailing||(r=setTimeout(a,s)),u};return d.cancel=function(){clearTimeout(r),c=0,r=i=o=null},d}function Mn(n,e,t){var r,i,o=function(e,t){r=null,t&&(i=n.apply(e,t))},u=w((function(u){if(r&&clearTimeout(r),t){var c=!r;r=setTimeout(o,e),c&&(i=n.apply(this,u))}else r=_n(o,e,this,u);return i}));return u.cancel=function(){clearTimeout(r),r=null},u}function In(n,e){return Cn(e,n)}function kn(n){return function(){return!n.apply(this,arguments)}}function Vn(){var n=arguments,e=n.length-1;return function(){for(var t=e,r=n[e].apply(this,arguments);t--;)r=n[t].call(this,r);return r}}function Rn(n,e){return function(){if(--n<1)return e.apply(this,arguments)}}function Pn(n,e){var t;return function(){return--n>0&&(t=e.apply(this,arguments)),n<=1&&(e=null),t}}var Wn=Cn(Pn,2),$n=!{toString:null}.propertyIsEnumerable("toString"),Zn=["valueOf","isPrototypeOf","toString","propertyIsEnumerable","hasOwnProperty","toLocaleString"];function Kn(n,e){var t=Zn.length,r=n.constructor,i=qe(r)&&r.prototype||o,u="constructor";for(B(n,u)&&!V(e,u)&&e.push(u);t--;)(u=Zn[t])in n&&n[u]!==i[u]&&!V(e,u)&&e.push(u)}function Jn(n){if(!ve(n))return[];if(l)return l(n);var e=[];for(var t in n)B(n,t)&&e.push(t);return $n&&Kn(n,e),e}function Un(n){if(!ve(n))return[];var e=[];for(var t in n)e.push(t);return $n&&Kn(n,e),e}function Hn(n){for(var e=Jn(n),t=e.length,r=Array(t),i=0;i<t;i++)r[i]=n[e[i]];return r}function Qn(n,e,t){e=O(e,t);for(var r=Jn(n),i=r.length,o={},u=0;u<i;u++){var c=r[u];o[c]=e(n[c],c,n)}return o}function Xn(n){for(var e=Jn(n),t=e.length,r=Array(t),i=0;i<t;i++)r[i]=[e[i],n[e[i]]];return r}function Yn(n){for(var e={},t=Jn(n),r=0,i=t.length;r<i;r++)e[n[t[r]]]=t[r];return e}function ne(n){var e=[];for(var t in n)qe(n[t])&&e.push(t);return e.sort()}function ee(n,e){return function(t){var r=arguments.length;if(e&&(t=Object(t)),r<2||null==t)return t;for(var i=1;i<r;i++)for(var o=arguments[i],u=n(o),c=u.length,a=0;a<c;a++){var d=u[a];e&&void 0!==t[d]||(t[d]=o[d])}return t}}var te=ee(Un),re=ee(Jn);function ie(n,e,t){e=O(e,t);for(var r,i=Jn(n),o=0,u=i.length;o<u;o++)if(e(n[r=i[o]],r,n))return r}function oe(n,e,t){return e in t}var ue=w((function(n,e){var t={},r=e[0];if(null==n)return t;qe(r)?(e.length>1&&(r=v(r,e[1])),e=Un(n)):(r=oe,e=fn(e,!1,!1),n=Object(n));for(var i=0,o=e.length;i<o;i++){var u=e[i],c=n[u];r(c,u,n)&&(t[u]=c)}return t})),ce=w((function(n,e){var t,r=e[0];return qe(r)?(r=kn(r),e.length>1&&(t=e[1])):(e=C(fn(e,!1,!1),String),r=function(n,t){return!V(e,t)}),ue(n,r,t)})),ae=ee(Un,!0);function de(n,e){var t=x(n);return e&&re(t,e),t}function se(n){return ve(n)?be(n)?n.slice():te({},n):n}function fe(n,e){return e(n),n}function le(n,e){var t=Jn(e),r=t.length;if(null==n)return!r;for(var i=Object(n),o=0;o<r;o++){var u=t[o];if(e[u]!==i[u]||!(u in i))return!1}return!0}function me(n,e,t,r){if(n===e)return 0!==n||1/n==1/e;if(null==n||null==e)return!1;if(n!=n)return e!=e;var i=typeof n;return("function"===i||"object"===i||"object"==typeof e)&&function(n,e,t,r){n instanceof y&&(n=n._wrapped);e instanceof y&&(e=e._wrapped);var i=d.call(n);if(i!==d.call(e))return!1;switch(i){case"[object RegExp]":case"[object String]":return""+n==""+e;case"[object Number]":return+n!=+n?+e!=+e:0==+n?1/+n==1/e:+n==+e;case"[object Date]":case"[object Boolean]":return+n==+e;case"[object Symbol]":return u.valueOf.call(n)===u.valueOf.call(e)}var o="[object Array]"===i;if(!o){if("object"!=typeof n||"object"!=typeof e)return!1;var c=n.constructor,a=e.constructor;if(c!==a&&!(qe(c)&&c instanceof c&&qe(a)&&a instanceof a)&&"constructor"in n&&"constructor"in e)return!1}r=r||[];var s=(t=t||[]).length;for(;s--;)if(t[s]===n)return r[s]===e;if(t.push(n),r.push(e),o){if((s=n.length)!==e.length)return!1;for(;s--;)if(!me(n[s],e[s],t,r))return!1}else{var f,l=Jn(n);if(s=l.length,Jn(e).length!==s)return!1;for(;s--;)if(f=l[s],!B(e,f)||!me(n[f],e[f],t,r))return!1}return t.pop(),r.pop(),!0}(n,e,t,r)}function pe(n,e){return me(n,e)}function he(n){return null==n||(D(n)&&(be(n)||Oe(n)||ge(n))?0===n.length:0===Jn(n).length)}function Ae(n){return!(!n||1!==n.nodeType)}function ye(n){return function(e){return d.call(e)==="[object "+n+"]"}}var be=f||ye("Array");function ve(n){var e=typeof n;return"function"===e||"object"===e&&!!n}var ge=ye("Arguments"),qe=ye("Function"),Oe=ye("String"),we=ye("Number"),xe=ye("Date"),Se=ye("RegExp"),Be=ye("Error"),Fe=ye("Symbol"),je=ye("Map"),ze=ye("WeakMap"),De=ye("Set"),Ee=ye("WeakSet");!function(){ge(arguments)||(ge=function(n){return B(n,"callee")})}();var Ce=r.document&&r.document.childNodes;function Le(n){return!Fe(n)&&h(n)&&!p(parseFloat(n))}function Ne(n){return we(n)&&p(n)}function _e(n){return!0===n||!1===n||"[object Boolean]"===d.call(n)}function Ge(n){return null===n}function Te(n){return void 0===n}function Me(n,e){if(!be(e))return B(n,e);for(var t=e.length,r=0;r<t;r++){var i=e[r];if(null==n||!s.call(n,i))return!1;n=n[i]}return!!t}function Ie(n){return n}function ke(n){return function(){return n}}function Ve(){}function Re(n){return be(n)?function(e){return F(e,n)}:S(n)}function Pe(n){return null==n?function(){}:function(e){return be(e)?F(n,e):n[e]}}function We(n){return n=re({},n),function(e){return le(e,n)}}function $e(n,e,t){var r=Array(Math.max(0,n));e=v(e,t,1);for(var i=0;i<n;i++)r[i]=e(i);return r}function Ze(n,e){return null==e&&(e=n,n=0),n+Math.floor(Math.random()*(e-n+1))}"object"!=typeof Int8Array&&"function"!=typeof Ce&&(qe=function(n){return"function"==typeof n||!1});var Ke=Date.now||function(){return(new Date).getTime()},Je={"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#x27;","`":"&#x60;"},Ue=Yn(Je);function He(n){var e=function(e){return n[e]},t="(?:"+Jn(n).join("|")+")",r=RegExp(t),i=RegExp(t,"g");return function(n){return n=null==n?"":""+n,r.test(n)?n.replace(i,e):n}}var Qe=He(Je),Xe=He(Ue);function Ye(n,e,t){be(e)||(e=[e]);var r=e.length;if(!r)return qe(t)?t.call(n):t;for(var i=0;i<r;i++){var o=null==n?void 0:n[e[i]];void 0===o&&(o=t,i=r),n=qe(o)?o.call(n):o}return n}var nt=0;function et(n){var e=++nt+"";return n?n+e:e}var tt=y.templateSettings={evaluate:/<%([\s\S]+?)%>/g,interpolate:/<%=([\s\S]+?)%>/g,escape:/<%-([\s\S]+?)%>/g},rt=/(.)^/,it={"'":"'","\\":"\\","\r":"r","\n":"n","\u2028":"u2028","\u2029":"u2029"},ot=/\\|'|\r|\n|\u2028|\u2029/g,ut=function(n){return"\\"+it[n]};function ct(n,e,t){!e&&t&&(e=t),e=ae({},e,y.templateSettings);var r,i=RegExp([(e.escape||rt).source,(e.interpolate||rt).source,(e.evaluate||rt).source].join("|")+"|$","g"),o=0,u="__p+='";n.replace(i,(function(e,t,r,i,c){return u+=n.slice(o,c).replace(ot,ut),o=c+e.length,t?u+="'+\n((__t=("+t+"))==null?'':_.escape(__t))+\n'":r?u+="'+\n((__t=("+r+"))==null?'':__t)+\n'":i&&(u+="';\n"+i+"\n__p+='"),e})),u+="';\n",e.variable||(u="with(obj||{}){\n"+u+"}\n"),u="var __t,__p='',__j=Array.prototype.join,print=function(){__p+=__j.call(arguments,'');};\n"+u+"return __p;\n";try{r=new Function(e.variable||"obj","_",u)}catch(n){throw n.source=u,n}var c=function(n){return r.call(this,n,y)},a=e.variable||"obj";return c.source="function("+a+"){\n"+u+"}",c}function at(n){var e=y(n);return e._chain=!0,e}function dt(n,e){return n._chain?y(e).chain():e}function st(n){return E(ne(n),(function(e){var t=y[e]=n[e];y.prototype[e]=function(){var n=[this._wrapped];return c.apply(n,arguments),dt(this,t.apply(y,n))}})),y}E(["pop","push","reverse","shift","sort","splice","unshift"],(function(n){var e=i[n];y.prototype[n]=function(){var t=this._wrapped;return e.apply(t,arguments),"shift"!==n&&"splice"!==n||0!==t.length||delete t[0],dt(this,t)}})),E(["concat","join","slice"],(function(n){var e=i[n];y.prototype[n]=function(){return dt(this,e.apply(this._wrapped,arguments))}})),y.prototype.value=function(){return this._wrapped},y.prototype.valueOf=y.prototype.toJSON=y.prototype.value,y.prototype.toString=function(){return String(this._wrapped)}}.call(this,t(4))},function(n,e,t){const r=t(2),i=t(3).findMatches;const o={generatePatternMatchers:function(){return r.map(n=>({sequenceLabel:n.sequenceLabel,sequenceNumber:""+n.sequenceNumber,sequenceColor:n.sequenceColor,sequenceDescription:n.sequenceDescription,fn:e=>i(e,n)}))}};n.exports.default=o},function(n,e){n.exports=[{sequenceNumber:1.1,sequenceColor:"#fef2cb",sequenceLabel:"Search position and add annotation",sequenceDescription:"Bei dieser Sequenz wird mit einer Absicht nach einer Stelle im Video gesucht, um dort eine Annotation hinzuzufügen.",minActions:3,maxActions:5,mandatoryActions:[["C","D"],"E"],actionsAllowedOnce:["E"],forbiddenActions:["F","G"],mandatoryFirstAction:["A","B","C","D"],mandatoryLastAction:["E"],mandatoryActionOrder:"",mandatoryTypeOrder:""},{sequenceNumber:1.2,sequenceColor:"#ffe598",sequenceLabel:"Search position and add annotation and adjust time",sequenceDescription:"Bei dieser Sequenz wird mit einer Absicht nach einer Stelle im Video gesucht, um dort eine Annotation hinzuzufügen und die Zeitdauer manuell angepasst",minActions:3,maxActions:6,mandatoryActions:[["C","D"],"E","G"],actionsAllowedOnce:["E","G"],forbiddenActions:["F"],mandatoryFirstAction:["A","B","C","D"],mandatoryLastAction:["G"],mandatoryActionOrder:"",mandatoryTypeOrder:""},{sequenceNumber:1.3,sequenceColor:"#ffd965",sequenceLabel:"Search position and create annotation",sequenceDescription:"Bei dieser Sequenz wird mit einer Absicht nach einer Stelle im Video gesucht, um dort eine Annotation hinzuzufügen und ein selbstverfasster Text zu schreiben",minActions:3,maxActions:6,mandatoryActions:[["C","D"],"E","F"],actionsAllowedOnce:["E","F"],forbiddenActions:["G"],mandatoryFirstAction:["A","B","C","D"],mandatoryLastAction:["F"],mandatoryActionOrder:"",mandatoryTypeOrder:""},{sequenceNumber:1.4,sequenceColor:"#bf9000",sequenceLabel:"Search position and create annotation and adjust time",sequenceDescription:"Bei dieser Sequenz wird mit einer Absicht nach einer Stelle im Video gesucht, um dort eine Annotation hinzuzufügen und ein selbstverfasster Text zu schreiben und die Zeitdauer manuell anzupassen",minActions:4,maxActions:8,mandatoryActions:[["C","D"],"E","F","G"],actionsAllowedOnce:["E","F","G"],forbiddenActions:[],mandatoryFirstAction:["A","B","C","D"],mandatoryLastAction:["F","G"],mandatoryActionOrder:"",mandatoryTypeOrder:""},{sequenceNumber:2.1,sequenceColor:"#deeaf6",sequenceLabel:"Search to adjust annotation time",sequenceDescription:"Bei dieser Sequenz wird für bestehende Annotationen mit einer Absicht nach passenderen Stellen im Video gesucht und diese dann dementsprechen zeitlich angepasst.",minActions:3,maxActions:3,mandatoryActions:[["C","D"],"G"],actionsAllowedOnce:["G"],forbiddenActions:["E","F"],mandatoryFirstAction:["A","B","C","D"],mandatoryLastAction:["G"],mandatoryActionOrder:"",mandatoryTypeOrder:""},{sequenceNumber:2.1,sequenceColor:"#deeaf6",sequenceLabel:"Search to adjust annotation time",sequenceDescription:"Bei dieser Sequenz wird für bestehende Annotationen mit einer Absicht nach passenderen Stellen im Video gesucht und diese dann dementsprechen zeitlich angepasst.",minActions:4,maxActions:5,mandatoryActions:[["C","D"],"G"],actionsAllowedOnce:[],forbiddenActions:["E","F"],mandatoryFirstAction:["A","B","C","D"],mandatoryLastAction:["G"],mandatoryActionOrder:"",mandatoryTypeOrder:""},{sequenceNumber:2.2,sequenceColor:"#bdd6ee",sequenceLabel:"Search to change / complement annotation text",sequenceDescription:"Bei dieser Sequenz werden zu bestehenden Annotationen weitere Informationen aus bereits gesehenen Videostellen hinzugefügt, indem diese relevanten Stellen jedoch nochmals mit einer Absicht gesucht werden.",minActions:3,maxActions:4,mandatoryActions:[["C","D"],"F"],actionsAllowedOnce:["F"],forbiddenActions:["E","G"],mandatoryFirstAction:["A","B","C","D"],mandatoryLastAction:["F"],mandatoryActionOrder:"",mandatoryTypeOrder:""},{sequenceNumber:2.2,sequenceColor:"#bdd6ee",sequenceLabel:"Search to change / complement annotation text",sequenceDescription:"Bei dieser Sequenz werden zu bestehenden Annotationen weitere Informationen aus bereits gesehenen Videostellen hinzugefügt, indem diese relevanten Stellen jedoch nochmals mit einer Absicht gesucht werden.",minActions:5,maxActions:5,mandatoryActions:[["C","D"],"F"],actionsAllowedOnce:[],forbiddenActions:["E","G"],mandatoryFirstAction:["A","B","C","D"],mandatoryLastAction:["F"],mandatoryActionOrder:"",mandatoryTypeOrder:""},{sequenceNumber:2.3,sequenceColor:"#9cc2e5",sequenceLabel:"Search to change / complement annotation and adjust time",sequenceDescription:"Bei dieser Sequenz wird für bestehende Annotationen mit einer Absicht nach passenderen Stellen im Video gesucht, um diese zu ergänzen und sie zusätzlich noch zeitlich anzupassen.",minActions:4,maxActions:4,mandatoryActions:[["C","D"],"F","G"],actionsAllowedOnce:["F","G"],forbiddenActions:["E"],mandatoryFirstAction:["A","B","C","D"],mandatoryLastAction:["F","G"],mandatoryActionOrder:"",mandatoryTypeOrder:""},{sequenceNumber:2.3,sequenceColor:"#9cc2e5",sequenceLabel:"Search to change / complement annotation and adjust time",sequenceDescription:"Bei dieser Sequenz wird für bestehende Annotationen mit einer Absicht nach passenderen Stellen im Video gesucht, um diese zu ergänzen und sie zusätzlich noch zeitlich anzupassen.",minActions:5,maxActions:6,mandatoryActions:[["C","D"],"F","G"],actionsAllowedOnce:[],forbiddenActions:["E"],mandatoryFirstAction:["A","B","C","D"],mandatoryLastAction:["F","G"],mandatoryActionOrder:"",mandatoryTypeOrder:""},{sequenceNumber:3.1,sequenceColor:"#fbe4d5",sequenceLabel:"Find position and add new annotation",sequenceDescription:"Bei dieser Sequenz wird passiv, d.h. beim Schauen des Videos eine passende Stelle gefunden, und an dieser Stelle wird eine Annotation hinzugefügt.",minActions:2,maxActions:3,mandatoryActions:[["A","B"],"E"],actionsAllowedOnce:["A","B","E"],forbiddenActions:["C","D","G","F"],mandatoryFirstAction:["A","B"],mandatoryLastAction:["E"],mandatoryActionOrder:"",mandatoryTypeOrder:""},{sequenceNumber:3.2,sequenceColor:"#f7caac",sequenceLabel:"Find position and add annotation and adjust time",sequenceDescription:"Bei dieser Sequenz wird passiv, d.h. beim Schauen des Videos eine passende Stelle gefunden, und an dieser Stelle wird eine Annotation hinzugefügt und diese zeitlich angepasst.",minActions:3,maxActions:5,mandatoryActions:[["A","B"],"E","G"],actionsAllowedOnce:["E"],forbiddenActions:["C","D","F"],mandatoryFirstAction:["A","B"],mandatoryLastAction:["G"],mandatoryActionOrder:"",mandatoryTypeOrder:""},{sequenceNumber:3.3,sequenceColor:"#f4b083",sequenceLabel:"Find position and create new annotation",sequenceDescription:"Bei dieser Sequenz wird passiv, d.h. beim Schauen des Videos eine passende Stelle gefunden, und an dieser Stelle wird eine Annotation hinzugefügt und ein selbstverfasster Text geschrieben.",minActions:3,maxActions:5,mandatoryActions:[["A","B"],"E","F"],actionsAllowedOnce:["E"],forbiddenActions:["C","D","G"],mandatoryFirstAction:["A","B"],mandatoryLastAction:["F"],mandatoryActionOrder:"",mandatoryTypeOrder:""},{sequenceNumber:3.4,sequenceColor:"#c55a11",sequenceLabel:"Find position and create annotation and adjust time",sequenceDescription:"Bei dieser Sequenz wird passiv, d.h. beim Schauen des Videos eine passende Stelle gefunden, und an dieser Stelle wird eine Annotation hinzugefügt, ein selbstverfasster Text geschrieben und die Zeitdauer manuell angepasst",minActions:4,maxActions:6,mandatoryActions:[["A","B"],"E","F","G"],actionsAllowedOnce:["E"],forbiddenActions:["C","D"],mandatoryFirstAction:["A","B"],mandatoryLastAction:["F","G"],mandatoryActionOrder:"",mandatoryTypeOrder:""},{sequenceNumber:4.1,sequenceColor:"#e2efd9",sequenceLabel:"Find position and adjust annotation time",sequenceDescription:"Bei dieser Sequenz wird die Zeit von bestehende Annotationen verändert, weil beiläufig eine bessere Stelle für diese Annotationen gefunden wird.",minActions:2,maxActions:3,mandatoryActions:[["A","B"],"G"],actionsAllowedOnce:["G"],forbiddenActions:["C","D","E","F"],mandatoryFirstAction:["A","B"],mandatoryLastAction:["G"],mandatoryActionOrder:"",mandatoryTypeOrder:""},{sequenceNumber:4.1,sequenceColor:"#e2efd9",sequenceLabel:"Find position and adjust annotation time",sequenceDescription:"Bei dieser Sequenz wird die Zeit von bestehende Annotationen veränder, weil beiläufig eine bessere Stelle für diese Annotationen gefunden wird.",minActions:4,maxActions:5,mandatoryActions:[["A","B"],"G"],actionsAllowedOnce:[],forbiddenActions:["C","D","E","F"],mandatoryFirstAction:["A","B"],mandatoryLastAction:["G"],mandatoryActionOrder:"",mandatoryTypeOrder:""},{sequenceNumber:4.2,sequenceColor:"#c5e0b3",sequenceLabel:"Add further video information to annotation",sequenceDescription:"Bei dieser Sequenz werden zu bestehenden Annotationen weitere Informationen hinzugefügt.",minActions:2,maxActions:3,mandatoryActions:[["A","B"],"F"],actionsAllowedOnce:["F"],forbiddenActions:["C","D","E","G"],mandatoryFirstAction:["A","B"],mandatoryLastAction:["F"],mandatoryActionOrder:"",mandatoryTypeOrder:""},{sequenceNumber:4.2,sequenceColor:"#c5e0b3",sequenceLabel:"Add further video information to annotation",sequenceDescription:"Bei dieser Sequenz werden zu bestehenden Annotationen weitere Informationen hinzugefügt.",minActions:4,maxActions:5,mandatoryActions:[["A","B"],"F"],actionsAllowedOnce:[],forbiddenActions:["C","D","E","G"],mandatoryFirstAction:["A","B"],mandatoryLastAction:["F"],mandatoryActionOrder:"",mandatoryTypeOrder:""},{sequenceNumber:4.3,sequenceColor:"#a8d08d",sequenceLabel:"Add further video information to annotation and adjust time",sequenceDescription:"Bei dieser Sequenz werden zu bestehenden Annotationen weitere Informationen hinzugefügt und die Zeit der Annotation verändert",minActions:3,maxActions:4,mandatoryActions:[["A","B"],"F","G"],actionsAllowedOnce:["F","G"],forbiddenActions:["C","D","E"],mandatoryFirstAction:["A","B"],mandatoryLastAction:["F","G"],mandatoryActionOrder:"",mandatoryTypeOrder:""},{sequenceNumber:4.3,sequenceColor:"#a8d08d",sequenceLabel:"Add further video information to annotation and adjust time",sequenceDescription:"Bei dieser Sequenz werden zu bestehenden Annotationen weitere Informationen hinzugefügt und die Zeit der Annotation verändert",minActions:5,maxActions:5,mandatoryActions:[["A","B"],"F","G"],actionsAllowedOnce:[],forbiddenActions:["C","D","E"],mandatoryFirstAction:["A","B"],mandatoryLastAction:["F","G"],mandatoryActionOrder:"",mandatoryTypeOrder:""},{sequenceNumber:5.1,sequenceColor:"#d0cece",sequenceLabel:"Rewatch",sequenceDescription:"Bei dieser Sequenz wird eine Stelle im Video mit einer Absicht erneut angeschaut.",minActions:3,maxActions:5,mandatoryActions:["A","B","C"],actionsAllowedOnce:[],forbiddenActions:["D","E","G","F"],mandatoryFirstAction:["A","B","C"],mandatoryLastAction:["A","B","C"],mandatoryActionOrder:"",mandatoryTypeOrder:""},{sequenceNumber:5.2,sequenceColor:"#adaaab",sequenceLabel:"Jump forward",sequenceDescription:"Bei dieser Sequenz wird eine Stelle im Video mit einer Absicht erneut angeschaut.",minActions:3,maxActions:5,mandatoryActions:["A","B","D"],actionsAllowedOnce:[],forbiddenActions:["C","E","G","F"],mandatoryFirstAction:["A","B","D"],mandatoryLastAction:["A","B","D"],mandatoryActionOrder:"",mandatoryTypeOrder:""},{sequenceNumber:5.3,sequenceColor:"#747171",sequenceLabel:"Skipping",sequenceDescription:"Bei dieser Sequenz wird eine Stelle im Video mit einer Absicht erneut angeschaut.",minActions:3,maxActions:5,mandatoryActions:["A","B","C","D"],actionsAllowedOnce:[],forbiddenActions:["E","G","F"],mandatoryFirstAction:["A","B","C","D"],mandatoryLastAction:["A","B","C","D"],mandatoryActionOrder:"",mandatoryTypeOrder:""}]},function(n,e,t){const r=t(5);function i(n){let e=[];const t=n.mandatoryFirstAction.join(""),r=n.forbiddenActions.join(""),i=n.mandatoryLastAction.join(""),o=n.minActions-2,u=n.maxActions-2;for(var c=0;c<t.length;c++)e.push(new RegExp(`[${t[c]}][^${r}]{${o},${u}}[${i}]`,"g"));for(var a=0;a<i.length;a++)e.push(new RegExp(`[${t}][^${r}]{${o},${u}}[${i[a]}]`,"g"));return e}function o(n,e){let t=n;const i=e.filter(Array.isArray),o=e.filter(n=>!Array.isArray(n));return i.forEach(n=>{t=t.filter(e=>s(e.match,n))}),t=t.filter(n=>{return e=n.match,t=o,r.every(t,n=>r.filter(e,e=>e===n).length<=1);var e,t}),t}function u(n,e){let t=n;const r=e.filter(Array.isArray),i=e.filter(n=>!Array.isArray(n));return r.forEach(n=>{t=t.filter(e=>d(e.match,n))}),t=t.filter(n=>a(n.match,i)),t}function c(n,e){const t=[];function r(n,e,i){let o=e.exec(n);o&&(t.push({match:o[0],startPos:i+o.index,endPos:i+o.index+o[0].length-1}),i=i+o.index+1,e.lastIndex=0,r(n.substring(o.index+1),e,i),r(o[0].substring(0,o[0].length-1),e,i-1),r(o[0].substring(1),e,i))}for(var i=0;i<e.length;i++){for(;null!=(match=e[i].exec(n));)t.push({match:match[0],startPos:match.index,endPos:match.index+match[0].length-1});r(n,e[i],0)}return t}function a(n,e){return r.every(e,e=>r.contains(n,e))}function d(n,e){return r.some(e,e=>r.contains(n,e))}function s(n,e){return 1===r.filter(n,n=>r.contains(e,n)).length}n.exports.findMatches=function(n,e){let t=c(n,i(e)).filter((n,e,t)=>t.findIndex(e=>JSON.stringify(e)===JSON.stringify(n))===e);return e.mandatoryActions.length>0&&(t=u(t,e.mandatoryActions)),e.actionsAllowedOnce.length>0&&(t=o(t,e.actionsAllowedOnce)),t},n.exports.buildRegex=i,n.exports.filterByMandatoryActions=u,n.exports.filterByActionsAllowedOnce=o,n.exports.findMatchesWithStartEnd=c,n.exports.containsAll=a,n.exports.containsSome=d,n.exports.containsOnce=function(n,e){return r.every(e,e=>1===r.filter(n,n=>n===e).length)},n.exports.containsNone=function(n,e){return r.every(e,e=>!r.contains(n,e))},n.exports.containsMaxOne=s},function(n,e){var t;t=function(){return this}();try{t=t||new Function("return this")()}catch(n){"object"==typeof window&&(t=window)}n.exports=t},function(n,e,t){"use strict";t.r(e),t.d(e,"default",(function(){return o})),t.d(e,"VERSION",(function(){return r.VERSION})),t.d(e,"iteratee",(function(){return r.iteratee})),t.d(e,"restArguments",(function(){return r.restArguments})),t.d(e,"each",(function(){return r.each})),t.d(e,"forEach",(function(){return r.forEach})),t.d(e,"map",(function(){return r.map})),t.d(e,"collect",(function(){return r.collect})),t.d(e,"reduce",(function(){return r.reduce})),t.d(e,"foldl",(function(){return r.foldl})),t.d(e,"inject",(function(){return r.inject})),t.d(e,"reduceRight",(function(){return r.reduceRight})),t.d(e,"foldr",(function(){return r.foldr})),t.d(e,"find",(function(){return r.find})),t.d(e,"detect",(function(){return r.detect})),t.d(e,"filter",(function(){return r.filter})),t.d(e,"select",(function(){return r.select})),t.d(e,"reject",(function(){return r.reject})),t.d(e,"every",(function(){return r.every})),t.d(e,"all",(function(){return r.all})),t.d(e,"some",(function(){return r.some})),t.d(e,"any",(function(){return r.any})),t.d(e,"contains",(function(){return r.contains})),t.d(e,"includes",(function(){return r.includes})),t.d(e,"include",(function(){return r.include})),t.d(e,"invoke",(function(){return r.invoke})),t.d(e,"pluck",(function(){return r.pluck})),t.d(e,"where",(function(){return r.where})),t.d(e,"findWhere",(function(){return r.findWhere})),t.d(e,"max",(function(){return r.max})),t.d(e,"min",(function(){return r.min})),t.d(e,"shuffle",(function(){return r.shuffle})),t.d(e,"sample",(function(){return r.sample})),t.d(e,"sortBy",(function(){return r.sortBy})),t.d(e,"groupBy",(function(){return r.groupBy})),t.d(e,"indexBy",(function(){return r.indexBy})),t.d(e,"countBy",(function(){return r.countBy})),t.d(e,"toArray",(function(){return r.toArray})),t.d(e,"size",(function(){return r.size})),t.d(e,"partition",(function(){return r.partition})),t.d(e,"first",(function(){return r.first})),t.d(e,"head",(function(){return r.head})),t.d(e,"take",(function(){return r.take})),t.d(e,"initial",(function(){return r.initial})),t.d(e,"last",(function(){return r.last})),t.d(e,"rest",(function(){return r.rest})),t.d(e,"tail",(function(){return r.tail})),t.d(e,"drop",(function(){return r.drop})),t.d(e,"compact",(function(){return r.compact})),t.d(e,"flatten",(function(){return r.flatten})),t.d(e,"without",(function(){return r.without})),t.d(e,"uniq",(function(){return r.uniq})),t.d(e,"unique",(function(){return r.unique})),t.d(e,"union",(function(){return r.union})),t.d(e,"intersection",(function(){return r.intersection})),t.d(e,"difference",(function(){return r.difference})),t.d(e,"unzip",(function(){return r.unzip})),t.d(e,"zip",(function(){return r.zip})),t.d(e,"object",(function(){return r.object})),t.d(e,"findIndex",(function(){return r.findIndex})),t.d(e,"findLastIndex",(function(){return r.findLastIndex})),t.d(e,"sortedIndex",(function(){return r.sortedIndex})),t.d(e,"indexOf",(function(){return r.indexOf})),t.d(e,"lastIndexOf",(function(){return r.lastIndexOf})),t.d(e,"range",(function(){return r.range})),t.d(e,"chunk",(function(){return r.chunk})),t.d(e,"bind",(function(){return r.bind})),t.d(e,"partial",(function(){return r.partial})),t.d(e,"bindAll",(function(){return r.bindAll})),t.d(e,"memoize",(function(){return r.memoize})),t.d(e,"delay",(function(){return r.delay})),t.d(e,"defer",(function(){return r.defer})),t.d(e,"throttle",(function(){return r.throttle})),t.d(e,"debounce",(function(){return r.debounce})),t.d(e,"wrap",(function(){return r.wrap})),t.d(e,"negate",(function(){return r.negate})),t.d(e,"compose",(function(){return r.compose})),t.d(e,"after",(function(){return r.after})),t.d(e,"before",(function(){return r.before})),t.d(e,"once",(function(){return r.once})),t.d(e,"keys",(function(){return r.keys})),t.d(e,"allKeys",(function(){return r.allKeys})),t.d(e,"values",(function(){return r.values})),t.d(e,"mapObject",(function(){return r.mapObject})),t.d(e,"pairs",(function(){return r.pairs})),t.d(e,"invert",(function(){return r.invert})),t.d(e,"functions",(function(){return r.functions})),t.d(e,"methods",(function(){return r.methods})),t.d(e,"extend",(function(){return r.extend})),t.d(e,"extendOwn",(function(){return r.extendOwn})),t.d(e,"assign",(function(){return r.assign})),t.d(e,"findKey",(function(){return r.findKey})),t.d(e,"pick",(function(){return r.pick})),t.d(e,"omit",(function(){return r.omit})),t.d(e,"defaults",(function(){return r.defaults})),t.d(e,"create",(function(){return r.create})),t.d(e,"clone",(function(){return r.clone})),t.d(e,"tap",(function(){return r.tap})),t.d(e,"isMatch",(function(){return r.isMatch})),t.d(e,"isEqual",(function(){return r.isEqual})),t.d(e,"isEmpty",(function(){return r.isEmpty})),t.d(e,"isElement",(function(){return r.isElement})),t.d(e,"isArray",(function(){return r.isArray})),t.d(e,"isObject",(function(){return r.isObject})),t.d(e,"isArguments",(function(){return r.isArguments})),t.d(e,"isFunction",(function(){return r.isFunction})),t.d(e,"isString",(function(){return r.isString})),t.d(e,"isNumber",(function(){return r.isNumber})),t.d(e,"isDate",(function(){return r.isDate})),t.d(e,"isRegExp",(function(){return r.isRegExp})),t.d(e,"isError",(function(){return r.isError})),t.d(e,"isSymbol",(function(){return r.isSymbol})),t.d(e,"isMap",(function(){return r.isMap})),t.d(e,"isWeakMap",(function(){return r.isWeakMap})),t.d(e,"isSet",(function(){return r.isSet})),t.d(e,"isWeakSet",(function(){return r.isWeakSet})),t.d(e,"isFinite",(function(){return r.isFinite})),t.d(e,"isNaN",(function(){return r.isNaN})),t.d(e,"isBoolean",(function(){return r.isBoolean})),t.d(e,"isNull",(function(){return r.isNull})),t.d(e,"isUndefined",(function(){return r.isUndefined})),t.d(e,"has",(function(){return r.has})),t.d(e,"identity",(function(){return r.identity})),t.d(e,"constant",(function(){return r.constant})),t.d(e,"noop",(function(){return r.noop})),t.d(e,"property",(function(){return r.property})),t.d(e,"propertyOf",(function(){return r.propertyOf})),t.d(e,"matcher",(function(){return r.matcher})),t.d(e,"matches",(function(){return r.matches})),t.d(e,"times",(function(){return r.times})),t.d(e,"random",(function(){return r.random})),t.d(e,"now",(function(){return r.now})),t.d(e,"escape",(function(){return r.escape})),t.d(e,"unescape",(function(){return r.unescape})),t.d(e,"result",(function(){return r.result})),t.d(e,"uniqueId",(function(){return r.uniqueId})),t.d(e,"templateSettings",(function(){return r.templateSettings})),t.d(e,"template",(function(){return r.template})),t.d(e,"chain",(function(){return r.chain})),t.d(e,"mixin",(function(){return r.mixin}));var r=t(0),i=Object(r.mixin)(r);i._=i;var o=i}]).default}));

}

if(window!=self)
  workerWrapper();