/*
- Rank all candidates with given Role
	- Does not currently save to DB; for v0 we will calculate results on the fly
*/


var db = require('../lib/db.mysql.js')
;



module.exports = function(roleId,cb){
	getAlgoFactors(function(err,factors){
		if (err) {
			return fatalErr(err)
		}
		//console.log(factors);
		var numFactorsRanked = 0
		factors.forEach(function(factor){
			rankRoleFactor(roleId, factor.id, function(err,data){
				if (err) {
					return fatalErr(err)
				}
				factor.scores = data;
				if (++numFactorsRanked == factors.length) {
					var rankings = rankCandidates(factors)
					cb(false,rankings)
				}
			});
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


function rankRoleFactor(roleId, factorId, cb){
	var con = db()
		,q = 'select candidate_id, score,'
			+ ' @prev:=@curr, @curr:=score, @rank:=if(@prev=@curr,@rank,@rank+1) as rank'
			+ ' from candidate_role_factor_scores,'
			+ ' (select @curr:=null, @prev:=null, @rank:=0) a'
			+ ' where role_id=? and factor_id=?'
			+ ' order by score desc'
		,p = [roleId, factorId]
	;
	//console.log(con.format(q,p));
	con.query(q,p,function(err,data){
		if (err) {
			cb(err)
		} else {
			//console.log(data)
			cb(false,data)
		}
		con.end()
	})
}


function rankCandidates(factors){
	var candidates = []
		,candidates_ = {}
	;

	// Assign a score for each Factor to each Candidate...
	factors.forEach(function(factor){
		if (!factor.scores.length) return;
		var maxRank = factor.scores[factor.scores.length-1].rank;
		factor.scores.forEach(function(factorScore){
			if (!candidates_[factorScore.candidate_id]) {
				candidates_[factorScore.candidate_id] = {
					id: factorScore.candidate_id
					,scores: {}
					,totalScore: 0
				}
				candidates.push(candidates_[factorScore.candidate_id])
			}
			var candidate = candidates_[factorScore.candidate_id]
			//console.log('('+maxRank+'-'+factorScore.rank+')/'+maxRank, (maxRank-factorScore.rank)/maxRank);
			var candidateFactorScore = (maxRank-factorScore.rank)/maxRank
			candidate.scores[factor.name] = candidateFactorScore // @todo: comment this out for #performance
			candidate.totalScore += factor.weight*candidateFactorScore
		})
	})

	candidates.sort(function(a,b){
		return b.totalScore-a.totalScore
	})
	return candidates;
}


