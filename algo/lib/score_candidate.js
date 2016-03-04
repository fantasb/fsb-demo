/*
- Run through Factors and calculate a raw score
	- Store this in DB
- To be run when candidate is created/updated

500,000,000 candidates * 10 roles-per-candidate * (size of score data ~= 4b[candidate_id]+4b[role_id]+4b[score])
*/


var factorsCnf = [
	{
		m: 'rateLanguageSkills'
		,w: .05
	}
	,{
		m: 'rateSkillFundamentals'
		,w: .10
	}
	,{
		m: 'rateRoleExperience'
		,w: .15
	}
	,{
		m: 'rateMiscRoleFacts'
		,w: .10
	}
]

var db = require('../lib/db.mysql.js')

module.exports = function(){
	var dbConn = db()

	var numSent = 0
		,numReceived = 0
	factorsCnf.forEach(function(factor){
		console.log(factor);
		//factor[m](dbConn, candidateId);
	})

	//dbConn.end()
}


/*
module.exports=function(){
	var config = require('../config.js')
	,db = require('../lib/db.mysql.js')
	;
	//console.log(config);

	var dbConn = db()

	var q = 'select * from candidates c \
		inner join candidate_roles cr on c.id=cr.candidate_id \
		inner join roles r on cr.role_id=r.id \
	'
	,p = []
	dbConn.query(q, p, function(err,data){
		console.log(err,data)
		dbConn.end()
	})
}
*/




function rateLanguageSkills(dbConn, roleId, ){

}



