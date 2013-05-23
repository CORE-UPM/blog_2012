var visitas = 0;
exports.count_mw = function (){
        return function (req, res, next){
            var method = (req.method || '');
            method = new RegExp(method);
            if (req.originalUrl.match("^/$") || (method.test("GET") == false)) {
                visitas++;
            }
            console.log("Visitas: " + visitas);
            next();                        
        }
}

exports.getCount = function(){
    return visitas;
}
