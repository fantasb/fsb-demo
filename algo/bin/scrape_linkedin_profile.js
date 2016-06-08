/*
Temp hack script to scrape a LinkedIn profile and output in format ready for consumption by import.candidates.js

Instructions
(1) Create session cookie file, li_at=AQEDA...; in algo/cookie.linkedin.com
(2) Run `node ./bin/scrape_linkedin_profile.js LINKEDIN_USERNAME -c`
(3) Open output in Excel
(4) Copy + Paste row into Google Spreadsheet
(5) Select all and unmerge cells. DO NOT use format painter or you can lose your dates on Work History Items #4+
(6) Review company names, e.g. "Tinder, Inc" > "Tinder"
(6) Enter #manuals: Roles, High-Volume Apps, Degree Roles, Work History Item Roles, Executives

To Do
	- If using as module instead of hack, replace ref to jQuery with local copy or in-house parser
	- If using as module instead of hack, consider replacing jsdom altogether; sux memory

#encodingIssue: When opening output in Excel, some characters are encoded improperly (e.g. "•" => "â€¢". Haven't resolved this yet
	Failed: Tried encoding as ucs2 (utf16 JS subset) per recommendation, but excel wont open it
	Failed: Tried prepending UTF8 Byte Order Mark (\ufeff), Excel treated it as text
	Success: Convert file to WINDOWS-1252 after saving
		Re: http://stackoverflow.com/questions/6588068/which-encoding-opens-csv-files-correctly-with-excel-on-both-mac-and-windows

node ./bin/scrape_linkedin_profile.js pixel4 -i
node ./bin/scrape_linkedin_profile.js trianna-brannon-a0943123 -i -a
node ./bin/scrape_linkedin_profile.js dbachrach -i -a
node ./bin/scrape_linkedin_profile.js chrisozenne -i -a
node ./bin/scrape_linkedin_profile.js jamesajhar -i -a
node ./bin/scrape_linkedin_profile.js hemanth-prasad-a2366511 -i -a
node ./bin/scrape_linkedin_profile.js marcotolman -i -a
node ./bin/scrape_linkedin_profile.js chandlerdea -i -a
node ./bin/scrape_linkedin_profile.js chadtimmerman -i -a
node ./bin/scrape_linkedin_profile.js stkochan -i -a -c

*/

var argv = require('minimist')(process.argv.slice(2))
,fs = require('fs')
//,request = require('request')
,jsdom = require('jsdom')
,csvStringify = require('csv-stringify')
,ut = require('../lib/ut')
,Candidates = require('../lib/Candidates')
;

var lid = argv._[0] || argv.lid
,appendToOutputCsv = argv.a || false // instead of creating a new one
,windowsAnsiEncoding = argv.c || false // cuz we only want to convert the last one when appending
,skipExistingLids = argv.i || false // skip linkedin ids already in our DB

if (!lid) {
	procError('Please supply an lid');
}
lid = lid.replace('https://www.linkedin.com/in/','') // allow for full url as input


