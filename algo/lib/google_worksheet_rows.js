/*
To Do
	- Rate limit? (will ever have lots and lots of worksheets?)
*/
var through = require('through')
;

module.exports = function(worksheetIds){
	if (!Array.isArray(worksheetIds))
		worksheetIds = [worksheetIds];

	var s = through(function(sheet){
		var numToGet = worksheetIds.length, numGot = 0
		worksheetIds.forEach(function(worksheetId){
			var worksheet = sheet.worksheets[worksheetId];
			if (!worksheet) {
				return s.emit('worksheet-parse-fail', {sheetId:sheet.id, worksheetId:worksheetId}, 'cannot find worksheet');
			}
			worksheet.getRows(function(err,rows){
				if (err) {
					return s.emit('worksheet-parse-fail', {sheetId:sheet.id, worksheetId:worksheetId}, err);
				}
				rows.forEach(function(row){
					s.queue(row);
				});
				if (++numGot == numToGet) 
					s.queue(null);
			});
		});
		
	},function(){
	},{autoDestroy:false});
	return s;
}
