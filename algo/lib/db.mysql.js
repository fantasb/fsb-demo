
var mysql = require('mysql')
,dbc = require('../config.js').mysql
,db = null
;

module.exports = function(){
	if (db === null) {
		db = mysql.createPool({
			host: dbc.host
			,user: dbc.user
			,password: dbc.pass
			,database: dbc.db
			,port: dbc.port
			//,connectionLimit: 20 // default 10
			//,acquireTimeout: 30000 // default 10000
		});
	}
	return db;
}
