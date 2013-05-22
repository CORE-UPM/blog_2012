var cuenta = 0;

module.exports.count_mw = function(){
	return function(req, res, next){
		cuenta++;
		console.log("Visitas = " + cuenta);
		next();
	};
}

module.exports.getCount = function(){
	return cuenta;
}
