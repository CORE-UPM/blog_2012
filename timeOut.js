
 var user_controller = require('./routes/user_controller.js')
 module.exports = function(){
	return function(req, res, next){
		if(req.session){
			if(req.session.user){
				var segundos = new Date().getTime()/1000;
				if (segundos - req.session.user.time > 60){
					delete req.session.user;
					req.flash('info','La sesión ha expirado');
				}else{
					user_controller.actualizarTiempo(req, res);
				}
			}
		}
		next();
	};
};