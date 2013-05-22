var cont=0;

exports.getCount = function (req, res, next) {
	cont++;
	console.log("Visitas: "+ cont);
	next();
}

exports.contador = function(){
	return cont;
}