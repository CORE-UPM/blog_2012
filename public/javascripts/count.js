
var cont = 0;
exports.contar = function(req, res, next){
	cont++;
	console.log("Visitas: "+cont);
	next();

}

exports.getCount= function(){
	return cont;
}