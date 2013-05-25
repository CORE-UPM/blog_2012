// Middleware contador de páginas
var cont = 0;

var counter = function() {
	return function(req, res, next){
		cont++;
		console.log("Visitas: " + cont);
		next();
	}
}

var getCount = function() {
	return cont;
}

exports.counter = counter;
exports.getCount = getCount;