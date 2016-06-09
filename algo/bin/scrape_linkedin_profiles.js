/*
Temp hack wrapper for bin/scrape_linkedin_profile.js

Pulls from https://docs.google.com/spreadsheets/d/1GHtwcyWGUqEWG10W-Xz7Jl2Sje13A65o_5G63EJ1MsU

node ./bin/scrape_linkedin_profiles.js \
--sheetId=1GHtwcyWGUqEWG10W-Xz7Jl2Sje13A65o_5G63EJ1MsU \
--worksheet=1

To Do
	- fix bug where if !goodToGo still prints row in sheet
	- repplace require(inspecotr)
	- check if stdavison shows up
	- if skipped, add to new stats.x instead of errors
	- test having more than one have to applyLinkedInId
	- Libify bin/scrape_linkedin_profile logic and use here instead of spawning new processes

*/

console.log('uncomment `rows = rows.slice(0,60)` before running');process.exit();


var argv = require('minimist')(process.argv.slice(2))
//,fs = require('fs')
,ut = require('../lib/ut')
,cp = require('child_process')
,through = require('through')
,googleSheetsParser = require('../lib/google_sheets_parser')
,googleWorksheetRows = require('../lib/google_worksheet_rows')
,applyLinkedInId = require('../lib/apply_linkedin_id')
,filterExistingCandidates = require('../lib/filter_existing_candidates.js')
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
	,profErrors: 0
	,profSuccess: 0
};

var rows = [], rows_ = {}
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
//.pipe(through(function(d){if (d.linkedin!='http://www.linkedin.com/pub/stuart-davison/6/458/301') this.queue(d)}))
/*.pipe(through(function(data){
	// filter empty rows now
	if ((typeof data.linkedin == 'string' ? data.linkedin : '').trim())
		this.queue(data)
}))*/
.pipe(
	applyLinkedInId('linkedin','_lid',true)
	.on('softerror',function(err,info){
		console.log('applyLinkedInId softerror',err,info)
	})
)
.pipe(filterExistingCandidates('_lid',false))
.pipe(through(function(data){
	// if passes validation, cp.spawn
	if (data && data._lid) {
		if (!rows_[data._lid]) {
			rows_[data._lid] = true
			rows.push(data)
		} else {
			console.log('skipping', data._lid, 'already exists in input')
		}
	} else {
		console.log('ERROR', 'no lid found for row', data.linkedin)
	}
}))
.on('end',function(){
	console.log('------WEFWEF',rows.length,rows[rows.length-1]._lid)
	//rows = rows.slice(0,60); // #test
	var numToGet = rows.length, numGot = 0
	rows.forEach(function(row,i){
		var lid = row._lid
		var args = [__dirname+'/scrape_linkedin_profile.js', lid]
		if (row.email&&row.email.trim) args.push.apply(args, ['--email',row.email.trim()])
		if (row.phone&&row.phone.trim) args.push.apply(args, ['--phone',row.phone.trim()])
		if (i != 0) args.push('-a')
		if (i == rows.length-1) args.push('-c')
		ut.spawn('node',args,function(code,stdOut,stdErr){
			if (code || stdErr) {
				console.log('fail',row.linkedin,lid,code,stdErr)
				++stats.profErrors
			} else {
				console.log('success',row.linkedin,lid)
				++stats.profSuccess
			}
			if (++numGot == numToGet) {
				stats.endTime = new Date;
				stats.runTime = ut.dateDiff(stats.startTime, new Date);
				console.log('-------END',stats)
			}
		})
	})
})

s.write(argv.sheetId);




