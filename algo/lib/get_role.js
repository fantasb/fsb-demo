/*
Temp method to grab a Role for demo
*/


var db = require('../lib/db.mysql.js')
;


module.exports = function(roleName,cb){
	var con = db()
		,q = 'select * from roles where name=?'
		,p = [roleName]
	;
	con.query(q,p,function(err,data){
		con.end();
		if (err) {
			return cb(err);
		}
		if (!data[0]) {
			return cb('Role '+roleName+' not found');
		}
		cb(false,data[0]);
	});
}
