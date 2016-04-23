/*
Input: Google spreadsheet with list of company names
Input: Fact info (name, display_name, description)
What it does:
	- If CompanyFact already exists, wipes CompanyFactCompanies before import
	- Creates/updates CompanyFact
	- If Company does not exist, creates new one
	- Adds a CompanyFactCompany for each Company in list

node ./bin/import.misc_company_facts.js --sheetId=1g1t5AjeqfpB8D0W87HPGgqHYFXlyGQIqTaRuDvUt-Mc
*/

var config = require('../config.js')
,GSpread = require('google-spreadsheet')
;

var argv = require('minimist')(process.argv.slice(2))
;
if (!argv.sheetId) {
	console.log('Please provide a sheetId');
	process.exit();
}


getSheet(argv.sheetId,function(err,data){
	console.log(err,data);
});



function getSheet(sheetId,cb){
	var sheet = new GSpread(sheetId)
		,creds = config.google
	;
	sheet.useServiceAccountAuth(creds,function(err){
		if (err)
			return cb(err);
		sheet.getInfo(cb);
	});
}
