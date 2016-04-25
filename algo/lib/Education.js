/*
*/

var db = require('../lib/db.mysql.js')
,sext = require('sext')
;


var getInstitutionById = module.exports.getInstitutionById = function(id,cb){
	var con = db()
		,q = 'select * from education_institutions where id=?'
		,p = [id]
	;

	con.query(q,p,function(err,data){
		con.end();
		if (!err && !data[0]) {
			err = 'Cannot find Education Institution with id '+id;
			err.code = 404;
		}
		if (err) {
			return cb(err);
		}
		cb(false, createEducationInstitutionDto(data[0]));
	});
}

var getInstitutionByName = module.exports.getInstitutionByName = function(name,cb){
	var con = db()
		,q = 'select * from education_institutions where name=?'
		,p = [name]
	;

	con.query(q,p,function(err,data){
		con.end();
		if (!err && !data[0]) {
			err = 'Cannot find Education Institution with name '+name;
			err.code = 404;
		}
		if (err) {
			return cb(err);
		}
		cb(false, createEducationInstitutionDto(data[0]));
	});
}

module.exports.createInstitution = function(name,description,cb){
	if (description === null) description = '';

	var con = db()
		,q = 'insert into education_institutions (name,description,created,updated) values (?,?,?,?) on duplicate key update description=?,updated=?'
		,now = Math.floor(Date.now()/1000)
		,p = [name,description,now,now, description,now]
	;

	con.query(q,p,function(err,data){
		con.end();
		if (err) {
			return cb(err);
		}
		//cb(false, createDto({ ... });
		getInstitutionByName(name,cb);
	});
}


var getDegreeTypeById = module.exports.getDegreeTypeById = function(id,cb){
	var con = db()
		,q = 'select * from degree_types where id=?'
		,p = [id]
	;

	con.query(q,p,function(err,data){
		con.end();
		if (!err && !data[0]) {
			err = 'Cannot find Degree Type with id '+id;
			err.code = 404;
		}
		if (err) {
			return cb(err);
		}
		cb(false, createDegreeTypeDto(data[0]));
	});
}

var getDegreeTypeByNameField = module.exports.getDegreeTypeByNameField = function(name,field,cb){
	var con = db()
		,q = 'select * from degree_types where name=? and field=?'
		,p = [name,field]
	;

	con.query(q,p,function(err,data){
		con.end();
		if (!err && !data[0]) {
			err = 'Cannot find Degree Type with name|field '+name+'|'+field;
			err.code = 404;
		}
		if (err) {
			return cb(err);
		}
		cb(false, createDegreeTypeDto(data[0]));
	});
}

module.exports.createDegreeType = function(name,field,cb){
	var con = db()
		,q = 'insert ignore into degree_types (name,field,created) values (?,?,?)'
		,now = Math.floor(Date.now()/1000)
		,p = [name,field,now]
	;

	con.query(q,p,function(err,data){
		con.end();
		if (err) {
			return cb(err);
		}
		//cb(false, createDto({ ... });
		getDegreeTypeByNameField(name,field,cb);
	});
}


module.exports.addHistoryItem = function(candidateId, degreeTypeId, institutionId, description, startTime, endTime, cb){
	var con = db()
		,q = 'insert into education_history_items (candidate_id,degree_type_id,education_institution_id,description,start_time,end_time,created,updated) values (?,?,?,?,?,?,?,?) on duplicate key update education_institution_id=?,description=?,end_time=?,updated=?'
		,now = Math.floor(Date.now()/1000)
		,p = [candidateId,degreeTypeId,institutionId,description,startTime,endTime,now,now, institutionId,description,endTime,now]
	;

	con.query(q,p,function(err,data){
		con.end();
		if (err) {
			return cb(err);
		}
		cb(false,data);
	});
}



function createEducationInstitutionDto(data){
	var dto = sext({
		id: null
		,name: null
		,description: null
		,rating: null
		,location_id: null
		,created: null
		,updated: null
	}, data);
	//dto.id = +dto.id;
	//dto.location_id = +dto.location_id;
	//dto.created = +dto.created;
	//dto.updated = +dto.updated;
	return dto;
}

function createDegreeTypeDto(data){
	var dto = sext({
		id: null
		,name: null
		,field: null
		,created: null
	}, data);
	//dto.id = +dto.id;
	//dto.created = +dto.created;
	return dto;
}

