
exports.comp_ses = function(req, res, next){

	if (req.session.user) {
		var t1 = req.session.user.login_time;

		var t2 = new Date().getTime();
				//console.log("SESION: "+t1+"    Y EL OTRO"+t2);
		var dif = t1 - t2;
		var Seconds_from_T1_to_T2 = dif / 1000;
		var Seconds_Between_Dates = Math.abs(Seconds_from_T1_to_T2);
		if(Seconds_Between_Dates>30){
			delete(req.session.user);
			req.flash('error', 'Su sesión ha expirado, vuelva a entrar con su login y contraseña');
			//res.redirect('/login');
		}else{
			req.session.user.login_time=t2;
		}

 	}
 	next();
}

