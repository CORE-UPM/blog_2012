var visitas = 1;
exports.count = function (){
        return function (req, res, next){
            var method = (req.method || '');
            method = new RegExp(method);
            if (req.originalUrl.match("^/$") || (method.test("GET") == false)) {
                visitas++;
            }
            next();                        
        }
}

exports.getCount = function(){
    var digitos = Math.log(visitas)/Math.log(10);
    var numero = visitas;
    var valores = [];
    for (var i=0; i<=digitos; i++) {
       var cifra = numero%10;
       valores.push(cifra);
       numero=numero-cifra;
       numero=numero/10;
    }
    return valores;
}
