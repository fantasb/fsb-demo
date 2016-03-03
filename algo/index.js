/*

*/

/*module.exports = function(){

}*/

var config = require('./config.js')
,db = require('./lib/db.mysql.js')
;
//console.log(config);

var dbConn = db()

/*
var q = 'show tables'
,p = []
dbConn.query(q, p, function(err,data){
	console.log(err,data)
	dbConn.end()
})
*/

var q = 'select * from candidates c \
	inner join candidate_roles cr on c.id=cr.candidate_id \
	inner join roles r on cr.role_id=r.id \
'
,p = []
dbConn.query(q, p, function(err,data){
	console.log(err,data)
	dbConn.end()
})



