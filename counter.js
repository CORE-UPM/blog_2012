var contador = 0;

exports.getContador = function(req, res, next){

  if(req.url == '/'){
    contador ++;
    res.locals.visitors = contador;
    console.log(res.locals.visitors);
  }
   next();
};
