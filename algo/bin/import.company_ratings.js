/*
Input: Google spreadsheet with list of company names and ratings
Notes:
	- Blank or non-numeric ratings are interpreted as null (ie clears existing rating)

node ./bin/import.company_ratings.js --sheetId=1499_iK33GtDXcwLLnfzRyCAOVtHjP7_PcpNzoGgGDxw --worksheet=0
*/

var through = require('through')
,ut = require('../lib/ut')
,Companies = require('../lib/Companies')
,googleSheetsParser = require('../lib/google_sheets_parser')
,googleWorksheetRows = require('../lib/google_worksheet_rows')
,findCompany = require('../lib/find_company.js')
;

var argv = require('minimist')(process.argv.slice(2))
;
if (!(argv.sheetId && typeof argv.worksheet == 'number')) {
	console.log('Missing Input');
	process.exit();
}
var keyColumnName = argv.columnName || 'name';

var stats = {
	startTime: new Date
	,sheetFetchFail: 0
	,worksheetParseFail: 0
	,companyFindFail: 0
	,updateFail: 0
	,updateSuccess: 0
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
// note: could skip findCompany stream altogether and simply Companies.update(ut.makeUrlPathFriendlyName(displayName), ...)
//	leaving with findCompany for now in case it gets fancier (like close lookups, -", Inc", etc)
.pipe(findCompany(keyColumnName))
	.on('company-find-fail',function(data,err){
		console.log('Company find fail: '+JSON.stringify(data), err);
		++stats.companyFindFail;
	})
.pipe(through(function(data){
	// note: this stream has async in it so parent will end early and stats may be off. is ok for now if spot check
	var company = data.company
		,rating = (data.rating||'').trim()
	;
	rating = rating == '' || isNaN(+rating) ? null : +rating;
	Companies.updateById(company.id,{rating:rating},function(err){
		if (err) {
			console.log('Update fail', err);
			++stats.updateFail;				
		} else {
			console.log('Company updated: '+company.name+' with rating '+company.rating);
			++stats.updateSuccess;
		}
	});
}))
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



