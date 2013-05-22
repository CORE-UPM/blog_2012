
/**
 * Module dependencies.
 */

var express = require('express')
  , routes = require('./routes')
  , user = require('./routes/user')
  , autores = require('./routes/autores')
  , http = require('http')
  , path = require('path')
  , partials = require('express-partials')
  , postController = require('./routes/post_controller.js');

var count = require('./count')
var app = express();

app.locals.escapeText = function(text) {
	return String(text)
		.replace(/&(?!\w+;)/g, '&amp;')
		.replace(/</g, '&lt;')
		.replace(/>/g, '&gt;')
		.replace(/"/g, '&quot;')
		.replace(/\n/g, '<br>');
};

app.use(partials());
// all environments
app.set('port', process.env.PORT || 3000);
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.bodyParser());
app.use(express.methodOverride());
app.use(express.cookieParser('your secret here'));
app.use(express.session());
app.use(app.router);
app.use(express.static(path.join(__dirname, 'public')));


// development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}

// Debe ejecutarse count_mw() solo en cada get del directorio raiz (get('/', ...))
// Si hacemos app.use(count.count_mw()); count_mw() se ejecuta en cada petición de objeto
// (o cualquier interaccion)
app.get('/', count.count_mw());			  // Se actualiza la cuenta de visitas al llamar al raiz
app.get('/', routes.index);				    // get a raiz
app.get('/autores', autores.autores);	// get a autores
app.get('/users', user.list);			    // get a usuarios (aun sin uso)

app.get('/posts.:format?', postController.index);
app.get('/posts/new', postController.new);
app.get('/posts/search', postController.search);  // get a mostrar busqueda de posts
app.get('/posts/:postid([0-9]+).:format?', postController.show);
app.post('/posts', postController.create);
app.get('/posts/:postid([0-9]+)/edit', postController.edit);
app.put('/posts/:postid([0-9]+)', postController.update);
app.delete('/posts/:postid([0-9]+)', postController.destroy);

http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});
