var analysisTask = new QueryableWorker(workerWrapper);

analysisTask.addListener('returnResult', function (result, cleanResult) {
  //console.log(result);
  sequenceData = result;
  cleanSequenceData = cleanResult;

  $('body').addClass('result');
  //updateFileList(sequenceData);
  updateVisualResult(sequenceData);
  updateSelectMenus(sequenceData);
  updateDataTables();
  hideWorking();

});

analysisTask.addListener('logMessage', function (message) {
  showWorking(message);
});

function analyseSequences() {
  showWorking('Analysing sequences ...');
  analysisTask.sendQuery('getResult', sequenceData);
}

function getRules() {
  getSheetData("1bXfSB9tCW_0-5X_4Swmxl-sZ9Ivn5WgzmpBztZTbx8g", function (
    ruleSheetData
  ) {
    sequenceRules = ruleSheetData;
  });
}