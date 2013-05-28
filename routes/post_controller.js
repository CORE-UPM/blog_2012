var models = require('../models/models.js');
var count = require('../public/javascripts/count.js');

// Autoload
exports.load = function(req, res, next, id) {
    models.Post
        .find({where: {id: Number(id)}})
        .success(function(post) {
            if (post) {
                req.post = post;
                next();
            }
            else {
                next('No existe el post con id=' + id + '.'); // Error
            }
        })
        .error(function(error) {
            next(error);
        });
}

// GET /posts
exports.index = function(req, res, next) {
    var format = req.params.format || 'html';
    format = format.toLowerCase();
    models.Post
        .findAll({order: 'updatedAt DESC', include: [{model:models.User, as:'Author'}]})
        .success(function(posts) {
            switch (format) {
                case 'html':
                case 'htm':
                    res.render('posts/index', {
                        posts: posts,
                        visitas: count.getCount(),
                        style: "post_index" 
                    });
                    break;
                case 'json':
                    var posts_json = posts;
                    for (var i in posts_json) {
                        delete posts_json[i].authorId;
                        if (posts_json[i].author != null) {
                            posts_json[i].author = posts_json[i].author.login;
                        }
                        else {
                            posts_json[i].author = 'Anónimo';
                        }
                    }
                    res.send(posts_json);
                    break;
                case 'xml':
                    res.send(posts_to_xml(posts));
                    break;
                default:
                    console.log("Formato \"" + format + "\" no soportado");
                    res.send(406);
            }
        })
        .error(function(error) {
            next(error);
        });
}

// GET /posts/#id
exports.show = function(req, res, next) {
    var format = req.params.format || 'html';
    format = format.toLowerCase();
    models.User
        .find({where: {id: req.post.authorId}})
        .success(function(user) {
            req.post.author = user || {};        
            //Buscar adjuntos
            req.post.getAttachments({order: 'updatedAt DESC'})
                .success(function(attachments) {
                    // Buscamos sus comentarios
                    models.Comment
                        .findAll({ where: {postId: req.post.id},
                                   order: 'updatedAt DESC',
                                   include: [{model: models.User, as: 'Author'}]
                        })
                        .success(function(comments) {
                            var new_comment = models.Comment.build({
                                body: 'Introduzca el texto del comentario'
                            });
                            switch (format) {
                                case 'html':
                                case 'htm':
                                    res.render('posts/show', {
                                        post: req.post, 
                                        comments: comments,
                                        comment: new_comment,
                                        attachments: attachments,
                                        visitas: count.getCount(), 
                                        style: "post_show" 
                                    });
                                    break;
                                case 'json':
                                    var post_json = req.post;
                                    delete post_json.authorId;
                                    if (post_json.author != null) {
                                        post_json.author = post_json.author.login;
                                    }
                                    post_json.comments = comments;
                                    post_json.attachments = attachments;
                                    res.send(post_json);
                                    break;
                                case 'xml':
                                    res.send(post_to_xml(req.post, comments));
                                    break;
                                default:
                                    console.log("Formato \"" + format + "\" no soportado");
                                    res.send(406);
                            }
                        })
                        .error(function(error) {
                            next(error);
                        });
                })
                .error(function(error) {
                    next(error);
                });
        })
        .error(function(error) {
            next(error);
        });
}

// GET /posts/new
exports.new = function(req, res, next) {
    var post = models.Post.build({
        title: 'Introduzca el título',
        body: 'Introduzca el texto del artículo'
    });
    res.render('posts/new', {post: post, visitas: count.getCount(), style: "post_new" });
}

// POST /posts
exports.create = function(req, res, next) {
    var post = models.Post.build({
        title: req.body.post.title,
        body: req.body.post.body,
        authorId: req.session.user.id
    });
    var validate_errors = post.validate();
    if (validate_errors) {
        console.log("Errores de validación: " , validate_errors);
        req.flash('error', 'Los datos del formulario son incorrectos.');
        for (var err in validate_errors) {
            req.flash('error', validate_errors[err]);
        };
        res.render('posts/new', {
            post: post, 
            visitas: count.getCount(), 
            style: "post_new",
            validate_errors: validate_errors
        });
        return;
    }
    post.save()
        .success(function() {
            res.redirect('/posts');
        })
        .error(function(error) {
            next(error);
        });
}

// GET /posts/#id/edit
exports.edit = function(req, res, next) {
    res.render('posts/edit', {
        post: req.post, 
        visitas: count.getCount(), 
        style: "post_edit" 
    });
}

