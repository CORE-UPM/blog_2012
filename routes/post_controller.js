
var models = require('../models/models.js');


/*
*  Auto-loading con app.param
*/
exports.load = function(req, res, next, id) {

   models.Post
        .find({where: {id: Number(id)}})
        .success(function(post) {
            if (post) {
                req.post = post;
		            next();
            } else {
                next('No existe el post con id='+id+'.');
            }
        })
        .error(function(error) {
            next(error);
        });
};


// GET /posts
exports.index = function(req, res, next) {

    var format = req.params.format || 'html';
    format = format.toLowerCase();

    models.Post
        .findAll({order: 'updatedAt DESC'})
        .success(function(posts) {
            switch (format) { 
              case 'html':
              case 'htm':
                  res.render('posts/index', {
                    posts: posts
                  });
                  break;
              case 'json':
                  res.send(posts);
                  break;
              case 'xml':
                  res.send(posts_to_xml(posts));
                  break;
              case 'txt':
                  res.send(posts.map(function(post) {
                      return post.title+' ('+post.body+')';
                  }).join('\n'));
                  break;
              default:
                  console.log('No se soporta el formato \".'+format+'\" pedido para \"'+req.url+'\".');
                  res.send(406);
            }
        })
        .error(function(error) {
            next(error);
        });
};

function posts_to_xml(posts) {

    var builder = require('xmlbuilder');
    var xml = builder.create('posts')
    for (var i in posts) {
        xml.ele('post')
              .ele('id')
                 .txt(posts[i].id)
                 .up()
              .ele('title')
                 .txt(posts[i].title)
                 .up()
              .ele('body')
                 .txt(posts[i].body)
                 .up()
              .ele('authorId')
                 .txt(posts[i].authorId)
                 .up()
              .ele('createdAt')
                 .txt(posts[i].createdAt)
                 .up()
              .ele('updatedAt')
                 .txt(posts[i].updatedAt);
    }
    return xml.end({pretty: true});
}


// GET /posts/33
exports.show = function(req, res, next) {

    var format = req.params.format || 'html';
    format = format.toLowerCase();

    switch (format) { 
      case 'html':
      case 'htm':
          res.render('posts/show', { post: req.post });
          break;
      case 'json':
          res.send(req.post);
          break;
      case 'xml':
             res.send(post_to_xml(req.post));
          break;
      case 'txt':
          res.send(req.post.title+' ('+req.post.body+')');
          break;
      default:
          console.log('No se soporta el formato \".'+format+'\" pedido para \"'+req.url+'\".');
          res.send(406);
    }
};

function post_to_xml(post) {

    var builder = require('xmlbuilder');
    if (post) {
       var xml = builder.create('post')
              .ele('id')
                 .txt(post.id)
                 .up()
              .ele('title')
                 .txt(post.title)
                 .up()
              .ele('body')
                 .txt(post.body)
                 .up()
              .ele('authorId')
                 .txt(post.authorId)
                 .up()
              .ele('createdAt')
                 .txt(post.createdAt)
                 .up()
              .ele('updatedAt')
                 .txt(post.updatedAt);
       return xml.end({pretty: true});
    } else {
       var xml = builder.create('error')
                           .txt('post no existe');
       return xml.end({pretty: true});
    }
};

// GET /posts/new
exports.new = function(req, res, next) {

    var post = models.Post.build(
        { title:  'Introduzca el titulo',
          body: 'Introduzca el texto del articulo'
        });
    
    res.render('posts/new', {post: post});
};

// POST /posts
exports.create = function(req, res, next) {

    var post = models.Post.build(
        { title: req.body.post.title,
          body: req.body.post.body,
          authorId: 0
        });
    
    var validate_errors = post.validate();
    if (validate_errors) {
        console.log("Errores de validacion:", validate_errors);
        res.render('posts/new', {post: post});
        return;
    } 
    
    post.save()
        .success(function() {
            res.redirect('/posts');
        })
        .error(function(error) {
            next(error);
        });
};

// GET /posts/33/edit
exports.edit = function(req, res, next) {

    res.render('posts/edit', {post: req.post});
};

// PUT /posts/33
exports.update = function(req, res, next) {

    req.post.title = req.body.post.title;
    req.post.body = req.body.post.body;
                
    var validate_errors = req.post.validate();
    if (validate_errors) {
        console.log("Errores de validacion:", validate_errors);
        res.render('posts/edit', {post: req.post});
        return;
    } 
    req.post.save(['title', 'body'])
        .success(function() {
            res.redirect('/posts');
        })
        .error(function(error) {
            next(error);
        });
};

// DELETE /posts/33
exports.destroy = function(req, res, next) {

    req.post.destroy()
        .success(function() {
            res.redirect('/posts');
        })
        .error(function(error) {
            next(error);
        });
};

// SEARCH 
exports.search = function(req, res, next) {
  var format = req.params.format || 'html';
  format = format.toLowerCase();

  var searchText = "%" + (req.query.search || "") + "%";
  searchText = searchText.replace(/ /g, "%");

  models.Post
    .findAll({where: ["title like ? OR body like ?", searchText, searchText], order: "updatedAt DESC"})
    .success(function(posts) {
      switch (format) { 
        case 'html':
        case 'htm':
            res.render('posts/index', {
              posts: posts
            });
            break;
        case 'json':
            res.send(posts);
            break;
        case 'xml':
            res.send(posts_to_xml(posts));
            break;
        case 'txt':
            res.send(posts.map(function(post) {
                return post.title+' ('+post.body+')';
            }).join('\n'));
            break;
        default:
            console.log('No se soporta el formato \".'+format+'\" pedido para \"'+req.url+'\".');
            res.send(406);
      }
    })
    .error(function(error) {
            next(error);
        });
};


