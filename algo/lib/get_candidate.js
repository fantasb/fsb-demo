/*
Temp method to grab a Candidate for demo
*/


var db = require('../lib/db.mysql.js')
;



module.exports = function(candidateId,cb){
	var con = db()
		//,q = 'select * from candidates c left outer join work_history_items whi on c.id=whi.candidate_id where c.id=? order by whi.start_time desc'
		,q = 'select c.*,whi.*,co.name as company_name from candidates c left outer join work_history_items whi on c.id=whi.candidate_id left outer join companies co on co.id=whi.company_id where c.id=? order by whi.start_time desc'
		,p = [candidateId]
	;
	con.query(q,p,function(err,data){
		if (err) {
			cb(err);
		} else if (!data[0]) {
			cb('Candidate '+candidateId+' not found');
		} else {
			var candidate = {
				id: data[0].id
				,name: data[0].name
				,linkedin_profile_id: data[0].linkedin_profile_id
				,linkedin_img_url: data[0].linkedin_img_url
				,work_history_items: []
			}
			data.forEach(function(row){
				var workItem = {};
				['start_time','end_time','company_id','company_name','executive_id','title','description'].forEach(function(k){
					workItem[k] = row[k]
				})
				workItem.location = {city:'Los Angeles',state:'CA'};
				candidate.work_history_items.push(workItem);
			})
			//cb(false,candidate);
			getCandidateSkills(candidateId,function(err,data){ // @todo: make this async if being used for anything in production
				if (err) {
					return cb(err);
				}
				candidate.skills = data;
				cb(false,candidate);
			})
		}
		con.end();
	})
}


function getCandidateSkills(candidateId,cb){
	var con = db()
		,q = 'select s.* from skills s inner join candidate_skills cs on s.id=cs.skill_id inner join candidates c on c.id=cs.candidate_id where cs.candidate_id=? order by s.display_order asc'
		,p = [candidateId]
	;
	con.query(q,p,cb);
}


