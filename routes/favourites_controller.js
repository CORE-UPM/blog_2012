var models = require('../models/models.js');
var count = require('../public/javascripts/count.js');

exports.index = function(req, res, next) {
	models.Favourite.findAll({where: {userId: req.session.user.id}})
		.success(function(favourites) {
			var postIds = favourites.map(function(favourite) {
				return favourite.postId;
			});
			var patch;
			if (postIds.length == 0) {
				patch = '"Posts"."id" in (NULL)';
			}
			else {
				patch = '"Posts"."id" in ('+ postIds.join(',') + ')';
			}
			models.Post
				.findAll({where: patch, order: 'updatedAt DESC', 
					include: [{model:models.User, as:'Author'}, models.Favourite]})
				.success(function(posts) {
					res.render('posts/search', {
						posts: posts,
						visitas: count.getCount(),
						style: "post_search" 
					});
				})
				.error(function(error) {
					console.log("Error: No pudieron listarse los posts.");
					res.redirect('/');
				});
		})
		.error(function(error) {
			next(error);
		});
}

exports.change = function(req, res, next) {
	var favourite = models.Favourite.build({
		userId: req.session.user.id,
		postId: req.post.id
	});
	models.Favourite.find({where: {userId: req.session.user.id, postId: req.post.id}}) 
		.success(function(existing) {
			if (existing) {
				existing.destroy()
					.success(function() {
						req.flash('success', 'El post ha sido desmarcado de tus favoritos');
						res.redirect('back');
					})
					.error(function(error) {
						next(error);
					});
			}
			else {	
				var validate_errors = favourite.validate();
				if (validate_errors) {
					console.log("Errores de validación: ", validate_errors);
					req.flash('error', 'Este post no puede marcarse/desmarcarse como favorito.');
					for (var err in validate_errors) {
						req.flash('error', validate_errors[err]);
					};
					res.redirect('back');
				}
				favourite.save()
					.success(function() {
						req.flash('success', 'Post marcado como favorito');
						res.redirect('back');
					})
					.error(function(error) {
						next(error);
					});
			}
		})
		.error(function(error) {
			next(error);
		});
}
