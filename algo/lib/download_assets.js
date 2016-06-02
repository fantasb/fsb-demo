/*
Notes
	- Doesnt account for files with the same basename, could get corrupted files if this happens
		- Not caring atm. If notice it happens a lot, can spend time to resolve
*/

var events = require('events')
,sext = require('sext')
,path = require('path')
,fs = require('fs')
,request = require('hyperquest')
,ut = require('./ut')
//,jsdom = require('jsdom')

module.exports = function(opts,cb){
	opts = sext({
		url: null
		,headers: {}
		,assetTypes: []
		,followRedirects: 1
		,targetDir: null
	},opts)

	var s = new events.EventEmitter;

	var exts = []
	if (Array.isArray(opts.assetTypes)) {
		opts.assetTypes.forEach(function(ext){
			exts.push(ut.escapeRegEx(ext))
		})
	}
	var linkRe = new RegExp('<a\\s+.*?href="([^"]+)"','ig')
		,assetRe = new RegExp('\\.('+exts.join('|')+')$','i')

	// if url is an asset itself, just download that
	if (assetRe.test(opts.url)) {
		downloadFile(opts.url,cb)
		return s;
	}

	// else scrape the page and download everything on it
	ut.simpleUrlGet(opts,function(err,data){
		if (err)
			return cb(err)
		var html = data.toString().replace(/[\n\r]/g, ' '), m
		var numAssetsToGet = 0, numAssetsGot = 0
		while (m = linkRe.exec(html)) {
			(function(){
				var href = ut.normalizeUrl(m[1],opts.url)
				if (href === null) return;
				if (!assetRe.test(href)) return;
				++numAssetsToGet
				downloadFile(href,function(){
					if (++numAssetsGot == numAssetsToGet)
						cb()
				})
			}());
		}
	})

	function downloadFile(href,cb){
		console.log('downloading '+href);
		var targetFile = path.join(opts.targetDir,path.basename(href))
			,ws
		request.get(href,{headers:opts.headers})
		.pipe(ws=fs.createWriteStream(targetFile))
		ws.on('close',done)
		.on('exit',done)
		.on('error',function(err){
			s.emit('download-error',err,href)
			done()
		})
		function done(){
			cb();
			cb = function(){}
			console.log('downloaded '+href);
		}
	}

	return s;

}

