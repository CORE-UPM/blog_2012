 var util = require('util');


exports.new = function(req, res) {
    res.render('session/new', { redir: req.query.redir || '/' });
};



exports.requiresLogin = function (req, res, next) {
    if (req.session.user) {
        next();
    } else {
        res.redirect('/login?redir=' + req.url);
    }
};




exports.create = function(req, res) {

    var redir = req.body.redir || '/';

    console.log('REDIR = ' + redir);

    var login = req.body.login;
    var password  = req.body.password;

    console.log('Login    = ' + login);
    console.log('Password = ' + password);

    require('./user_controller').autenticar(login, password, function(error, user) {

        if (error) {
            if (util.isError(error)) {
                next(error);
            } else {
                req.flash('error', 'Se ha producido un error: '+error);
                res.redirect("/login?redir="+redir);        
            }
            return;
        }

        // IMPORTANTE: creo req.session.user.
        // Solo guardo algunos campos del usuario en la sesion.
        // Esto es lo que uso para saber si he hecho login o no.
        req.session.user = {id:user.id, login:user.login, name:user.name, time : ((new Date()).getTime())};
       

        // Vuelvo al url indicado en redir
        res.redirect(redir);
    });
}; 





exports.destroy = function(req, res) {

    delete req.session.user;
    req.flash('success', 'Logout.');
    res.redirect("/login");     
};


exports.isExpired = function(req,res,next){

    if(req.session.user){
        var currentTime = (new Date()).getTime();
        var lastTransaction = req.session.user.time;
        console.log("currentTime: "+currentTime);
        console.log("lastTransaction: "+lastTransaction);

        if((currentTime-lastTransaction)>=60000 ){
            console.log("SESSION EXPIRADA");
            delete req.session.user;
            req.flash("info","Su sesión ha expirado");
            res.redirect("/login");
        }else{
            next();
        }
         

    }else{
        console.log('Ruta prohibida: no soy el usuario logeado o sesión caduc');
        res.send(403);
    }
}
