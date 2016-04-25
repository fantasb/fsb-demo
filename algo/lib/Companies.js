/*
*/

var db = require('../lib/db.mysql.js')
,sext = require('sext')
;


var getById = module.exports.getById = function(id,cb){
	var con = db()
		,q = 'select * from companies where id=?'
		,p = [id]
	;

	con.query(q,p,function(err,data){
		con.end();
		if (!err && !data[0]) {
			err = 'Cannot find Company with id '+id;
			err.code = 404;
		}
		if (err) {
			return cb(err);
		}
		cb(false, createDto(data[0]));
	});
}

var getByName = module.exports.getByName = function(name,cb){
	var con = db()
		,q = 'select * from companies where name=?'
		,p = [name]
	;

	con.query(q,p,function(err,data){
		con.end();
		if (!err && !data[0]) {
			err = new Error('Cannot find Company with name '+name);
			err.code = 404;
		}
		if (err) {
			return cb(err);
		}
		cb(false, createDto(data[0]));
	});
}

module.exports.getByDisplayName = function(name,cb){
	var con = db()
		,q = 'select * from companies where display_name=?'
		,p = [name]
	;

	con.query(q,p,function(err,data){
		con.end();
		if (!err && !data[0]) {
			err = new Error('Cannot find Company with display name '+name);
			err.code = 404;
		}
		if (err) {
			return cb(err);
		}
		cb(false, createDto(data[0]));
	});
}

module.exports.create = function(name,displayName,description,rating,cb){
	if (description === null) description = '';

	var con = db()
		,q = 'insert into companies (name,display_name,description,rating,created,updated) values (?,?,?,?,?,?) on duplicate key update display_name=?,description=?,rating=?,updated=?'
		,now = Math.floor(Date.now()/1000)
		,p = [name,displayName,description,rating,now,now,displayName,description,rating,now]
	;

	con.query(q,p,function(err,data){
		con.end();
		if (err) {
			return cb(err);
		}
		//cb(false, createDto({name:name, display_name:displayName, description:description, rating:rating, updated:now});
		getByName(name,cb);
	});
}

module.exports.makeNameWithDisplayName = function(displayName,cb){
	process.nextTick(function(){
		var name = displayName.toLowerCase().replace(/ +/g,'-').replace(/[^a-z0-9_\-]/g,'');
		cb(false,name);
	});
}


function createDto(data){
	var dto = sext({
		id: null
		,name: null
		,display_name: null
		,description: null
		,rating: null
		,created: null
		,updated: null
	}, data);
	//dto.id = +dto.id;
	//dto.created = +dto.created;
	//dto.updated = +dto.updated;
	return dto;
}
