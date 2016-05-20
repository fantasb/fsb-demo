/*
Input: Row of candidate data from google spreadsheet

To Do:
	- Split this up into separate streams
*/

var through = require('through')
,sext = require('sext')
,ut = require('../lib/ut')
,Candidates = require('../lib/Candidates')
,Executives = require('../lib/Executives')
,Roles = require('../lib/Roles')
,Skills = require('../lib/Skills')
,Education = require('../lib/Education')
,Companies = require('../lib/Companies')
,RoleFacts = require('../lib/RoleFacts')
;

module.exports = function(opts){
	opts = sext({
		handleExisting: 'replace'
	},opts);
	if (['ignore','append','replace'].indexOf(opts.handleExisting) == -1)
		throw new Error('Invalid handleExisting opt value');
	if (opts.handleExisting != 'replace') throw new Error('Invalid handleExisting opt value - only supports "replace" atm');

	var s = through(function(sourceData){

		var candidateLid = (sourceData.linkedinusername||'').trim()
			,candidateName = (sourceData.name||'').trim()
			,candidateLinkedInImgUrl = (sourceData.linkedinimageurl||'').trim()
			,candidatePrimaryEmail = (sourceData.email||'').trim()
			,candidateRoleDisplayNames = (sourceData.roles||'').trim()
		;
		if (!(candidateLid && candidateName && candidateRoleDisplayNames)) {
			return s.emit('candidate-fatal', 'missing LinkedIn Username, Name, or Roles field', sourceData);
		}

		Candidates.create(candidateName, candidateLid, candidateLinkedInImgUrl, candidatePrimaryEmail, 1, function(err,candidate){
			if (err) return s.emit('candidate-fatal', err, sourceData);
			// --- CANDIDATE CREATED

			addCandidateRoles(candidate.id, candidateRoleDisplayNames.split(','), function(err){
				if (err) s.emit('soft-error', err);
			});

			if (candidatePrimaryEmail) {
				Candidates.addEmail(candidate.id,candidatePrimaryEmail,'scrape',function(err){
					if (err) s.emit('soft-error', err, sourceData);
				});
			}s

			addSkills(candidate.id, (sourceData.skills||'').split(','),function(err){
				if (err) s.emit('soft-error', err, sourceData);
			});

			var i=1;
			while (sourceData['degree'+i+'field']) {
				addDegree(candidate.id,sourceData['degree'+i+'name'],sourceData['degree'+i+'field'],sourceData['degree'+i+'roles'],sourceData['degree'+i+'institution'],sourceData['degree'+i+'description'],sourceData['degree'+i+'startdate'],sourceData['degree'+i+'enddate'],function(err){
					if (err) s.emit('soft-error', err, sourceData);
				});
				++i;
			}

			var i=1;
			while (sourceData['workhistoryitem'+i+'title']) {
				addWorkHistoryItem(candidate.id,sourceData['workhistoryitem'+i+'title'],sourceData['workhistoryitem'+i+'role'],sourceData['workhistoryitem'+i+'company'],sourceData['workhistoryitem'+i+'description'],sourceData['workhistoryitem'+i+'location'],sourceData['workhistoryitem'+i+'executive'],sourceData['workhistoryitem'+i+'executivelinkedinid'],sourceData['workhistoryitem'+i+'startdate'],sourceData['workhistoryitem'+i+'enddate'],function(err){
					if (err) s.emit('soft-error', err, sourceData);
				});
				++i;
			}

			var workedOnHighVolumeApps = (sourceData['workedonhigh-volumeapp']||'').trim().toLowerCase();
			if (workedOnHighVolumeApps && workedOnHighVolumeApps != 'no' && workedOnHighVolumeApps != 'false') {
				addMiscRoleFact(candidate.id,'worked_apps_volume_100k',function(err){
					if (err) s.emit('soft-error', err, sourceData);
				});
			}

		});

	},function(){
		console.log('-- END --', 'import_candidate');
	},{autoDestroy:false});
	return s;
}



function addCandidateRoles(candidateId, roleDisplayNames, cb){
	if (!Array.isArray(roleDisplayNames)) roleDisplayNames = [roleDisplayNames];
	var numToAdd = 0, numAdded = 0;
	roleDisplayNames.forEach(function(roleDisplayName){
		roleDisplayName = roleDisplayName.trim();
		if (!roleDisplayName) return;
		++numToAdd;
		Roles.getByName(ut.makeUrlPathFriendlyName(roleDisplayName),function(err,role){
			Candidates.addRole(candidateId, role.id, function(err){
				if (err) {
					cb(err);
					cb = function(){}
				}
				if (++numAdded == numToAdd)
					cb();
			});
		});
	});
	if (!numToAdd) process.nextTick(cb);
}


function addSkills(candidateId, skills, cb) {
	var numToAdd = 0, numAdded = 0;
	skills.forEach(function(displayName){
		displayName = displayName.trim();
		if (!displayName) return;
		++numToAdd;
		var name = ut.makeUrlPathFriendlyName(displayName);
		Skills.create(name,displayName,null,1,function(err,skill){
			if (err) return error(err);
			Skills.addCandidateSkill(skill.id,candidateId,function(err){
				if (err) return error(err);
				if (++numAdded == numToAdd)
					cb();
			});
		});
	});
	if (!numToAdd) process.nextTick(cb);
	function error(msg){
		cb(msg);
		cb = function(){}
	}
}


