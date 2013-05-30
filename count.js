
/*
 * Count.
 */
 module.exports = function(){
	var cont = 0;
	return function(req, res, next){
		//paracontar solo las visitas una vez.
		if (req.path == '/'){
			cont++;
		}
		res.locals.aaa = cont;
		next();
	};
};