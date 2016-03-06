/*
- For each role candidate is in...
	- Run through Factors and calculate a raw score
		- Store this in DB
- To be run when candidate is created/updated

#dynamic - Potential innaccuracies due to dynamic value(s) in factor

500,000,000 candidates * 10 roles-per-candidate * (size of score data ~= 4b[candidate_id]+4b[role_id]+4b[score])
*/

var db = require('../lib/db.mysql.js')

module.exports = function(candidateId,cb){

	getAlgoFactors(function(err,factors){
		if (err) {
			return fatalErr(err)
		}
		getCandidateRoles(candidateId,function(err,roles){
			if (err) {
				return fatalErr(err)
			}
			var rolesScores = {}
				,numRolesScored = 0
			;
			roles.forEach(function(role){
				console.log('Scoring candidate '+candidateId+' role '+role.name+'...');
				var numFactorsScored = 0
				factors.forEach(function(factor){
					if (typeof Scoring[factor.name] != 'function') {
						console.log('Skipping '+factor.name+' - scoring method not defined');
						return doneWithFactor()
					}
					Scoring[factor.name](candidateId, role.id, function(err,score){
						if (err) {
							return fatalErr(err)
						}
						saveScore(candidateId,role.id,factor.id,score.score,score.debug,function(err,data){
							if (err) {
								return fatalErr(err)
							}
							console.log('candidateId',candidateId,'roleId',role.id,'factorId',factor.id,'\tscore: '+score.score,'\tdebug: '+score.debug.join('; '));
							doneWithFactor()
						})
					});
				});
				function doneWithFactor(){
					if (++numFactorsScored == factors.length) {
						doneWithRole()
					}
				}
			})
			function doneWithRole(){
				if (++numRolesScored == roles.length) {
					cb(false,rolesScores)
				}
			}
		})
	})
	function fatalErr(err){
		cb(err);
		cb = function(){}
	}

}


function getAlgoFactors(cb){
	var con = db()
		,q = 'select * from algo_factors where weight!=0'
		,p = []
	;

	con.query(q,p,function(err,data){
		cb(err,data);
		con.end()
	})
}

function getCandidateRoles(candidateId,cb){
	var con = db()
		,q = 'select * from candidate_roles cr inner join roles r on cr.role_id=r.id where r.visible=1 and cr.candidate_id=?'
		,p = [candidateId]
	;

	con.query(q,p,function(err,data){
		if (err) {
			cb(err);
		} else {
			cb(false,data);
		}
		con.end();
	})
}

function saveScore(candidateId, roleId, factorId, score, debug, cb){
	if (typeof debug == 'function') {
		cb = debug;
		debug = null;
	}
	if (Array.isArray(debug))
		debug = debug.join('; ');

	var con = db()
		,dbNow = Math.floor(+new Date/1000)
		,q = 'insert into candidate_role_factor_scores (candidate_id,role_id,factor_id,score,debug,created,updated) values (?,?,?,?,?,?,?) on duplicate key update score=?,debug=?,updated=?'
		,p = [candidateId,roleId,factorId,score,debug,dbNow,dbNow, score,debug,dbNow]
	;
	con.query(q,p,function(err,data){
		cb(err,data);
		con.end();
	});
}


