var count = require('../public/javascripts/count.js');
var util = require('util');
var time = -1;

// Formulario para hacer login
// Típica ruta REST que devuelve un formulario para crear un nuevo recurso
// Paso como parámetro el valor de redir que han puesto en la query
// O se vuelve a '/'

exports.new = function(req, res) {
	res.render('session/new', {
		redir: req.query.redir || '/',
		visitas: count.getCount(),
		style: 'session_new'
	});
}

// Crear sesión, es decir, hacer el login
// El formulario mostrado por /login utiliza como action este método
// Se toman los parámetros y se intenta hacer login con ellos, creando una session
// Si la autenticación falla, redirigir al formulario de login
// El valor de redir se arrastra siempre
exports.create = function(req, res) {
	var redir = req.body.redir || '/';
	var login = req.body.login;
	var password = req.body.password;
	require('./user_controller').autenticar(login, password, function(error, user) {
		if (error) {
			if (util.isError(error)) {
				next(error);
			}
			else {
				req.flash('error', 	error);
				res.redirect("/login?redir=" + redir);
			}
			return;
		}
		// IMPORTANTE: Crear req.session.user
		// Solo guardo algunos campos del usuario
		req.session.user = {id:user.id, login:user.login, name:user.name};
		res.redirect(redir); // Vuelvo a la URL indicada
	});
}

// Logout
exports.destroy = function(req, res) {
	delete req.session.user;
	req.flash('success', 'Cerrada la sesión');
	res.redirect('/login');
}

exports.requiresLogin = function(req, res, next) {
	if (req.session.user) {
		next();
	}
	else {
		res.redirect('/login?redir=' + req.url);
	}
}

// Session timer
exports.timeout = function(req, res, next) {
	if (req.session.user) {
		if (time == -1) {
			time = new Date().getTime();
			next();
		}
		else {
			now = new Date().getTime();
			if ((now-time) < 60*1000) {
				time = now;
				next();
			}
			else {
				delete req.session.user;
				time = -1;
				req.flash('info', 'La sesión ha expirado. Vuelve a hacer login');
				res.redirect('/login');
			}
		}
	}
	else {
		time = -1;
		next();
	}
}
	
