/*

*/

var through = require('through')
,ut = require('../lib/ut')
;

module.exports = function(inputKey,outputKey,suppressErrors){
	inputKey = inputKey || 'lid'
	outputKey = outputKey || 'lid'
	var ended = false, numPending = 0;
	var s = through(function(data){
		var undef, inputLid = typeof data[inputKey] == 'string' ? data[inputKey].trim() : undef
		if (!inputLid) {
			return suppressErrors ? s.queue(data) : s.emit('error', 'this happened...', err)
		}
		inputLid = (inputLid.match(/(https:\/\/www.linkedin.com\/in\/)?([^?#]+)\??.*?#?/)||[,,''])[2] // allow for full url as input
		if (!/^https?:\/\//.test(inputLid)) {
			//console.log('applyLinkedInId', 'not fetching',inputLid)
			data[outputKey] = inputLid
			return s.queue(data)
		}
		//console.log('applyLinkedInId', 'fetching',inputLid)
		++numPending
		ut.getSessionCookie('linkedin.com',function(err,sessionCookie){
			if (err) return s.emit('error', 'fetching session cookie', err)
			ut.simpleUrlGet({
				url: inputLid
				,headers: {
					cookies: sessionCookie
				}
				,followRedirects: 2
			},function(err,res){
				if (err) {
					s.emit('softerror', 'fetching url', inputLid)
					return suppressErrors ? s.queue(data) : s.emit('error', 'fetching url', err)
				}
				var lid = res.toString().match(/<link\s+rel="canonical"\s+href="https?:\/\/www\.linkedin\.com\/in\/([^"]+)"/im)
				lid = lid && lid[1]
				if (!lid) {
					s.emit('softerror', 'cannot find lid in source', lid, res)
					!suppressErrors && s.emit('error', 'cannot find lid in source', lid)
				} else {
					data[outputKey] = lid
					s.queue(data)
				}
				if (--numPending == 0 && ended) {
					s.queue(null)
				}
			})
		});
	},function(){
		//console.log('----- END', 'applyLinkedInId')
		ended = true;
		if (numPending == 0) {
			s.queue(null);
		}
	},{autoDestroy:false})
	
	return s;
}