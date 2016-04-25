/*
*/

var db = require('../lib/db.mysql.js')
,sext = require('sext')
;


var getById = module.exports.getById = function(id,cb){
	var con = db()
		,q = 'select * from roles where id=?'
		,p = [id]
	;

	con.query(q,p,function(err,data){
		con.end();
		if (!err && !data[0]) {
			err = 'Cannot find Role with id '+id;
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
		,q = 'select * from roles where name=?'
		,p = [name]
	;

	con.query(q,p,function(err,data){
		con.end();
		if (!err && !data[0]) {
			err = new Error('Cannot find Role with name '+name);
			err.code = 404;
		}
		if (err) {
			return cb(err);
		}
		cb(false, createDto(data[0]));
	});
}

module.exports.create = function(name,displayName,parentRoleId,visible,cb){
	visible = visible ? 1 : 0;

	var con = db()
		,q = 'insert into roles (name,display_name,parent_role_id,visible,created) values (?,?,?,?,?) on duplicate key update display_name=?,parent_role_id=?,visible=?'
		,now = Math.floor(Date.now()/1000)
		,p = [name,displayName,parentRoleId,visible,now, displayName,parentRoleId,visible]
	;

	con.query(q,p,function(err,data){
		con.end();
		if (err) {
			return cb(err);
		}
		//cb(false, createDto({ ... });
		getByName(name,cb);
	});
}


function createDto(data){
	var dto = sext({
		id: null
		,name: null
		,display_name: null
		,parent_role_id: null
		,visible: null
		,created: null
	}, data);
	//dto.id = +dto.id;
	//dto.parent_role_id = +dto.parent_role_id;
	//dto.visible = +dto.visible;
	//dto.created = +dto.created;
	return dto;
}