Scoring = {
	//return process.nextTick(function(){ cb(false,{score:0,debug:[]}); });

	language_skills: function(candidateId, roleId, cb){
		// score = can speak english
		var con = db()
			,numScored = 0
			,numToScore = 0
			,score = {
				score: 0
				,debug: []
			}
		;

		// Fluent English is a +1 for everybody atm
		var q = 'select * from candidate_skills cs inner join skills s on cs.skill_id=s.id where s.name=? and cs.candidate_id=?'
			,p = ['fluent_english', candidateId]
		;
		++numToScore;
		con.query(q,p,function(err,data){
			if (err) {
				fatalErr(err);
			} else {
				score.score += 1;
				score.debug.push('+1 for Fluent English');
				itemScored();
			}
			con.end();
		});

		function itemScored(){
			if (++numScored == numToScore) {
				cb(false,score);
			}
		}
		function fatalErr(err){
			cb(err);
			cb = function(){}
		}
	}

	,role_skill_fundamentals: function(candidateId, roleId, cb){
		// score = % of fundamental skills candidate has
		var con = db()
			,q = 'select * from role_skill_fundamentals rsf inner join skills s on rsf.skill_id=s.id and rsf.role_id=? and s.visible=1 left outer join candidate_skills cs on cs.skill_id=s.id and cs.candidate_id=?'
			,p = [roleId, candidateId]
			,score = {
				score: 0
				,debug: []
			}
		;
		con.query(q,p,function(err,data){
			if (err) {
				cb(err);
			} else {
				data.forEach(function(row){
					if (row.candidate_id === null) {
						score.debug.push('Missing skill fundamental: '+row.name);
						return;
					}
					score.debug.push('Has skill fundamental: '+row.name);
					++score.score;
				});
				score.score = (score.score && data.length) ? score.score*100/data.length : 0;
				cb(false,score);
			}
			con.end();
		})
	}

	,role_experience: function(candidateId, roleId, cb){
		// score = seconds worked in role
		var con = db()
			,q = 'select * from work_history_items whi inner join work_history_item_roles whir on whi.id=whir.work_history_item_id and whi.candidate_id=? inner join roles r on whir.role_id=r.id and r.visible=1 and r.id=?'
			,p = [candidateId, roleId]
			,score = {
				score: 0
				,debug: []
			}
		;
		con.query(q,p,function(err,data){
			if (err) {
				cb(err);
			} else {
				data.forEach(function(row){
					if (row.end_time === null) {
						// assume still working there...
						// #dynamic - some people could fall behind if their score isn't constantly updated
						//		consider flooring to nearest month
						//		might be ok as is, a more "active" candidate would have their score re-calculated
						//		more often and should then have an advantage for currently working as Role
						row.end_time = Math.floor(+new Date/1000)
					}
					if (row.start_time !== null) {
						var points = row.end_time - row.start_time
						score.score += points
						score.debug.push('+'+points+' for '+row.title)
					}
				})
				cb(false,score);
			}
			con.end()
		})
	}

	,misc_role_facts: function(candidateId, roleId, cb){
		// currently each misc_role_fact must be assigned a role to be calculated here
		// @todo: join with roles to check roles.visible=1 ?
		var con = db()
			,q = 'select * from misc_role_facts mrf inner join misc_role_fact_roles mrfr on mrf.id=mrfr.misc_role_fact_id and mrfr.role_id=?'
				+ ' inner join candidate_misc_role_facts cmrf on cmrf.misc_role_fact_id=mrfr.misc_role_fact_id and cmrf.candidate_id=?'
			,p = [roleId, candidateId]
			,score = {
				score: 0
				,debug: []
			}
		;
		con.query(q,p,function(err,data){
			if (err) {
				cb(err);
			} else {
				data.forEach(function(row){
					score.score += row.weight
					score.debug.push('+'+row.weight+' for '+row.display_name)
				})
				cb(false,score);
			}
			con.end()
		})
	}

	,basic_education: function(candidateId, roleId, cb){
		// +1 for has a degree period
		// @todo: specify which "degree"s are worthy?
		var con = db()
			,q = 'select * from education_history_items where candidate_id=? and degree_type_id is not null'
			,p = [candidateId]
			,score = {
				score: 0
				,debug: []
			}
		;
		con.query(q,p,function(err,data){
			if (err) {
				cb(err);
			} else {
				if (data.length) {
					score.score = 1;
					score.debug.push('Has a degree in something');
				} else {
					score.debug.push('Has no EducationHistoryItem associated with a known DegreeType')
				}
				cb(false,score);
			}
			con.end()
		})
	}

	,role_education: function(candidateId, roleId, cb){
		// +1 for each EducationHistoryItem in Role
		var con = db()
			,q = 'select * from education_history_items ehi inner join education_history_item_roles ehir on ehi.id=ehir.education_history_item_id where ehir.role_id=? and ehi.candidate_id=? and ehi.degree_type_id is not null'
			,p = [roleId, candidateId]
			,score = {
				score: 0
				,debug: []
			}
		;
		con.query(q,p,function(err,data){
			if (err) {
				cb(err);
			} else {
				score.score = data.length
				score.debug.push(data.length+' education items associated with role')
				cb(false,score);
			}
			con.end()
		})
	}

}




