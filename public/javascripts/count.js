exports.count_mw = function () {
	var cont = 0;
	return function(req, res, next){
				if(req.path == "/"){
					cont++;
				}
				res.locals.counter = cont;
				next();
				}
}