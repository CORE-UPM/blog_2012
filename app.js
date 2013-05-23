
/**
 * Carga módulos
 */

var express = require('express'), 
    partials = require('express-partials'),
    routes = require('./routes'), // Solo para index
    autores = require('./routes/autores'),
    postController = require('./routes/post_controller'),
    count = require('./public/javascripts/count'),
    http = require('http'),
    path = require('path');

var visitas = count.getCount();
var app = express();

app.use(partials());
app.use(count.count_mw());

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
	app.use(express.cookieParser('your secret here'));
	app.use(express.session());
	// Middleware para permitir crear rutas
	app.use(app.router);
	// Middleware para atender páginas estáticas
	app.use(express.static(path.join(__dirname, 'public')));
	
	// Error handler
	app.use(function(err, req, res, next) {
		if (util.isError(err)) {
			next(err);
		}
		else {
			console.log(err);
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

app.get('/', routes.index);
app.get('/autores', autores.autores);
app.get('/posts.:format?', postController.index);
app.get('/posts/new', postController.new);
app.get('/posts/:postid([0-9]+).:format?', postController.show);
app.get('/posts/:postid([0-9]+)/edit', postController.edit);
app.post('/posts', postController.create);
app.post('/posts/search', postController.search);
app.put('/posts/:postid([0-9]+)', postController.update);
app.delete('/posts/:postid([0-9]+)', postController.destroy);

// Atender peticiones en puerto 3000 o donde diga port
http.createServer(app).listen(app.get('port'), function(){
  console.log('Servidor escuchando al puerto: ' + app.get('port'));
});
