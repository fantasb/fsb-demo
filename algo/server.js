/*

*/


var express = require('express')
,app = express()
,Url = require('url')
,sext = require('sext')
,config = require('./config.js')
,rankRole = require('./lib/rank_role.js')
,getCandidate = require('./lib/get_candidate.js')
;


app.use(express.static(__dirname+'/public'));

app.get('/',function(req,res){
	res.redirect('/algo.html');
});

app.get('/api/results',function(req,res){
	var qs = Url.parse(req.url,true).query;
	
	if (!qs.role_id) {
		return error(101,'Missing Input');
	}
	rankRole(qs.role_id,function(err,data){
		if (err) {
			return error(110,err);
		}
		mergeCandidateData(data,function(err,data){
			if (err) {
				return error(111,err);
			}
			success({candidates:data});
		})
	})

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

app.get('/api/candidate',function(req,res){
	var qs = Url.parse(req.url,true).query;
	
	if (!qs.id) {
		return error(101,'Missing Input');
	}
	getCandidate(qs.id,function(err,data){
		if (err) {
			console.log(err);
			return error(110,err);
		}
		success(data);
	})

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

