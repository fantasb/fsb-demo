/*

*/


var express = require('express')
,app = express()
,Url = require('url')
,sext = require('sext')
,config = require('./config.js')
,rankRole = require('./lib/rank_role.js')
,getCandidate = require('./lib/get_candidate.js')
,getRole = require('./lib/get_role.js')
,getAlgoFactors = require('./lib/get_algo_factors.js')
;


app.use(express.static(__dirname+'/public'));

app.get('/',function(req,res){
	res.redirect('/algo.html');
});

app.get('/api/*',function(req,res){
	var url = Url.parse(req.url,true)
		,qs = url.query
		,path = url.pathname.replace('/api/','')
	;

	if (path == 'results') {
		// /api/results?role_id=1&offset=0&limit=10
		if (!(qs.role_id && qs.limit && qs.offset)) {
			return error(101,'Missing Input');
		}
		rankRole(qs.role_id,function(err,data){
			if (err) {
				return error(110,err);
			}
			try {
				data = data.splice(qs.offset,qs.limit);
			} catch (e) {
				return error(102,'Invalid Input');
			}
			mergeCandidateData(data,function(err,data){
				if (err) {
					return error(111,err);
				}
				success({candidates:data});
			})
		})
	} else if (path == 'candidate') {
		// /api/candidate?id=2
		if (!qs.id) {
			return error(101,'Missing Input');
		}
		getCandidate(qs.id,function(err,data){
			if (err) {
				return error(110,err);
			}
			success(data);
		})
	} else if (path == 'role') {
		// /api/role?name=ios-developer
		if (!qs.name) {
			return error(101,'Missing Input');
		}
		getRole(qs.name,function(err,data){
			if (err) {
				return error(110,err);
			}
			success(data);
		})
	} else if (path == 'factors') {
		// /api/factors
		getAlgoFactors(function(err,data){
			if (err) {
				return error(110,err);
			}
			success(data);
		})
	} else {
		res.statusCode = 404;
		res.end();
	}

	function error(code,msg){
		res.statusCode = 500;
		respond({error:msg,code:code||0});
	}
	function success(data){
		res.statusCode = 200;
		respond(data);
	}
	function respond(data){
		res.setHeader('content-type', 'application/json');
		res.end(JSON.stringify(data));
	}
});

app.listen(config.port);




function mergeCandidateData(data,cb){
	if (!data.length) {
		return process.nextTick(function(){
			cb(false,data);
		});
	}
	var numGot = 0
	data.forEach(function(simpleCandidate){
		getCandidate(simpleCandidate.id,function(err,fullCandidate){
			if (err) {
				cb(err);
				return cb = function(){}
			}
			sext(simpleCandidate,fullCandidate)
			if (++numGot == data.length) {
				cb(false,data)
			}
		})
	})
}

