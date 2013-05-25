
/**
 * Carga módulos
 */

var express = require('express'), 
    partials = require('express-partials'),
    routes = require('./routes'), // Solo para index
    autores = require('./routes/autores'),
    postController = require('./routes/post_controller'),
    userController = require('./routes/user_controller'),
    sessionController = require('./routes/session_controller'),
    count = require('./public/javascripts/count'),
    http = require('http'),
    util = require('util'),
    path = require('path');

var visitas = count.getCount();
var app = express();

app.use(partials());
app.use(count.count_mw());

app.configure(function() {
	// Crea servidor http
	app.set('port', process.env.PORT || 3000); // puerto que tiene definido nuestro entorno por defecto
	app.set('views', __dirname + '/views');
	// Usa ejs como motor de las vistas
	app.set('view engine', 'ejs');
	app.use(express.favicon());
	app.use(express.logger('dev'));
	// Middleware para parsear el body de las peticiones HTTP
	app.use(express.bodyParser());
	// Middleware para soportar cambiar el método HTTP al especificado por _method
	app.use(express.methodOverride());
	app.use(express.cookieParser('--Blog del Curioso--'));
	app.use(express.session());
	// Mensajes Flash
	app.use(require('connect-flash')());
	// Hacer visible req.flash() en las vistas
	app.use(function(req, res, next) {
		res.locals.flash = function() {
			return req.flash()
		};
		next();
	});
	// Middleware para permitir crear rutas
	app.use(app.router);
	// Middleware para atender páginas estáticas
	app.use(express.static(path.join(__dirname, 'public')));
});
	
// Error handler
app.use(function(err, req, res, next) {
	if (util.isError(err)) {
		next(err);
	}
	else {
		console.log(err);
		req.flash('error', err);
		res.redirect('/');
	}
});

// Development only. Middleware de atención de errores.
if ('development' == app.get('env')) {
	app.use(express.errorHandler({dumpExceptions: true, showStack: true}));
}
else {
	app.use(express.errorHandler());
}

app.locals.escapeText = function(text) {
	return String(text)
		.replace(/&(?!\w+;)/g, '&amp;')
		.replace(/</g, '&lt;')
		.replace(/>/g, '&gt;')
		.replace(/"/g, '&quot;')
		.replace(/\n/g, '<br>;')
};

// Definición de rutas
app.param('postid', postController.load);
app.param('userid', userController.load);

app.get('/', routes.index);
app.get('/autores', autores.autores);

app.get('/login', sessionController.new);
app.get('/logout', sessionController.destroy);
app.post('/login', sessionController.create);

app.get('/posts.:format?', postController.index);
app.get('/posts/new', sessionController.requiresLogin, postController.new);
app.get('/posts/:postid([0-9]+).:format?', postController.show);
app.get('/posts/:postid([0-9]+)/edit', postController.edit);
app.post('/posts', sessionController.requiresLogin, postController.create);
app.post('/posts/search', postController.search);
app.put('/posts/:postid([0-9]+)', sessionController.requiresLogin, postController.update);
app.delete('/posts/:postid([0-9]+)', sessionController.requiresLogin, postController.destroy);

app.get('/users.:format?', userController.index);
app.get('/users/new', userController.new);
app.get('/users/:userid([0-9]+).:format?', userController.show);
app.get('/users/:userid([0-9]+)/edit', sessionController.requiresLogin, userController.edit);
app.post('/users', userController.create);
app.put('/users/:userid([0-9]+)', sessionController.requiresLogin, userController.update);
app.delete('/users/:userid([0-9]+)', sessionController.requiresLogin, userController.destroy);

// Atender peticiones en puerto 3000 o donde diga port
http.createServer(app).listen(app.get('port'), function(){
  console.log('Servidor escuchando al puerto: ' + app.get('port'));
});
