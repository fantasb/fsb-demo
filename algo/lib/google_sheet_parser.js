/*
In: google spreadsheet doc ids
Out: google spreadsheet object
*/
var config = require('../config.js')
,through = require('through')
,sext = require('sext')
,GSpread = require('google-spreadsheet')
;


module.exports = function(sheetIds, opts){
	if (typeof sheetIds == 'object' && !Array.isArray(sheetIds)) {
		opts = sheetIds;
		sheetIds = null;
	}
	opts = sext({
		maxActiveQueries: 2
		,retryQuery: 1
		,retryQueryWaitTime: 1000
	},opts);
	var queue = []
	,activeQueries = 0
	;
	//var statsInterval = setInterval(function(){console.log('--- STATS google_sheets_parser ---','queue:'+queue.length,'activeQueries:'+activeQueries);},2000);

	var s = through(function(sheetId){

		query(sheetId, function(err,sheet){
			v('sheet received',sheetId);
			if (err) {
				s.emit('sheet-fetch-fail', {sheetId:sheetId}, err);
			} else {
				s.queue(sheet);
			}
			if (!activeQueries) {
				s.queue(null);
			}
		});

	},function(){
		if (typeof statsInterval != 'undefined')
			clearInterval(statsInterval);
		console.log('END - google_sheets_parser');
	},{autoDestroy:false});


	function query(sheetId, cb){
		if (!opts.maxActiveQueries || activeQueries < opts.maxActiveQueries)
			return runQuery(sheetId, cb);
		queue.push([sheetId,cb]);
	}

	function runQuery(sheetId, cb, retryNum){
		v('querying sheet',sheetId);
		++activeQueries;
		getSheet(sheetId,function(err, data){
			if (err && opts.retryQuery && (!retryNum || retryNum < opts.retryQuery)) {
				console.log('got error, retrying ['+sheetId+'] -- google_sheet_parser',err);
				return setTimeout(function(){
					--activeQueries;
					runQuery(sheetId,cb,(retryNum||0)+1);
				},opts.retryQueryWaitTime);
			}
			--activeQueries;
			if ((!opts.maxActiveQueries || activeQueries < opts.maxActiveQueries) && queue[0]) {
				runQuery.apply(null, queue.shift());
			}
			cb(err, data);
		});
	}


	// lets go
	(Array.isArray(sheetIds) ? sheetIds : sheetIds ? [sheetIds] : []).forEach(function(url){
		s.write(url);
	});

	return s;


	function v(){
		if (opts.verbose)
			console.log.apply(null,arguments);
	}
}



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




