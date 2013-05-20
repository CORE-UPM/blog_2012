exports.getCount = function(){
	var cont = 0;
	console.log('contador inicializado');
	return function (req,res,next){
		cont++;
		console.log('Visitas: '+cont);
		res.cont = cont;
		next();
	}
}