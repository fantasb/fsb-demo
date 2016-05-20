/*
Temp hack script to scrape a LinkedIn profile and output in format ready for consumption by import.candidates.js

To Do
	- Fix encoding issue #encodingIssue
	- If using as module instead of hack, replace ref to jQuery with local copy or in-house parser
	- If using as module instead of hack, consider replacing jsdom altogether; sux memory

node ./bin/scrape_linkedin_profile.js pixel4

Session Cookie: In order to view the full profile, create a file called "cookie.linkedin.com" in algo/
	e.g.: li_at=AQEDA...;
	Test: node ./bin/scrape_linkedin_profile.js pixel4 | grep profile-skills
	

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
				var entry = {}

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

				window.$('#background-education .section-item').each(function(i,sec){
					if (i == 2) return false; // limit to 2 for now
					var $sec = window.$(sec), n = i+1
					entry['Degree #'+n+' Institution'] = $sec.find('.summary:eq(0)').text().trim();
					entry['Degree #'+n+' Name'] = $sec.find('.degree:eq(0)').text().trim().replace(/,$/,'');
					entry['Degree #'+n+' Field'] = $sec.find('.major:eq(0)').text().trim();
					entry['Degree #'+n+' Roles'] = null; // #manual
					entry['Degree #'+n+' Start Date'] = translateDate($sec.find('.education-date:eq(0) time:eq(0)').text());
					entry['Degree #'+n+' End Date'] = translateDate($sec.find('.education-date:eq(0) time:eq(1)').text().replace(/^\s*–\s*/,''));
				});

				window.$('#background-experience .section-item').each(function(i,sec){
					if (i == 10) return false; // limit to 10 for now
					var $sec = window.$(sec), n = i+1
					entry['Work History Item #'+n+' Company'] = $sec.find('h5:eq(1)').text().trim();
					entry['Work History Item #'+n+' Role'] = null; // #manual
					entry['Work History Item #'+n+' Title'] = $sec.find('h4:eq(0)').text().trim();
					entry['Work History Item #'+n+' Executive'] = null; // #manual
					entry['Work History Item #'+n+' Executive LinkedIn ID'] = null; // #manual
					entry['Work History Item #'+n+' Start Date'] = translateDate($sec.find('.experience-date-locale:eq(0) time:eq(0)').text());
					entry['Work History Item #'+n+' End Date'] = translateDate($sec.find('.experience-date-locale:eq(0) time:eq(1)').text());
					entry['Work History Item #'+n+' Description'] = $sec.find('.description:eq(0)').text().trim();
					entry['Work History Item #'+n+' Location'] = $sec.find('.experience-date-locale:eq(0) .locality:eq(0)').text().trim();
				});

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
		return d.getFullYear()
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
			console.log('open -a"/Applications/Microsoft Office 2011/Microsoft Excel.app" "'+writeTo+'"')
			// #encodingIssue hack
			require('child_process').exec('iconv -f UTF-8 -t WINDOWS-1252 "'+writeTo+'" > "'+writeTo+'~" && mv "'+writeTo+'~" "'+writeTo+'"');
		});
	});
}

