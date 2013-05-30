var models = require('../models/models.js');


// Auto-loading con app.param
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

// GET /users/25/favourites
exports.index = function(req, res, next) {

    var format = req.params.format || 'html';
    format = format.toLowerCase();

    // Busqueda del array de posts favoritos de un usuario
    models.Favourite.findAll({where: {userId: req.session.user.id}})
    .success(function(favourites) {

        // generar array con postIds de los post favoritos
        var postIds = favourites.map( 
            function(favourite){
                return favourite.postId;
            });

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
            models.Favourite,models.Comment ]
        })
        .success(function(posts) {
        // console.log(posts);
            switch (format) { 
                case 'html':
                case 'htm':
                    res.render('favourites/index', {
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
        });
    });
}

// PUT /users/2/post/5
exports.create = function(req, res, next) {

    var favourite = models.Favourite.build(
        { userId: req.user.id,
          postId: req.post.id
        });

    favourite.save()
        .success(function() {
            res.redirect('back');
        })
        .error(function(error) {
            next(error);
        });
}

// DELETE /users/2/post/5
exports.destroy = function(req, res, next) {

    models.Favourite
        .find({where: {userId: req.session.user.id, postId: req.post.id}})
        .success(function(favourite) {

            favourite.destroy()
                .success(function() {
                    res.redirect('back');
                })
                .error(function(error) {
                    next(error);
                });
        });
}