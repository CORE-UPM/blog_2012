var models = require('../models/models.js');
var userController = require('./user_controller');
var count = require('../public/javascripts/count.js');

// Autoloading
exports.load = function(req, res, next, id) {
	models.Comment
		.find({where: {id: Number(id)}})
		.success(function(comment) {
			if (comment) {
				req.comment = comment;
				next();
			}
			else {
				req.flash('error', "No existe el comentario con id=" + id + ".");
				next("No existe el comentario con id=" + id + ".");
			}
		})
		.error(function(error) {
			next(error);
		});
}

exports.loggedUserIsAuthor = function(req, res, next) {
	if (req.session.user && req.session.user.login == 'root') {
		next();
	}
	if (req.session.user && req.session.user.id == req.comment.authorId) {
		next();
	}
	else {
		console.log("Operacion prohibida: El usuario no es el autor del comentario");
		res.send(403);
	}
}

exports.index = function(req, res, next) {
	models.Comment
		.findAll({
			where: {postId: req.post.id},
			order: 'updatedAt DESC',
			include: [{model:models.User, as:'Author'}]
		})
		.success(function(comments) {
			res.render('comments/index', {
				comments: comments,
				post: req.post, 
				visitas: count.getCount(), 
				style: "comments_index"
			});
		})
		.error(function(error) {
			next(error);
		});
}

exports.show = function(req, res, next) {
	models.User
		.find({where: {id: req.post.authorId}})
		.success(function(user) {
			req.post.author == user || {};
			models.User
				.find({where: {id: req.comment.authorId}})
				.success(function(user) {
					req.comment.author == user || {};
					res.render('comments/show', {
						comment: req.comment,
						post: req.post,
						visitas: count.getCount(),
						style: "comments_show"
					});
				})
				.error(function(error) { 
					next(error); 
				});
		})
		.error(function(error) { next(error); });
}

exports.new = function(req, res, next) {
	var comment = models.Comment.build({
		body: 'Introduzca el texto del comentario'
	});
	res.render('comments/new', {
		comment: req.comment,
		post: req.post,
		visitas: count.getCount(),
		style: "comments_new"
	});
}

exports.edit = function(req, res, next) {
	res.render('comments/edit', {
		comment: req.comment,
		post: req.post,
		visitas: count.getCount(),
		style: "comments_edit"
	});
}

exports.create = function(req, res, next) {
	var comment = models.Comment.build({
		body: req.body.comment.body,
		authorId: req.session.user.id,
		postId: req.post.id
	});
	var validate_errors = comment.validate();
	if (validate_errors) {
		console.log("Errores de validacion: ", validate_errors);
		req.flash('error', "Los datos del formulario son incrrectos");
		for (var err in validate_errors) {
			req.flash('error', validate_errors[err]);
		}
		res.render('comments/new', {
			comment: comment,
			post: req.post,
			validate_errors: validate_errors,
			visitas: count.getCount(),
			style: "comments_new"
		});
		return;
	}
	comment.save()
		.success(function() {
			req.flash('success', 'Comentario creado con éxito');
			res.redirect('/posts/' + req.post.id);
		})
		.error(function(error) { next(error); });
}

exports.update = function(req, res, next) {
	req.comment.body = req.body.comment.body;
	var validate_errors =req.comment.validate();
	if (validate_errors) {
		console.log("Errores de validacion: ", validate_errors);
		req.flash('error', "Los datos del formulario son incrrectos");
		for (var err in validate_errors) {
			req.flash('error', validate_errors[err]);
		}
		res.render('comments/new', {
			comment: req.comment,
			post: req.post,
			validate_errors: validate_errors,
			visitas: count.getCount(),
			style: "comments_new"
		});
		return;
	}
	req.comment.save(['body'])
		.success(function() {
			req.flash('success', 'Comentario actualizado con éxito');
			res.redirect('/posts/' + req.post.id);
		})
		.error(function(error) { next(error); });
}

exports.destroy = function(req, res, next) {
	req.comment.destroy()
		.success(function() {
			req.flash('success', 'Comentario eliminado con éxito');
			res.redirect('/posts/' + req.post.id);
		})
		.error(function(error) { next(error); });
}


