var contador = 1;
exports.contar = function(){
  		return function(req,res,next){
		contador ++;
		console.log("Visitas: " + (contador));
		next();
		}	
};
exports.getCount=function(){
	return contador;
}
