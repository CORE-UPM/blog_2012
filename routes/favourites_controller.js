var models = require("../models/models.js");

// AUTOLOAD
exports.load = function(req, res, next, id) {

   models.Favourite
        .find({where: {id: Number(id)}})
        .success(function(favourite) {
            if (favourite) {
                req.favourite = favourite;
                next();
            } else {
                req.flash('error', 'No existe el favorito con id='+id+'.');
                next('No existe el favorito con id='+id+'.');
            }
        })
        .error(function(error) {
            next(error);
        });
};

// GET /users/:userid/favourites
exports.index = function(req, res, next) {

    var format = req.params.format || 'html'; 

    format = format.toLowerCase();


  // Busqueda del array de posts favoritos de un usuario
  models.Favourite.findAll({where: {userId: req.user.id}})
     .success(function(favourites) {

         // generar array con postIds de los post favoritos
         var postIds = favourites.map( 
                            function(favourite) 
                              {return favourite.postId;}
                           );

        // busca los posts identificados por array postIds
        var patch;
        if (postIds.length == 0) {
            patch= '"Posts"."id" in (NULL)';
        } else {
            patch='"Posts"."id" in ('+postIds.join(',')+')';
        } 

       // busca los posts identificados por array postIds
       models.Post.findAll({order: 'updatedAt DESC',
                    where: patch, 
                    include:[{model:models.User,as:'Author'},
                    models.Favourite ]
                 })
                 .success(function(posts) {
                    switch (format) { 
                        case 'html': 
                        case 'htm':
                            res.render('favourites/index', { posts: posts});
                            break; 
                        case 'json':
                            res.send(posts);
                            break; 
                        case 'xml':
                            res.send(posts_to_xml(posts));
                            break;
                      default:
                          console.log('No se soporta el formato \".'+format+'\".');
                          res.send(406);
                    }
                })
                .error(function(error) {
                    next(error);
                });
    });
};

// PUT  /users/:userid/favourites/:postid
exports.add = function(req, res, next) {
  var favourite = models.Favourite.build({ userId: req.session.user.id, postId: req.post.id});
  var validate_errors = favourite.validate(); 

  if (validate_errors) {
        console.log("Errores de validacion:", validate_errors);
        req.flash('error','Los datos introducidos son incorrectos.');

        for( var err in validate_errors){
          req.flash('error',validate_errors[err]);
        }

        return;
  }

  favourite.save().success(function(){
    req.flash('success','Añadido a favoritos');
    res.redirect('/posts');
  })
  .error(function(error){
    next(error);
  });
};

// DELETE  /users/:userid/favourites/:postid
exports.remove = function(req, res, next) {

    req.favourite.destroy()
        .success(function() {
            req.flash('success', 'Quitado de favoritos');
            res.redirect('/posts');
        })
        .error(function(error) {
            next(error);
        });
};