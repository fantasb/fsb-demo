/*
Currently runs through all "visible" candidates and scores each

node ./bin/score_candidates.js
node ./bin/score_candidates.js --candidateId=1
*/

var argv = require('minimist')(process.argv.slice(2))
,scoreCandidate = require('../lib/score_candidate.js')
,db = require('../lib/db.mysql.js')
;


getAllCandidates(function(err,candidates){
	if (err) {
		return console.log('ERROR',err);
	}
	candidates.forEach(function(candidate){
		scoreCandidate(candidate.id,function(err,data){
			if (err) {
				return console.log('Failed to score candidate '+candidate.id, err);
			}
			console.log('Candidate '+candidate.id+' scored successfully');
			//console.log(data);
		});
	});
})


function getAllCandidates(cb){
	var con = db()
		,q = 'select id,name from candidates where visible=1'
		,p = []
	;
	if (argv.candidateId) {
		q += ' and id=?';
		p.push(argv.candidateId);
	}
	con.query(q,p,function(err,data){
		cb(err,data);
		con.end();
	});
}

