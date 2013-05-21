/** 
 *  Middleware Count
 */ 

var contador=1;

exports.count_mw = function (){
	var cont = 0;
	return function (req, res, next){
		cont++;
		console.log("Visitas : "+cont);
		next();
		contador = cont;
	}
};

exports.getCount = function (){
		return contador;
};