/*
Input: Google spreadsheet with list of company names
Input: Fact info (name, display_name, description)
What it does:
	- Creates new CompanyFact. Updates info if already exists
	- Creates/updates CompanyFact
	- If Company does not exist, creates new one
	- Adds a CompanyFactCompany for each Company in list

node ./bin/import.misc_company_facts.js \
--factName=builtinla_top_100_tech \
--factDisplay='BuiltInLA Top 100 Tech Companies' \
--factDescription='Featured in http://www.builtinla.com/2015/08/05/top-100-tech-companies-la' \
--sheetId=1g1t5AjeqfpB8D0W87HPGgqHYFXlyGQIqTaRuDvUt-Mc \
--worksheet=1 \
--columnName='all'
*/

var through = require('through')
,ut = require('../lib/ut')
,CompanyFacts = require('../lib/CompanyFacts')
,googleSheetsParser = require('../lib/google_sheets_parser')
,googleWorksheetRows = require('../lib/google_worksheet_rows')
,findCompany = require('../lib/find_company')
;

var argv = require('minimist')(process.argv.slice(2))
;
if (!(argv.factName && argv.factDisplay && argv.factDescription && argv.sheetId && typeof argv.worksheet == 'number' && argv.columnName)) {
	console.log('Missing Input');
	process.exit();
}

var stats = {
	startTime: new Date
	,sheetFetchFail: 0
	,worksheetParseFail: 0
	,companyFindFail: 0
	,companyCreated: 0
	,updateFail: 0
	,imported: 0
};


CompanyFacts.create(argv.factName, argv.factDisplay, argv.factDescription, function(err,companyFact){
	if (err) {
		return console.log('ERROR','CompanyFacts.create()',err);
	}

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
	.pipe(findCompany(argv.columnName,true)) // creates company if no match
		.on('company-find-fail',function(data,err){
			console.log('Company find fail: '+JSON.stringify(data), err);
			++stats.companyFindFail;
		})
		.on('company-created',function(data){
			console.log('Company created: '+JSON.stringify(data));
			++stats.companyCreated;
		})
	.pipe(through(function(data){
		// note: this stream has async in it so parent will end early and stats may be off. is ok for now if spot check
		var company = data.company;
		CompanyFacts.addCompanyFactCompany(companyFact.id,company.id,function(err){
			if (err) {
				console.log('Update fail', err);
				++stats.updateFail;				
			} else {
				console.log('CompanyFactCompany added: '+company.name);
				++stats.imported;
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
});


function logStats(){
	console.log('--- STATS ---');
	stats.runTime = ut.dateDiff(stats.startTime, new Date);
	console.log(stats);
}



