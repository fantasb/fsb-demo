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
--worksheet=1
*/

var through = require('through')
,ut = require('../lib/ut')
,googleSheetParser = require('../lib/google_sheet_parser')
//,googleWorksheetRows = require('../lib/google_sheet_parser')
,CompanyFacts = require('../lib/CompanyFacts')
;

var argv = require('minimist')(process.argv.slice(2))
;
if (!(argv.factName && argv.factDisplay && argv.factDescription && argv.sheetId && argv.worksheet)) {
	console.log('Missing Input');
	process.exit();
}

var stats = {
	startTime: new Date
	,sheetFetchFail: 0
	,worksheetParseFail: 0
	,updateFail: 0
	,imported: 0
};


var sheetsToCheck = [
	//'1g1t5AjeqfpB8D0W87HPGgqHYFXlyGQIqTaRuDvUt-Mc' // Ella Candidate List
	argv.sheetId
]


CompanyFacts.create(argv.factName, argv.factDisplay, argv.factDescription, function(err,companyFact){
	if (err) {
		return console.log('ERROR','CompanyFacts.create()',err);
	}
	//console.log('COMPANY FACT',companyFact);process.exit();

	var s = googleSheetParser()
		.on('sheet-fetch-fail', function(data,err){
			console.log('Sheet fetch fail: '+JSON.stringify(data), err);
			++stats.sheetFetchFail;
			//out.sheetFetchFailed.write(data);
		})
	//s.pipe(googleWorksheetRows())
	s.pipe(through(function(sheet){ // @todo: consider creating generic googleWorksheetRows() stream
		var s = this
		,worksheet = sheet.worksheets[argv.worksheet]
		if (!worksheet) {
			return s.emit('worksheet-parse-fail', {sheetId:sheet.id, worksheet:argv.worksheet}, 'cannot find worksheet');
		}
		worksheet.getRows(function(err,rows){
			if (err) {
				return s.emit('worksheet-parse-fail', {sheetId:sheet.id, worksheet:argv.worksheet}, err);
			}
			rows.forEach(function(row){
				s.queue(row);
			});
		});
	}))
	/*
	.pipe(findCompany()) // creates company if no match
	.pipe(addCompanyFactCompany()) // adds company to list
		.on('update-fail',function(data){
			console.log('Update fail: '+JSON.stringify(data));
			++stats.updateFail;
			//out.updateFailed.write(data);
		})
		.on('update-success',function(data){
			console.log('CompanyFactCompany added: '+JSON.stringify(data));
			++stats.imported;
			//out.imported.write(data);
		})
	*/
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
	sheetsToCheck.forEach(function(sheetId){
		s.write(sheetId);
	});
});


function logStats(){
	console.log('--- STATS ---');
	stats.runTime = ut.dateDiff(stats.startTime, new Date);
	console.log(stats);
}



