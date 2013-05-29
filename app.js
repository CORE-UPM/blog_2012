
/**
 * Module dependencies.
 */

var express = require('express')
  , routes = require('./routes')
  , http = require('http')
  , path = require('path');

var partials = require('express-partials');
var postController = require('./routes/post_controller.js');
var userController = require('./routes/user_controller.js');
var commentController = require('./routes/comment_controller.js');
var sessionController = require('./routes/session_controller.js');
var attachmentController = require('./routes/attachment_controller.js');
var count = require('./count');

var app = express();

var util = require('util');

//all enviroments
app.use(partials());

// development only
if ('development' == app.get('env')) {
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


app.configure(function(){
  app.use(count.count_mw());
  app.set('port', process.env.PORT || 3000);
  app.set('views', __dirname + '/views');
  app.set('view engine', 'ejs');
  app.use(express.favicon());
  app.use(express.logger('dev'));
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(express.cookieParser('your secret here'));
  //app.use(express.session({cookie: { maxAge: 3000 }}));
  app.use(express.session());
  app.use(require('connect-flash')());

  // Helper dinamico:
  app.use(function(req, res, next) {

     // Hacer visible req.flash() en las vistas
     res.locals.flash = function() { return req.flash() };

     // Hacer visible req.session en las vistas
     res.locals.session = req.session;

     next();
  });



  app.use(app.router);
  app.use(express.static(path.join(__dirname, 'public')));
 app.use(function(err, req, res, next) {
  if (util.isError(err)) {
      next(err);
  } else {
      console.log(err);
      req.flash('error',err);
      res.redirect('/');
  } });
});

// Auto-Loading:

app.param('postid', postController.load);
app.param('userid', userController.load);
app.param('commentid', commentController.load);
app.param('attachmentid', attachmentController.load);

//---------------------

// Routes

app.get('/login', sessionController.new); 
app.post('/login', sessionController.create); 
app.get('/logout', sessionController.destroy);

//Rutas de los usuarios.


app.get('/users', userController.index);
app.get('/users/new', userController.new);
app.get('/users/:userid([0-9]+)', userController.show);
app.post('/users', userController.create);
app.get('/users/:userid([0-9]+)/edit', sessionController.requiresLogin, sessionController.isExpired,userController.loggedUserIsUser,userController.edit);
app.put('/users/:userid([0-9]+)', sessionController.requiresLogin, sessionController.isExpired, userController.loggedUserIsUser, userController.update);
//app.delete('/users/:userid([0-9]+)', sessionController.requiresLogin, userController.destroy);


// Comentarios

app.get('/posts/:postid([0-9]+)/comments', commentController.index);
app.get('/posts/:postid([0-9]+)/comments/new', sessionController.requiresLogin, sessionController.isExpired,commentController.new);
app.get('/posts/:postid([0-9]+)/comments/:commentid([0-9]+)',commentController.show);
app.post('/posts/:postid([0-9]+)/comments', sessionController.requiresLogin,sessionController.isExpired,commentController.create);
app.get('/posts/:postid([0-9]+)/comments/:commentid([0-9]+)/edit', sessionController.requiresLogin, sessionController.isExpired, commentController.loggedUserIsAuthor, commentController.edit);
app.put('/posts/:postid([0-9]+)/comments/:commentid([0-9]+)', sessionController.requiresLogin, sessionController.isExpired,commentController.loggedUserIsAuthor, commentController.update);
app.delete('/posts/:postid([0-9]+)/comments/:commentid([0-9]+)', sessionController.requiresLogin, sessionController.isExpired, commentController.loggedUserIsAuthor, commentController.destroy);


// Attachment

app.get('/posts/:postid([0-9]+)/attachments', 
  attachmentController.index);

app.get('/posts/:postid([0-9]+)/attachments/new', 
  sessionController.requiresLogin,
  postController.loggedUserIsAuthor,
  attachmentController.new);

app.post('/posts/:postid([0-9]+)/attachments', 
   sessionController.requiresLogin,
   postController.loggedUserIsAuthor,
   attachmentController.create);

app.delete('/posts/:postid([0-9]+)/attachments/:attachmentid([0-9]+)', 
     sessionController.requiresLogin,
     postController.loggedUserIsAuthor,
     attachmentController.destroy);

app.get('/raws', 
  attachmentController.raws);

//

app.get('/', routes.index);
app.get('/index.html', routes.index);

app.get('/posts.:format?', postController.index);
app.get('/posts/new', sessionController.requiresLogin,sessionController.isExpired,postController.new);
app.get('/posts/:postid([0-9]+).:format?',postController.show);
app.get('/posts/search',postController.search);
app.post('/posts',sessionController.requiresLogin,sessionController.isExpired, postController.create);
app.get('/posts/:postid([0-9]+)/edit',sessionController.requiresLogin,sessionController.isExpired, postController.loggedUserIsAuthor,postController.edit);
app.put('/posts/:postid([0-9]+)',sessionController.requiresLogin, sessionController.isExpired,postController.loggedUserIsAuthor,postController.update);
app.delete('/posts/:postid([0-9]+)',sessionController.requiresLogin, sessionController.isExpired, postController.loggedUserIsAuthor, postController.destroy);


http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});
