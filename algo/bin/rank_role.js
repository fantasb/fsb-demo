/*
node ./bin/rank_role.js --role_id=1
*/

var argv = require('minimist')(process.argv.slice(2))
,rankRole = require('../lib/rank_role.js')
;

var roleId = argv.role_id || argv.r || null

if (!roleId) {
	console.log('Please supply a role_id');
	process.exit();
}

rankRole(roleId, function(err,data){
	if (err) {
		return console.log('ERROR',err);
	}
	console.log(data);
})
