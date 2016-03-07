/*
Temp method to grab a Candidate for demo
*/


var db = require('../lib/db.mysql.js')
;



module.exports = function(candidateId,cb){
	var con = db()
		,q = 'select * from candidates c left outer join work_history_items whi on c.id=whi.candidate_id where c.id=? order by whi.start_time desc'
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
				,linkedin_profile_link: data[0].linkedin_profile_link
				,work_history_items: []
			}
			data.forEach(function(row){
				var workItem = {};
				['start_time','end_time','company_id','executive_id','title','description'].forEach(function(k){
					workItem[k] = row[k]
				})
				candidate.work_history_items.push(workItem);
			})
			cb(false,candidate);
		}
		con.end();
	})
}