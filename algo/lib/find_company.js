/*
Find Company by company display name
Creates Company if not exists

To Do
	- Smart soft match
*/
var Companies = require('../lib/Companies.js')
,through = require('through')
;

module.exports = function(nameKey){
	var s = through(function(sourceData){
		var companyDisplayName = (sourceData[nameKey]||'').trim();
		if (!companyDisplayName) {
			return s.emit('company-find-fail', sourceData, 'name is null');
		}

		Companies.makeNameWithDisplayName(companyDisplayName,function(err,companyName){
			if (err) return s.emit('company-find-fail', {display_name:companyDisplayName}, err);
			Companies.getByName(companyName,function(err,data){
				if (!err) {
					sourceData.company = data;
					return s.queue(sourceData);
				}
				if (err.code != 404) {
					return s.emit('company-find-fail', {display_name:companyDisplayName}, err);
				}
				Companies.create(companyName,companyDisplayName,null,null,function(err,data){
					if (err) return s.emit('company-find-fail', {display_name:companyDisplayName}, err);
					s.emit('company-created', data, err);
					sourceData.company = data;
					s.queue(sourceData);
				});
			});
		});
		
	},function(){
	},{autoDestroy:false});
	return s;
}
