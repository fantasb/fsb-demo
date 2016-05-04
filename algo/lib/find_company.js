/*
Find Company by company display name
Creates Company if not exists

To Do
	- Smart soft match
*/
var through = require('through')
,ut = require('../lib/ut')
,Companies = require('../lib/Companies.js')
;

module.exports = function(nameKey,createIfNotExists){
	var s = through(function(sourceData){
		var companyDisplayName = (sourceData[nameKey]||'').trim();
		if (!companyDisplayName) {
			return s.emit('company-find-fail', sourceData, 'name is null');
		}

		var companyName = ut.makeUrlPathFriendlyName(companyDisplayName);
		Companies.getByName(companyName,function(err,data){
			// we found the company, attach and pass downstream
			if (!err) {
				sourceData.company = data;
				return s.queue(sourceData);
			}

			// we have an error
			// 	if 404 only fail if we arent supposed to create one
			if (err.code != 404 || !createIfNotExists) {
				return s.emit('company-find-fail', {display_name:companyDisplayName}, err);
			}

			Companies.create(companyName,companyDisplayName,null,function(err,data){
				if (err) return s.emit('company-find-fail', {name:companyName, display_name:companyDisplayName}, err);
				s.emit('company-created', data, err);
				sourceData.company = data;
				s.queue(sourceData);
			});
		});
		
	},function(){
	},{autoDestroy:false});
	return s;
}
