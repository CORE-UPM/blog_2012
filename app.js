
/**
Aplicacion desplegada en Heroku: http://blogguillealvaro.herokuapp.com/
*/


/**
 * Module dependencies.
 */

var express = require('express')
  , routes = require('./routes')
  , http = require('http')
  , path = require('path')
  , about = require('./routes/about')
  , partials = require('express-partials')
  , postController = require('./routes/post_controller.js')
  , userController = require('./routes/user_controller.js')
  , count = require('./modules/count');

var util = require('util');

var app = express();

app.use(partials());

app.configure(function(){
  app.set('port', process.env.PORT || 3000);
  app.set('views', __dirname + '/views');
  app.set('view engine', 'ejs');
  app.use(express.favicon());
  app.use(express.logger('dev'));
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(express.cookieParser('--Core Blog 2012--'));
  app.use(express.session());

  app.use(require('connect-flash')());
  // Hacer visible req.flash() en las vistas
  app.use(function(req, res, next) {
     res.locals.flash = function() { return req.flash() };
     next();
  });
  app.use(count.count_mw());
  app.use(app.router);
  app.use(express.static(path.join(__dirname, 'public')));
});
 
app.use(function(err, req, res, next) {

  if (util.isError(err)) {
     next(err);
  } else {
     console.log(err);
     req.flash('error', err);
     res.redirect('/');
  } 
});


if ('development' == app.get('env')) {
   app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));
} else {
   app.use(express.errorHandler());
}

// Helper estatico:
app.locals.escapeText =  function(text) {
   return String(text)
          .replace(/&(?!\w+;)/g, '&amp;')
          .replace(/</g, '&lt;')
          .replace(/>/g, '&gt;')
          .replace(/"/g, '&quot;')
          .replace(/\n/g, '<br>');
};

// -- Routes

app.get('/', routes.index);
app.get('/about', about.about);
//---------------------

app.param('postid', postController.load);

app.get('/posts.:format?', postController.index);
app.get('/posts/new', postController.new);
app.get('/posts/:postid([0-9]+).:format?', postController.show);
app.post('/posts', postController.create);
app.get('/posts/:postid([0-9]+)/edit', postController.edit);
app.put('/posts/:postid([0-9]+)', postController.update);
app.delete('/posts/:postid([0-9]+)', postController.destroy);

//---------------------

app.param('userid', userController.load);

app.get('/users', userController.index);
app.get('/users/new', userController.new);
app.get('/users/:userid([0-9]+)', userController.show);
app.post('/users', userController.create);
app.get('/users/:userid([0-9]+)/edit', userController.edit);
app.put('/users/:userid([0-9]+)', userController.update);
app.delete('/users/:userid([0-9]+)', userController.destroy);
app.get('/posts/search:busqueda?', postController.search);
//---------------------

http.createServer(app).listen(app.get('port'), function(){
  console.log("Express server listening on port " + app.get('port'));
});