// PUT /posts/#id
exports.update = function(req, res, next) {
    req.post.title = req.body.post.title;
    req.post.body = req.body.post.body;
    var validate_errors = req.post.validate();
    if (validate_errors) {
        console.log("Errores de validación: ", validate_errors);
        req.flash('error', 'Los datos del formulario son incorrectos.');
        for (var err in validate_errors) {
            req.flash('error', validate_errors[err]);
        };
        res.render('posts/edit', {
            post: req.post, 
            visitas: count.getCount(), 
            style: "post_edit",
            validate_errors: validate_errors
        });
        return;
    }
    req.post.save(['title', 'body'])
        .success(function() {
            req.flash('success', 'Post actualizado correctamente');
            res.redirect('/posts');
        })
        .error(function(error) {
            next(error);
        });
}

// DELETE /posts/#id
exports.destroy = function(req, res, next) {
    var Sequelize = require('sequelize');
    var chainer = new Sequelize.Utils.QueryChainer;
    var cloudinary = require('cloudinary');
    req.post.getComments()
        .success(function(comments) {
            for (var i in comments) {
                chainer.add(comments[i].destroy());
            }
            req.post.getAttachments()
                .success(function(attachments) {
                    for (var i in attachments) {
                        chainer.add(attachments[i].destroy()); // Eliminar adjunto
                        cloudinary.api.delete_resources(attachments[i].public_id, 
                            function(result) {}, {resource_type: 'raw'}); 
                    }
                    chainer.add(req.post.destroy());
                    chainer.run()
                        .success(function() {
                            req.flash('success', 'Post (y sus comentarios) eliminado con éxito.');
                            res.redirect('/posts');
                        })
                        .error(function(errors) { next(errors[0]); });
                })
                .error(function(error) { next(error); });
        })
        .error(function(error) { next(error); });
}

// GET /posts/search
exports.search = function(req, res, next) {
    var format = req.params.format || 'html';
    var text = req.body.find;
    text = text.replace(/[\s\t\n\r]+/gi, "%");
    text = "%" + text + "%";
    format = format.toLowerCase();
    models.Post
        .findAll({where: ["title like ? OR body like ?", text, text], 
            order: "updatedAt DESC", include: [{model:models.User, as:'Author'}]})
        .success(function(posts) {
            switch (format) {
                case 'html':
                case 'htm':
                    res.render('posts/search', {
                        posts: posts,
                        visitas: count.getCount(),
                        style: "post_search" 
                    });
                    break;
                case 'json':
                    var posts_json = posts;
                    for (var i in posts_json) {
                        delete posts_json[i].authorId;
                        if (posts_json[i].author != null) {
                            posts_json[i].author = posts_json[i].author.login;
                        }
                        else {
                            posts_json[i].author = 'Anónimo';
                        }
                    }
                    res.send(posts_json);
                    break;
                case 'xml':
                    res.send(posts_to_xml(posts));
                    break;
                default:
                    console.log("Formato \"" + format + "\" no soportado");
                    res.send(406);
            }
        })
        .error(function(error) {
            console.log("Error: No pudieron listarse los posts.");
            res.redirect('/');
        });
}

exports.loggedUserIsAuthor = function(req, res, next) {
	if (req.session.user && req.session.user.login == 'root') {
		next();
	}
	else if (req.session.user && req.session.user.id == req.post.authorId) {
		next();
	}
	else {
		console.log('Prohibida: El usuario logueado no es el autor');
		res.send(403);
	}
}

function posts_to_xml(posts) {
    var builder = require('xmlbuilder');
    var xml = builder.create('posts');
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
            .ele('author')
                .txt(posts[i].author && posts[i].author.name || 'Anónimo')
                .up()
            .ele('createdAt')
                .txt(posts[i].createdAt)
                .up()
            .ele('updatedAt')
                .txt(posts[i].updatedAt);
    }
    return xml.end({pretty: true});
}

function post_to_xml(post, comments) {
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
            .ele('author')
                .txt(post.author && post.author.name || 'Anónimo')
                .up()
            .ele('createdAt')
                .txt(post.createdAt)
                .up()
            .ele('updatedAt')
                .txt(post.updatedAt);
        return xml.end({pretty: true});
    }
    else {
        var xml = builder.create('error')
            .txt('El post no existe');
        return xml.end({pretty: true});
    }
}
