var count = 0;
exports.getCount = function(req, res, next){
	req.count = ++count;
	console.log("[counter] Nueva request");
	next();
};
exports.removeCount = function(req, res, next){
	count--;
	console.log("[counter] ...request estática. Totales: " + count);
	next();
};