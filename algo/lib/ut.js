var cp = require('child_process').spawn
,sext = require('sext')
,fs = require('fs')
,path = require('path')
,Url = require('url')
//,request = require('request')
,request = require('hyperquest')
,trimRe = /(^\s+)|(\s+$)/g
,trimConsecutiveRe = /(\s)+/g
,undef
;


module.exports.spawn = function(cmd,args,cb){
	//return console.log(cmd+' "'+args.join('" "')+'"');
	var z = this, exitCode ,errs = [] ,outs = [] ,c = 3
	,proc = cp(cmd,args).on('exit',function(code){
		exitCode = code;
		done();
	});
	proc.stderr.on('data',function(data){
		errs.push(data);
	}).on('end',done);
	proc.stdout.on('data',function(data){
		outs.push(data);
	}).on('end',done);
	function done(){
		if (--c)
			return;
		var err = errs.length ? Buffer.concat(errs).toString() : ''
		,out = outs.length ? Buffer.concat(outs).toString() : ''
		;
		if (cb)
			cb(exitCode||false,out,err);
	}
	return proc
}

module.exports.fileTime =  function(date,utc){
	var z = this, d = date ? date : new Date;
	if (utc)
		return d.getUTCFullYear()+'-'+z.padZ(d.getUTCMonth()+1)+'-'+z.padZ(d.getUTCDate())+'_'+z.padZ(d.getUTCHours())+z.padZ(d.getUTCMinutes())+z.padZ(d.getUTCSeconds())+'UTC';
	return d.getFullYear()+'-'+z.padZ(d.getMonth()+1)+'-'+z.padZ(d.getDate())+'_'+z.padZ(d.getHours())+z.padZ(d.getMinutes())+z.padZ(d.getSeconds());
}

module.exports.prettyTime = function(date,utc){
	var z = this, d = date ? date : new Date;
	if (utc)
		return z.padZ(d.getUTCMonth()+1)+'/'+z.padZ(d.getUTCDate())+'/'+d.getUTCFullYear()+' '+z.padZ(d.getUTCHours())+':'+z.padZ(d.getUTCMinutes())+':'+z.padZ(d.getUTCSeconds())+' UTC';
	return z.padZ(d.getMonth()+1)+'/'+z.padZ(d.getDate())+'/'+d.getFullYear()+' '+z.padZ(d.getHours())+':'+z.padZ(d.getMinutes())+':'+z.padZ(d.getSeconds());
}

module.exports.padZ = function(n, m){
	if (m == undef)
		m = 2;
	while ((n+'').length < m)
		n = '0'+n;
	return n;
}

module.exports.isNumeric = function(){
	for (var i=0;i<arguments.length;++i)
		if (!isNumeric(arguments[i]))
			return false
	return true
}
function isNumeric(n){
	return !isNaN(parseFloat(n)) && isFinite(n)
}

module.exports.getFirstChild = function(o){
	var undef;
	for (var k in o)
		return o[k];
	return undef;
}

module.exports.getFirstKey = function(o){
	var undef;
	for (var k in o)
		return k;
	return undef;
}

module.exports.rand = function(min,max){
	if (Array.isArray(min)) {
		max = min[1]
		min = min[0]
	}
	return min+Math.round(Math.random()*(max-min));
}

module.exports.replaceAll = function(str,search,replace){
	return str.split(search).join(replace)
}

module.exports.trim = function(str){
	return str.replace(trimRe,'');
}

module.exports.superTrim = function(str){
	return this.trim(str).replace(trimConsecutiveRe,' ');
}

module.exports.dateDiff = function(d0,d1){
	if (d1 == undef)
		d1 = new Date;
	var secs = Math.round((d1-d0)/1000)
	,intervals = [
		['year',31536000]
		,['month',2628000]
		,['week',604800]
		,['day',86400]
		,['hour',3600]
		,['minute',60]
		,['second',1]
	]
	,str = []
	,n,i,c
	;
	for (i=0,c=intervals.length;i<c;++i) {
		if (secs < intervals[i][1])
			continue;
		n = Math.floor(secs/intervals[i][1]);
		secs -= n*intervals[i][1];
		str.push(n+' '+intervals[i][0]+(n==1?'':'s'));
	}
	if (!str.length)
		return '0 '+intervals.pop()[0]+'s';
	return str.join(', ');
}

