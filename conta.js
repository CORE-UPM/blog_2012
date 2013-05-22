var cont = 0;

module.exports.count_mw = function(){	

	return function (req, res, next){
	cont++;
	console.log(cont);
	next();
	}
};
module.exports.getCount = function(){
	return cont;
}