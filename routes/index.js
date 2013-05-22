
/*
 * GET home page.
 */

exports.index = function(req, res){

	var numeros=["/images/cero.jpg" , "/images/uno.jpg" , "/images/dos.jpg" , "/images/tres.jpg" , "/images/cuatro.jpg" , "/images/cinco.jpg" ,"/images/seis.jpg" , "/images/siete.jpg" , "/images/ocho.jpg" , "/images/nueve.jpg"];
    function num2img(numVisitas){
        numVisitas=""+numVisitas;
        var src = [];
        for(a=0;a<numVisitas.length;a++){
        src[a] = numeros[numVisitas.charAt(a)];
        }
        return src;
    }

  	res.render('index', {imagenes: num2img(req.visitas)});
};