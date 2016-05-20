/*
Temp hack script to scrape a LinkedIn profile and output in format ready for consumption by import.candidates.js

Instructions
(1) Create session cookie file, li_at=AQEDA...; in algo/cookie.linkedin.com
(2) Run node ./bin/scrape_linkedin_profile.js LINKEDIN_USERNAME
(3) Open output in Excel
(4) Copy + Paste row into Google Spreadsheet
(5) Apply the Format Painter tool, or we will have merged cells
(6) Enter #manuals: Roles, High-Volume Apps, Degree Roles, Executives

To Do
	- If using as module instead of hack, replace ref to jQuery with local copy or in-house parser
	- If using as module instead of hack, consider replacing jsdom altogether; sux memory

#encodingIssue: When opening output in Excel, some characters are encoded improperly (e.g. "•" => "â€¢". Haven't resolved this yet
	Failed: Tried encoding as ucs2 (utf16 JS subset) per recommendation, but excel wont open it
	Failed: Tried prepending UTF8 Byte Order Mark (\ufeff), Excel treated it as text
	Success: Convert file to WINDOWS-1252 after saving
		Re: http://stackoverflow.com/questions/6588068/which-encoding-opens-csv-files-correctly-with-excel-on-both-mac-and-windows
*/

var argv = require('minimist')(process.argv.slice(2))
,fs = require('fs')
,request = require('hyperquest')
//,request = require('request')
,jsdom = require('jsdom')
,csvStringify = require('csv-stringify')
,ut = require('../lib/ut')
;

var lid = argv._[0] || argv.lid

if (!lid) {
	procError('Please supply an lid');
}



getSessionCookie(function(err,sessionCookie){
	if (err) return procError(err);
	getUrl('https://www.linkedin.com/in/'+lid,{
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



function procError(err){
	console.log('ERROR',err);
	process.exit();
}

function getSessionCookie(cb){
	fs.readFile(__dirname+'/../cookie.linkedin.com',function(err,sessionCookie){
		if (err && err.code != 'ENOENT')
			return cb(err)
		cb(false, sessionCookie ? sessionCookie.toString() : null)
	});
}

function getUrl(url,headers,cb){
	if (typeof headers == 'function') {
		cb = headers
		headers = {}
	}

	var buf = new Buffer(0)
	request.get(url,{
		headers: headers
	})
	.on('data',function(data){
		buf = Buffer.concat([buf,data]);
	})
	.on('end',function(){
		cb(false,buf)
		cb = function(){}
	})
	.on('error',function(err){
		cb(err)
		cb = function(){}
	})
}

function translateDate(inStr){
	inStr = (typeof inStr == 'string' ? inStr : '').trim()
	var d = new Date(inStr)
		,check = d.getTime()
	if (check == 0 || isNaN(check))
		return null;
	// require format "March 2015" or "2012" for now; ingester should ignore entries with a null start_dates
	if (/^[a-zA-Z]\s+[0-9]{4}$/.test(inStr))
		return ut.padZ(d.getMonth()+1)+'/01/'+d.getFullYear()
	if (/^[0-9]{4}$/.test(inStr))
		return inStr
	return null;
}

function printEntry(entry){
	var writeTo = __dirname+'/../~scrape_linkedin_profile.out.csv'
		,csvHeaders = []
		,csvCols = []
	Object.keys(entry).forEach(function(k){
		csvHeaders.push(k)
		csvCols.push(entry[k])
	})
	csvStringify([csvHeaders,csvCols],function(err,csvStr){
		if (err) return procError(err);
		// #encodingIssue
		//fs.writeFile(writeTo,'\ufeff'+csvStr,{encoding:'utf8'},function(err){ // \ufeff prepended as pseudo byte order mark to notify excel this is utf8
		fs.writeFile(writeTo,csvStr,{encoding:'utf8'},function(err){
			if (err) return procError(err);
			//console.log('output written to '+writeTo);
			console.log('\nopen -a"/Applications/Microsoft Office 2011/Microsoft Excel.app" "'+writeTo+'"\n')
			// #encodingIssue hack
			require('child_process').exec('iconv -f UTF-8 -t WINDOWS-1252 "'+writeTo+'" > "'+writeTo+'~" && mv "'+writeTo+'~" "'+writeTo+'"');
		});
	});
}