okToProceedWithLid(lid,skipExistingLids,function(err,goodToGo,reason){
	if (err) return procError(err);
	if (!goodToGo) {
		return console.log('not continuing with lid '+lid, reason)
	}
	ut.getSessionCookie('linkedin.com',function(err,sessionCookie){
		if (err) return procError(err);
		ut.simpleUrlGet('https://www.linkedin.com/in/'+lid,{
			cookie: sessionCookie
		},function(err,res){
			if (err) return procError(err);
			jsdom.env(
				res.toString(),
				['http://ajax.googleapis.com/ajax/libs/jquery/1.11.1/jquery.min.js'],
				function(err,window){
					if (err) return procError(err);
					
					// BEGIN parsing
					var entry = {}, i, n, $sec

					entry['Name'] = window.$('#name-container .full-name:eq(0)').text().trim();
					entry['Roles'] = null; // #manual
					entry['Email'] = null; // #manual
					entry['Email'] = null; // #manual
					entry['LinkedIn Username'] = lid;
					entry['LinkedIn Image Url'] = window.$('#top-card .profile-picture:first img:first').attr('src')
					entry['Twitter Username'] = null; // #manual
					entry['Facebook Username'] = null; // #manual
					entry['Github Username'] = null; // #manual
					entry['Worked on High-Volume App'] = null; // #manual
					entry['Worked on High-Volume App - Details'] = null; // #manual

					entry['Skills'] = []
					window.$('#profile-skills .skills-section:not(.compact-view):eq(0)').children().each(function(i,sec){
						var skill = (window.$(sec).attr('data-endorsed-item-name')||'').trim().replace(/,/g,''); // comma is our delimiter :(
						if (skill)
							entry['Skills'].push(skill);
					});
					entry['Skills'] = entry['Skills'].join(',');

					for (i=0;i<2;++i) { // limit to 2 for now
						$sec = window.$('#background-education .section-item:eq('+i+')');
						n = i+1;
						entry['Degree #'+n+' Institution'] = $sec[0] && $sec.find('.summary:eq(0)').text().trim();
						entry['Degree #'+n+' Name'] = $sec[0] && $sec.find('.degree:eq(0)').text().trim().replace(/,$/,'');
						entry['Degree #'+n+' Field'] = $sec[0] && $sec.find('.major:eq(0)').text().trim();
						entry['Degree #'+n+' Roles'] = null; // #manual
						entry['Degree #'+n+' Start Date'] = $sec[0] && translateDate($sec.find('.education-date:eq(0) time:eq(0)').text());
						entry['Degree #'+n+' End Date'] = $sec[0] && translateDate($sec.find('.education-date:eq(0) time:eq(1)').text().replace(/^\s*–\s*/,''));
					}

					for (i=0;i<10;++i) { // limit to 10 for now
						$sec = window.$('#background-experience .section-item:eq('+i+')');
						n = i+1;
						entry['Work History Item #'+n+' Company'] = $sec[0] && $sec.find('h4:eq(0)').next('h5:eq(0)').text().trim(); // match title, then next()
						entry['Work History Item #'+n+' Role'] = null; // #manual
						entry['Work History Item #'+n+' Title'] = $sec[0] && $sec.find('h4:eq(0)').text().trim();
						entry['Work History Item #'+n+' Executive'] = null; // #manual
						entry['Work History Item #'+n+' Executive LinkedIn ID'] = null; // #manual
						entry['Work History Item #'+n+' Start Date'] = $sec[0] && translateDate($sec.find('.experience-date-locale:eq(0) time:eq(0)').text());
						entry['Work History Item #'+n+' End Date'] = $sec[0] && translateDate($sec.find('.experience-date-locale:eq(0) time:eq(1)').text());
						entry['Work History Item #'+n+' Description'] = $sec[0] && $sec.find('.description:eq(0)').text().trim();
						entry['Work History Item #'+n+' Location'] = $sec[0] && $sec.find('.experience-date-locale:eq(0) .locality:eq(0)').text().trim();
					}

					// END parsing

					console.log(entry);
					printEntry(entry);
				}
			);
		})
	});
})


function procError(err){
	console.log('ERROR',err);
	process.exit();
}

function translateDate(inStr){
	inStr = (typeof inStr == 'string' ? inStr : '').trim()
	var d = new Date(inStr)
		,check = d.getTime()
	if (check == 0 || isNaN(check))
		return null;
	// require format "March 2015" or "2012" for now; ingester should ignore entries with a null start_dates
	if (/^[a-zA-Z]+\s+[0-9]{4}$/.test(inStr))
		return ut.padZ(d.getMonth()+1)+'/01/'+d.getFullYear()
	if (/^[0-9]{4}$/.test(inStr))
		return inStr
	return null;
}

function okToProceedWithLid(lid,skipExistingLids,cb){
	if (!skipExistingLids) { // always proceed, good to go
		return process.nextTick(function(){
			cb(false,true)
		})
	}
	Candidates.getByLinkedInId(lid,function(err,data){
		if (err) {
			if (err.code == 404) // candidate does not exist, good to go
				cb(false, true)
			else // we have legit error
				cb(err)
		}
		cb(false,false,'candidate exists in db') // candidate exists, not good to go
	})
}

function printEntry(entry){
	var writeTo = __dirname+'/../~scrape_linkedin_profile.out.csv'
		,csvHeaders = []
		,csvCols = []
		,rows = []
	Object.keys(entry).forEach(function(k){
		csvHeaders.push(k)
		csvCols.push(entry[k])
	})
	if (!appendToOutputCsv) rows.push(csvHeaders);
	rows.push(csvCols);
	csvStringify(rows,function(err,csvStr){
		if (err) return procError(err);
		console.log(csvStr);
		// #encodingIssue
		//fs.writeFile(writeTo,'\ufeff'+csvStr,{encoding:'utf8'},function(err){ // \ufeff prepended as pseudo byte order mark to notify excel this is utf8
		fs[appendToOutputCsv?'appendFile':'writeFile'](writeTo,csvStr,{encoding:'utf8'},function(err){
			if (err) return procError(err);
			//console.log('output written to '+writeTo);
			console.log('\nopen -a"/Applications/Microsoft Office 2011/Microsoft Excel.app" "'+writeTo+'"\n')
			// #encodingIssue hack
			if (windowsAnsiEncoding) {
				// Note: -c added to skip unencodable chars, can instead replace them with a specific char with --unicode-subst=REPLACE_WITH_THIS
				// using semicolon instead of && because i was getting a command failed error when -c came into play, even though the conversion appears to have worked
				require('child_process').exec('iconv -c -f UTF-8 -t WINDOWS-1252 "'+writeTo+'" > "'+writeTo+'~"; mv "'+writeTo+'~" "'+writeTo+'"',function(err,data){
					if (err) return procError(err);
				});
			}
		});
	});
}

