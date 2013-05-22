module.exports = function(){
	var cont = 0;
	return function(req, res, next){
		console.log("Visitas: " + cont);
		console.log("Request: " + req.path);
		// Para no contar los accesos a recursos o css
		if (req.path == '/') { // Solo contamos visita si se accede a home
			cont++;
		}
		res.locals.contador = cont;
		next();
	}
}