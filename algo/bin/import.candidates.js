/*
Input: Google spreadsheet with list of candidate data
Input: handleExisting - ignore, append, replace
What it does:
	- 

node ./bin/import.candidates.js \
--sheetId=1g1t5AjeqfpB8D0W87HPGgqHYFXlyGQIqTaRuDvUt-Mc \
--worksheet=0

NOTE: Custom stream has async in it so logStats() will likely be printed prematurely
	This is ok for now, but should be updated prior to handling large sets of data.
	@todo: ^^
*/

var through = require('through')
,ut = require('../lib/ut')
,googleSheetsParser = require('../lib/google_sheets_parser')
,googleWorksheetRows = require('../lib/google_worksheet_rows')
,importCandidate = require('../lib/import_candidate')
;

var argv = require('minimist')(process.argv.slice(2))
;
if (!(argv.sheetId && typeof argv.worksheet == 'number')) {
	console.log('Missing Input');
	process.exit();
}

var stats = {
	startTime: new Date
	,sheetFetchFail: 0
	,worksheetParseFail: 0
	,candidateImportFail: 0
	,candidateImportSoftError: 0
	,candidateImportSuccess: 0
};


var s = googleSheetsParser()
	.on('sheet-fetch-fail', function(data,err){
		console.log('Sheet fetch fail: '+JSON.stringify(data), err);
		++stats.sheetFetchFail;
	})
s.pipe(googleWorksheetRows(argv.worksheet))
	.on('worksheet-parse-fail',function(data,err){
		console.log('Worksheet parse fail: '+JSON.stringify(data), err);
		++stats.worksheetParseFail;
	})
.pipe(through(function(data){
	Object.keys(data).forEach(function(k){
		if (typeof data[k] == 'string' && ['na','n/a','none'].indexOf(data[k].trim().toLowerCase()) != -1) {
			data[k] = '';
		}
	});
	this.queue(data);
}))
.pipe(importCandidate({handleExisting:argv.handleExisting||'replace'}))
	.on('candidate-fatal',function(err,data){
		console.log('Failed to import candidate',err,data);
		++stats.candidateImportFail;
	})
	.on('success',function(data){
		console.log('Candidate imported: '+data.candidate.name);
		++stats.candidateImportSuccess;
	})
	.on('soft-error',function(err,data){
		console.log('Failed to import some data',err);
		++stats.candidateImportSoftError;
	})
.on('error', function(err){
	console.log('ERROR',err);
})
.on('end', function(){
	console.log('--- END ---');
	checkEnd();
})
.on('close', function(){
	console.log('--- CLOSE ---');
	checkEnd();
})
var checkEnd = function(){
	checkEnd = function(){}
	if (typeof statsInterval != 'undefined')
		clearInterval(statsInterval);
	stats.endTime = new Date;
	logStats();
}

// feed...
s.write(argv.sheetId);
//sheetsToCheck.forEach(function(sheetId){
//	s.write(sheetId);
//});


function logStats(){
	console.log('--- STATS ---');
	stats.runTime = ut.dateDiff(stats.startTime, new Date);
	console.log(stats);
}



