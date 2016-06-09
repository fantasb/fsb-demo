var through = require('through')
,Candidates = require('../lib/Candidates')
;


module.exports = function(lidInputKey,keepExisting){
	var ended = false, numPending = 0
	var s = through(function(data){
		var lid = data[lidInputKey]
		++numPending
		Candidates.getByLinkedInId(lid,function(err){
			if (err && err.code != 404) return s.emit('error', err)
			if (err && err.code == 404) s.queue(data)
			if (--numPending == 0 && ended) s.queue(null)
		})
	},function(){
		//console.log('----END', 'filter_existing_candidates')
		ended = true
		if (numPending == 0) s.queue(null)
	},{autoDestroy:false})
	return s
}
