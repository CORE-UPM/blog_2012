var models = require('../models/models.js');
var count = require('../public/javascripts/count.js');

// GET /posts
exports.index = function(req, res, next) {
    var format = req.params.format || 'html';
    format = format.toLowerCase();
    models.Post
        .findAll({order: 'createdAt DESC'})
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
                    res.send(posts);
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
// GET /posts/#id
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
                    if (post) {
                        res.render('posts/show', {
                            post:post, 
                            visitas: count.getCount(), 
                            style: "post_show" 
                        });
                    }
                    else {
                        console.log('No existe ningun post con id=' + id + '.');
                        res.redirect('/posts');
                    }
                    break;
                case 'json':
                    res.send(posts);
                    break;
                case 'xml':
                    res.send(post_to_xml(posts));
                    break;
                default:
                    console.log("Formato \"" + format + "\" no soportado");
                    res.send(406);
            }
        })
        .error(function(error) {
            console.log(error);
            res.redirect('/');
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
        authorId: 0
    });
    var validate_errors = post.validate();
    if (validate_errors) {
        console.log("Errores de validación: " , validate_errors);
        res.render('posts/new', {post: post, visitas: count.getCount(), style: "post_new" });
        return;
    }
    post.save()
        .success(function() {
            res.redirect('/posts');
        })
        .error(function(error) {
            console.log("Error: No se pudo crear el post: ", error);
            res.render('/posts/new', {post: post, visitas: count.getCount(), style: "post_new" });
        });
}
// GET /posts/#id/edit
exports.edit = function(req, res, next) {
    var id = req.params.postid;
    models.Post
        .find({where: {id: Number(id)}})
        .success(function(post) {
            if (post) {
                res.render('posts/edit', {post: post, visitas: count.getCount(), style: "post_edit" });
            }
            else {
                console.log("No existe ningún post con id=" + id + ".");
                res.redirect('/posts');
            }
        })
        .error(function(error) {
            console.log(error);
            res.redirect('/');
        });
}
// PUT /posts/#id
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
                    console.log("Errores de validación: ", validate_errors);
                    res.render('posts/edit', {post: post, visitas: count.getCount(), style: "post_edit" });
                    return;
                }
                post.save(['title', 'body'])
                    .success(function() {
                        res.redirect('/posts');
                    })
                    .error(function(error) {
                        console.log("Error: No se pudo editar el post: ", error);
                        res.render('posts/edit', {
				post: post, 
				visitas: count.getCount(), 
				style: "post_edit"
			});
                    });
            }
            else {
                console.log('No existe ningún post con id=' + id + '.');
                res.redirect('/posts');
            }
        })
        .error(function(error) {
            console.log(error);
            res.redirect('/');
        });
}
// DELETE /posts/#id
exports.destroy = function(req, res, next) {
    var id = req.params.postid;
    console.log(id);
    models.Post
        .find({where: {id: Number(id)}})
        .success(function(post) {
            if (post) {
                post.destroy()
                    .success(function() {
                        res.redirect('/posts');
                    })
                    .error(function(error) {
                        console.log("Error: no se pudo eliminar el post ", error);
                        res.redirect('back');
                    });
            }
            else {
                console.log("No existe un post con id=" + id + ".");
                res.redirect('/posts');
            }
        })
        .error(function(error) {
            console.log(error);
            res.redirect('/');
        });
}

// GET /posts/search
exports.search = function(req, res, next) {
    var format = req.params.format || 'html';
    var text = req.body.find;
    text = text.replace(/[\s\t\n\r]+/gi, "%");
    text = "%" + text + "%";
    format = format.toLowerCase();
    models.Post
        .findAll({where: ["title like ? OR body like ?", text, text], order: "updatedAt DESC"})
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
                    res.send(posts);
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

function post_to_xml(post) {
    var builder = require('xmlbuilder');
    if (post) {
        var xml = builder.create('post')
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
        return xml.end({pretty: true});
    }
    else {
        var xml = builder.create('error')
            .txt('post ' + id + ' no existe');
        return xml.end({pretty: true});
    }
}
