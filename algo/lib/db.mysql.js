
var mysql = require('mysql')
,dbc = require('../config.js').mysql
,db = null
,numOpen = 0, _end = null
;

module.exports = function(){
	if (db === null) {
		db = mysql.createPool({
			host: dbc.host
			,user: dbc.user
			,password: dbc.pass
			,database: dbc.db
			,port: dbc.port
			,charset: 'utf8mb4'
			//,connectionLimit: 20 // default 10
			//,acquireTimeout: 30000 // default 10000
		});

		_end = db.end;
		db.end = function(){
			//console.log('db.end()',numOpen);
			if (--numOpen == 0) {
				_end.apply(db,arguments);
				db = null;
			}
		}

		// convenience...
		if (typeof db.format == 'undefined')
			db.format = mysql.format;
	}

	// since we're using built in pool, let's only end when everyone says they're done
	++numOpen;

	return db;
}
