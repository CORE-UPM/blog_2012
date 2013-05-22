// Middleware: Contador de visitas
//
var count = 0;
exports.getCount = function(req, res, next) {
	if(req.path == "/") {
    	  count++;
	}
	res.locals.visitas = count;
	console.log("Traza :" +  req.path);
	next();
};
