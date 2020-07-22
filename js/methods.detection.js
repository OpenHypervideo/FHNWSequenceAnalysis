// your custom "queryable" worker
var myTask = new QueryableWorker(workerWrapper);

// your custom "listeners"
myTask.addListener('returnResult', function (result) {
  
  //console.log(result);
  sequenceData = result;

  $('body').addClass('result');

  updateVisualResult(sequenceData);

  hideWorking();

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