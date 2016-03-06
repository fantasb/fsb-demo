/*

*/

/*module.exports = function(){

}*/



/*
var scoreCandidate = require('./lib/score_candidate.js')

scoreCandidate(8,function(err,data){
	console.log('index.js','err',err,'data',data);
});
*/



/*
var rankRole = require('./lib/rank_role');
rankRole(1,function(err,data){
	console.log('index.js','err',err,'data',data);
});
*/



/*
// percentile...

var set = [1,1,2,3,5,100]

set.sort(function(a,b){
	return a-b;
})

set.forEach(function(val,index){
	var percentile = 100 * (index+0.5)/set.length;
	console.log('percentile('+val+') = '+percentile);
})
*/



// standard deviation...
var set = [2,4,4,4,5,5,7,9]
set = [2,4,4,4,5,5,7,9,9,9,9,9,9,9,1000]
set = [0,37166294,37166294,131860694]
console.log(standardDeviation(set));

function standardDeviation(set){
	var mean = 0
	set.forEach(function(val){
		mean += val
	})
	mean = mean/set.length;
	console.log('mean',mean);

	var variance = 0
	set.forEach(function(val){
		variance += Math.pow(val-mean,2)
	})
	variance = variance/set.length; // set.length-1 if using sample of set (Bessel's correction)
	console.log('variance',variance);

	return Math.sqrt(variance);
}

