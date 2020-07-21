// your custom "queryable" worker
var myTask = new QueryableWorker('js/methods.detection.worker.js');

// your custom "listeners"
myTask.addListener('returnResult', function (result) {
  
  //console.log(result);
  sequenceData = result;

  updateVisualResult(sequenceData);
  updateDataTextarea(sequenceData);

  setTimeout(function() {
    hideWorking();
  }, 2000);

});

myTask.addListener('logMessage', function (message) {
  
  showWorking(message);

});

function analyseSequences() {
  showWorking('Analysing sequences ...');
  myTask.sendQuery('getResult', sequenceData);
}

function getRules() {
  getSheetData("1bXfSB9tCW_0-5X_4Swmxl-sZ9Ivn5WgzmpBztZTbx8g", function (
    ruleSheetData
  ) {
    sequenceRules = ruleSheetData;
  });
}