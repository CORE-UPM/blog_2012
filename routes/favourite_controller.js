
var models = require('../models/models.js');

var userController = require('./user_controller');

/*
*  Auto-loading con app.param
*/
exports.load = function(req, res, next, id) {

   models.Favourite
        .find({where: {id: Number(id)}})
        .success(function(favourite) {
            if (favourite) {
                req.favourite = favourite;
                next();
            } else {
                req.flash('error', 'No existe favorito con id='+id+'.');
                next('No existe el favorito con id='+id+'.');
            }
        })
        .error(function(error) {
            next(error);
        });
};


/*
* Comprueba que el usuario logeado es el author.
*/
exports.loggedUserIsAuthor = function(req, res, next) {
    
    if (req.session.user && req.session.user.id == req.favourite.authorId) {
        next();
    } else {
        console.log('Operación prohibida: El usuario logeado no es el autor del favorito.');
        res.send(403);
    }
};

//-----------------------------------------------------------



exports.index = function(req, res, next) {

    models.Favourite
        .findAll({where: {authorId: req.user.id},
                  order: 'updatedAt DESC'})  
        .success(function(favourites) {
            
             var postIds = favourites.map( 
                            function(favourite) 
                              {return favourite.postId;}
                           );
             var patch;
            if (postIds.length == 0) {
                    patch= '"Posts"."id" in (NULL)';
            } else {
                patch='"Posts"."id" in ('+postIds.join(',')+')';
            } 
            models.Post.findAll({order: 'updatedAt DESC',
                   where: patch, 
                    include: [{ model: models.Comment, as: 'Coms'},
                    { model: models.User, as: 'Author'},
                    { model: models.Favourite, as: 'Fav'}
                    ]})
            .success(function(posts) {    


            res.render('favourites/index', {
                posts: posts
            });
        })
            .error(function(error) {
            next(error);
        });
        })
        .error(function(error) {
            next(error);
        });
};


exports.create = function(req, res, next) {

    var favourite = models.Favourite.build(
        { 
          authorId: req.session.user.id,
          postId: req.post.id
        });
    
    var validate_errors = favourite.validate();
    if (validate_errors) {
        console.log("Errores de validación:", validate_errors);

        req.flash('error', 'Los datos del favorito son incorrectos.');
        for (var err in validate_errors) {
            req.flash('error', validate_errors[err]);
        };

        res.render('/', { validate_errors: validate_errors});
        return;
    } 
    
    favourite.save()
        .success(function() {
            req.flash('success', 'Favorito guardado.');
            res.redirect('/users/' + req.session.user.id +'/favourites');
        })
        .error(function(error) {
            next(error);
        });
};




// DELETE /posts/33/comments/66
exports.destroy = function(req, res, next) {

    req.favourite.destroy()
        .success(function() {
            req.flash('success', 'Favorito eliminado con éxito.');
            res.redirect('/users/' + req.session.user.id +'/favourites');
        })
        .error(function(error) {
            next(error);
        });
};
