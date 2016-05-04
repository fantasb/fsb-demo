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

module.exports.create = function(name,displayName,description,cb){
	if (description === null) description = '';

	var con = db()
		,q = 'insert into companies (name,display_name,description,created,updated) values (?,?,?,?,?) on duplicate key update display_name=?,description=?,updated=?'
		,now = Math.floor(Date.now()/1000)
		,p = [name,displayName,description,now,now,displayName,description,now]
	;

	con.query(q,p,function(err,data){
		con.end();
		if (err) {
			return cb(err);
		}
		//cb(false, createDto({name:name, display_name:displayName, description:description, updated:now});
		getByName(name,cb);
	});
}

var updateById = module.exports.updateById = function(id,updateData,cb){
	var con = db()
		,q = 'update companies set ? where id=?'
		,p = [updateData, id]
	;
	con.query(q,p,function(err,data){
		con.end();
		if (err) {
			return cb(err);
		}
		getById(id,cb);
	});
}

module.exports.updateByName = function(name,updateData,cb){
	getByName(name,function(err,item){
		if (err) return cb(err);
		updateById(item.id,updateData,cb);
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
	//dto.rating = dto.rating === null ? null : +dto.rating;
	//dto.created = +dto.created;
	//dto.updated = +dto.updated;
	return dto;
}
