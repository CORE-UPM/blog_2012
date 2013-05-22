
/*
 * Funciones relativas a post.
 */

/*
- GET /posts -> ejecuta la función index que devuelve un listado de todos los posts existentes.
- GET /posts/new -> ejecuta la función new que devuelve un formulario para crear un nuevo post.
- GET /posts/33 -> ejecuta la función show que muestra el post con id 33.
- POST /posts -> ejecuta la función create que crea un nuevo objeto post.
- GET /posts/33/edit -> ejecuta la función edit que devuelve un formulario para editar el post con id 33.
- PUT /posts/33 -> ejecuta la función update que actualiza los campos del post con id 33.
- DELETE /posts/33 -> ejecuta la función destroy que elimina el post con id 33.
*/

var models = require('../models/models.js');

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
					res.render('posts/index', { posts: posts });
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
			console.log("Error: No puedo listar los posts.");
			res.redirect('/');
		});
};

// GET /posts/33
exports.show = function(req, res, next) {
	var format = req.params.format || 'html';
	format = format.toLowerCase();
	var id = req.params.postid;
	models.Post
		.find({where: {id:Number(id)}})
		.success(function(post) {
			switch (format) {
				case 'html':
				case 'htm':
					if (post) { res.render('posts/show', { post: post });
					} else { console.log('No existe post con id='+id+'.');
						res.redirect('/posts'); }
					break;
				case 'json':
					res.send(post);
					break;
				case 'xml':
					res.send(post_to_xml(post));
					break;
				default:
					console.log('No se soporta el formato \".'+format+'\".');
					res.send(406);
				}
		})
		.error(function(error) {
			res.redirect('/');
		});
};

// GET /posts/new
exports.new = function(req, res, next) {
	var post = models.Post.build({
		title: 'Introduzca el titulo',
		body: 'Introduzca el texto del articulo'
	});
	res.render('posts/new', {post: post});
};

// POST /posts
exports.create = function(req, res, next) {
	var post = models.Post.build({
		title: req.body.post.title,
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
			console.log("Error: No puedo crear el post:", error);
			res.render('posts/new', {post: post});
		});
};

// GET /posts/33/edit
exports.edit = function(req, res, next) {
	var id = req.params.postid;
	models.Post
		.find({where: {id: Number(id)}})
		.success(function(post) {
			if (post) {
				res.render('posts/edit', {post: post});
			} else {
				console.log('No existe ningun post con id='+id+'.');
				res.redirect('/posts');
			}
		})
		.error(function(error) {
			console.log(error);
			res.redirect('/');
		});
};

// PUT /posts/33
exports.update = function(req, res, next) {
	var id = req.params.postid;
	models.Post
		.find({where: {id: Number(id)}})
		.success(function(post) {
			if (post) {
				post.title = req.body.post.title;
				post.body = req.body.post.body;
				var validate_errors = post.validate();
				if (validate_errors) {
					console.log("Errores de validacion:", validate_errors);
					res.render('posts/edit', {post: post});
					return;
				}
				post.save(['title','body'])
					.success(function() {
						res.redirect('/posts');
					})
					.error(function(error) {
						console.log("Error: No puedo editar el post:", error);
						res.render('posts/edit', {post: post});
					});
			} else {
				console.log('No existe ningun post con id='+id+'.');
				res.redirect('/posts');
			}
		})
		.error(function(error) {
			console.log(error);
			res.redirect('/');
		});
};

// DELETE /posts/33
exports.destroy = function(req, res, next) {
	var id = req.params.postid;
	models.Post
		.find({where: {id: Number(id)}})
		.success(function(post) {
			if (post) {
				post.destroy()
					.success(function() {
						res.redirect('/posts');
					})
					.error(function(error) {
						console.log("Error: No puedo eliminar el post:", error);
						res.redirect('back');
					});
			} else {
				console.log('No existe ningun post con id='+id+'.');
				res.redirect('/posts');
			}
		})
		.error(function(error) {
			console.log(error);
			res.redirect('/');
		});
};

// GET /posts/search
// PPROVISIONAL !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
exports.search = function(req, res, next) {
	var format = req.params.format || 'html';
	var searchTerm = '%' + req.query.searchPostText.replace(' ' , '%') + '%';
	format = format.toLowerCase();
	models.Post
		.findAll({where: ["title like ? OR body like ?", searchTerm, searchTerm], order: "updatedAt DESC"})
		.success(function(posts) {
			switch (format) {
				case 'html':
				case 'htm':
					res.render('posts/search', { posts: posts });
					console.log(searchTerm);
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
			console.log("Error: No puedo encontrar posts.");
			res.redirect('/');
		});
};