function addDegree(candidateId, degreeName, degreeField, historyItemRoleDisplayNames, institutionName, description, startDate, endDate, cb) {
	degreeName = (degreeName||'').trim();
	degreeField = (degreeField||'').trim();
	historyItemRoleDisplayNames = (historyItemRoleDisplayNames||'').split(',');
	institutionName = (institutionName||'').trim();
	description = (description||'').trim();
	startDate = formatDateForDb(parseDateInput(startDate));
	endDate = formatDateForDb(parseDateInput(endDate));

	if (!(degreeName || degreeField)) return;

	var institution;
	if (institutionName) {
		Education.createInstitution(institutionName,null,function(err,data){
			if (err) return error(err);
			institution = data;
			next();
		});
	} else {
		next();
	}

	function next(){
		Education.createDegreeType(degreeName,degreeField,function(err,degreeType){
			if (err) return error(err);
			Education.addHistoryItem(candidateId, degreeType.id, institution&&institution.id, description, startDate, endDate, function(err,historyItem){
				if (err) return error(err);
				var numToAdd = 0, numAdded = 0;
				historyItemRoleDisplayNames.forEach(function(roleDisplayName){
					roleDisplayName = roleDisplayName.trim();
					if (!roleDisplayName) return;
					++numToAdd;
					Roles.getByName(ut.makeUrlPathFriendlyName(roleDisplayName),function(err,role){
						if (err) return error(err);
						Education.addHistoryItemRole(historyItem.id,role.id,function(err){
							if (err) return error(err);
							if (++numAdded == numToAdd)
								cb();
						});
					});
				});
				if (!numToAdd) cb();
			})
		})
	}

	function error(msg){
		cb(msg);
		cb = function(){}
	}
}


function addWorkHistoryItem(candidateId, title, roleDisplayName, companyDisplayName, description, location, executiveName, executiveLinkedInId, startDate, endDate, cb) {
	title = (title||'').trim();
	roleDisplayName = (roleDisplayName||'').trim();
	companyDisplayName = (companyDisplayName||'').trim();
	description = (description||'').trim();
	location = (location||'').trim();
	executiveName = (executiveName||'').trim();
	executiveLinkedInId = (executiveLinkedInId||'').trim();
	startDate = formatDateForDb(parseDateInput(startDate));
	endDate = formatDateForDb(parseDateInput(endDate));

	if (!(title && startDate)) return;

	var numWaiting = 3
	function next(){
		if (--numWaiting == 0) {
			Candidates.addWorkHistoryItem(candidateId, title, description, startDate, endDate, company&&company.id, executive&&executive.id, role&&role.id, cb);
		}
	}

	function error(msg){
		cb(msg);
		cb = function(){}
	}

	var role;
	if (roleDisplayName) {
		// require role to already exist...
		//Roles.getByName(ut.makeUrlPathFriendlyName(roleDisplayName),function(err,data){
		// create a new role if doesnt exist...
		//Roles.create(ut.makeUrlPathFriendlyName(roleDisplayName),roleDisplayName,null,true,function(err,data){
		// ignore if role doesn't exist...
		Roles.getByName(ut.makeUrlPathFriendlyName(roleDisplayName),function(err,data){ if (err && err.code == 404) return next();
			if (err) return error(err);
			role = data;
			next();
		});
	} else {
		next();
	}
	
	var company;
	if (companyDisplayName) {
		Companies.create(ut.makeUrlPathFriendlyName(companyDisplayName),companyDisplayName,null,function(err,data){
			if (err) return error(err);
			company = data;
			next();
		});
	} else {
		next();
	}

	var executive;
	if (executiveName && executiveLinkedInId) {
		Executives.create(executiveName,executiveLinkedInId,function(err,data){
			if (err) return error(err);
			executive = data;
			next();
		});
	} else {
		next();
	}

}


function addMiscRoleFact(candidateId, roleFactName, cb){
	RoleFacts.getByName(roleFactName,function(err,roleFact){
		if (err) return cb(err);
		Candidates.addMiscRoleFact(candidateId, roleFact.id, cb);
	});
}



function parseDateInput(dateStr){
	dateStr = (dateStr||'').trim();
	var date = new Date(0), m;

	if (m = dateStr.match(/^([0-9]{4})$/)) {
		// 2014
		date.setUTCFullYear(m[1]);
	} else if (m = dateStr.match(/^([0-9]{1,2})\/([0-9]{4})$/)) {
		// 8/2014
		date.setUTCMonth(m[1]-1);
		date.setUTCFullYear(m[2]);
	} else if (m = dateStr.match(/^([0-9]{1,2})\/([0-9]{1,2})\/([0-9]{4})$/)) {
		// 02/08/2014
		date.setUTCDate(m[1]);
		date.setUTCMonth(m[2]-1);
		date.setUTCFullYear(m[3]);
	} else {
		date = null;
	}

	if (isNaN(date)) {
		console.log('INVALID DATE', dateStr);
		date = null;
	}

	return date;
}

function formatDateForDb(date){
	return date ? Math.floor(+date/1000) : null;
}


