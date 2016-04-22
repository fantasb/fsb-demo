/*
Temp method to grab Roles for demo
*/


var db = require('../lib/db.mysql.js')
;


module.exports = function(cb){
	var con = db()
		,q = 'select * from roles where visible=1 order by display_name asc'
		,p = []
	;

	con.query(q,p,function(err,data){
		con.end();
		if (err) {
			return cb(err);
		}
		cb(false,data);
	});
}
