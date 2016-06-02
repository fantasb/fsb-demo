/*
Parses target page for links, then downloads all PDF/video content on that second layer of pages

Instructions
(1) Create session cookie file, wordpress_logged_in_39...=... in algo/cookie.innercirclemembers.com

@todo
	- Would be better if this was simply downloadAssets() recursive
		- i.e. scrape all links, download if is asset, delve into if is html, repeat with depth limit

node ./bin/scrape.site_assets.js \
--url=http://innercirclemembers.com/inner-circle-members-home-2-3/ \
--linksSelector="#le_body_row_2 .op-text-block p a"
--assets=pdf,mp3,mp4,xls,xlsx,ppt,pptx

node ./bin/scrape.site_assets.js --url=http://innercirclemembers.com/inner-circle-members-home-2-3/ --linksSelector="#le_body_row_2 .op-text-block p a" --target=/Users/ahulce/Dropbox/innercirclemembers.com
*/

var fs = require('fs')
,Url = require('url')
,path = require('path')
,jsdom = require('jsdom')
,ut = require('../lib/ut')
,downloadAssets = require('../lib/download_assets.js')
;

var argv = require('minimist')(process.argv.slice(2))
,urlPieces = Url.parse(argv.url)
,dumpDir = argv.target || path.resolve(__dirname,'../out')
,assetTypes = (argv.assets || 'pdf,mp3,mp4,avi,mpg,mpeg,xls,xlsx,ppt,pptx').split(',')
;
if (!(argv.url && argv.linksSelector && assetTypes.length)) {
	console.log('Missing or Invalid Input');
	process.exit();
}


var stats = {
	startTime: new Date
	,errors: 0
	,downloadErrors: 0
	,linksSkipped: 0
	,pagesScraped: 0
}

ut.getSessionCookie(urlPieces.hostname,function(err,sessionCookie){
	if (err) return procError(err);
	var sessionHeaders = { cookie: sessionCookie };

	ut.simpleUrlGet(argv.url,sessionHeaders,function(err,res){
		if (err) return procError(err);
		jsdom.env(
			res.toString(),
			['http://ajax.googleapis.com/ajax/libs/jquery/1.11.1/jquery.min.js'],
			function(err,window){
				if (err) return procError(err);

				var $links = window.$(argv.linksSelector)
					,numPagesToScrape = 0
					,numPagesScraped = 0
				if (!$links.length) procError('No links found given target input')

				//$links = window.$($links[0]).add($links[1]) // @todo: remove, #test
				$links.each(function(){
					var $link = window.$(this)
						,href = ut.normalizeUrl($link.attr('href'))
						,targetDir = path.join(dumpDir,$link.text().trim().replace(/[^a-zA-Z0-9 _\-+.()[],]/,''))
					if (href === null) {
						return ++stats.linksSkipped;
					}
					fs.mkdir(targetDir,function(err){
						if (err && err.code != 'EEXIST') {
							++stats.errors
							return console.log('ERROR',err)
						}
						console.log('scraping '+href+'...');
						++numPagesToScrape
						downloadAssets({
							url: href
							,headers: sessionHeaders
							,assetTypes: assetTypes
							,targetDir: targetDir
						},function(err,data){
							if (err) {
								++stats.errors
								console.log('ERROR',err)
							} else {
								++stats.pagesScraped
							}
							if (++numPagesScraped == numPagesToScrape) {
								allDone()
							}
						})
						.on('download-error',function(err,href){
							console.log('ERROR','download-error',href,err)
							++stats.downloadErrors
						})
					})
				})
			}
		);
	})
});


function procError(err){
	console.log('ERROR',err);
	process.exit();
}

function allDone(){
	console.log('--- STATS ---');
	stats.runTime = ut.dateDiff(stats.startTime, new Date);
	console.log(stats);
}