module.exports.escapeRegEx = function(str){
	// adds slashes to regex control chars
	return str.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
}


module.exports.makeUrlPathFriendlyName = function(displayName){
	return encodeURIComponent(displayName.toLowerCase().replace(/ +/g,'-'));
}

module.exports.getSessionCookie = function(domainKey,cb){
	fs.readFile(__dirname+'/../cookie.'+domainKey,function(err,sessionCookie){
		if (err && err.code != 'ENOENT')
			return cb(err)
		cb(false, sessionCookie ? sessionCookie.toString() : null)
	});
}

module.exports.normalizeUrl = function(url,contextUrl){
	url = (typeof url == 'string' ? url : '').trim()
	if (!url || url == '#' || url.toLowerCase().indexOf('javascript:') == 0 || url.toLowerCase().indexOf('mailto:') == 0)
		return null;
	contextUrl = typeof contextUrl == 'string' ? Url.parse(contextUrl) : contextUrl
	if (url[0] == '/') // /path/to/mypage
		return contextUrl.protocol+'//'+contextUrl.hostname+(contextUrl.port?':'+contextUrl.port:'')+url
	if (!/^https?:/.test(url)) // path/to/relative/page
		return contextUrl.protocol+'//'+contextUrl.hostname+(contextUrl.port?':'+contextUrl.port:'')+contextUrl.pathname+url
	return url
}

module.exports.simpleUrlGet = function(opts,cb){
	// BEGIN backwards compat
	if (typeof arguments[0] == 'string') {
		opts = {
			url: arguments[0]
			,headers: typeof arguments[1] == 'object' ? arguments[1] : {}
		}
		cb = typeof arguments[1] == 'function' ? arguments[1] : arguments[2]
	}
	// END backwards compat
	opts = sext({
		url: null
		,headers: {}
		,followRedirects: 0
	},opts)

	var z = this, buf = new Buffer(0)
	request.get(opts.url,{
		headers: opts.headers
	},function(err,res){
		var redirectTo = shouldFollowRedirect(res)
		if (redirectTo) {
			opts.url = redirectTo
			--opts.followRedirects
			z.simpleUrlGet(opts,cb)
			cb = function(){}
		}
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

	function shouldFollowRedirect(res){
		return opts.followRedirects && res && (res.statusCode == 301 || res.statusCode == 302 || res.statusCode == 307 || res.statusCode == 308) && res.headers && res.headers.location
	}
}



module.exports.stats = function(opts){
	return new stats(opts);
};

function stats(opts){
	var z = this;
	z.opts = opts;
	if (typeof opts.output == 'string')
		opts.output = opts.output.split(',');
	z.output = {};
	(opts.output || ['list']).forEach(function(type){
		z.output[type] = true;
	});
}
stats.prototype.data = {};
stats.prototype.add = function(what,key,msg,done){
	var d = this.data;
	if (!d[what])
		d[what] = {};
	d[what][key] = msg;
	if (this.opts.verbose)
		console.log(what, key, JSON.stringify(msg), '\n');
	if (done)
		done();
}
stats.prototype.print = function(){
	var z = this
	,out = []
	;
	out.push('------ STATS ------\n');
	Object.keys(z.data).forEach(function(what){
		var keys = Object.keys(z.data[what]);
		out.push('### '+what+' ('+keys.length+')\n');
		if (z.output.array)
			out.push('["'+keys.join('","')+'"]\n');
		if (z.output.list) {
			keys.forEach(function(key){
				out.push(key+'\n');
				/*if (z.opts.verbose)
					out.push(z.opts.verbose ? ': '+JSON.stringify(z.data[what][key]) : '');*/
			});
		}
		out.push('\n');
	});
	out = out.join('');
	console.log(out);
	if (z.opts.outputFile)
		fs.writeFileSync(z.opts.outputFile, out);
}
stats.prototype.printOutputFilename = function(){
	console.log( path.basename(this.opts.outputFile) );
}

