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
            next(error);
        });
}

// GET /posts/#id
exports.show = function(req, res, next) {
    var format = req.params.format || 'html';
    format = format.toLowerCase();
    switch (format) {
        case 'html':
        case 'htm':
            res.render('posts/show', {
                post: req.post, 
                visitas: count.getCount(), 
                style: "post_show" 
            });
            break;
        case 'json':
            res.send(req.post);
            break;
        case 'xml':
            res.send(post_to_xml(req.post));
            break;
        default:
            console.log("Formato \"" + format + "\" no soportado");
            res.send(406);
    }
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
    var validate_errors = post.validate();
    if (validate_errors) {
        console.log("Errores de validación: ", validate_errors);
        res.render('posts/edit', {
            post: req.post, 
            visitas: count.getCount(), 
            style: "post_edit" 
        });
        return;
    }
    req.post.save(['title', 'body'])
        .success(function() {
            res.redirect('/posts');
        })
        .error(function(error) {
            next(error);
        });
}

// DELETE /posts/#id
exports.destroy = function(req, res, next) {
    req.post.destroy()
        .success(function() {
            res.redirect('/posts');
        })
        .error(function(error) {
            next(error);
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
                    res.render('posts/search', {
                        posts: posts,
                        visitas: count.getCount(),
                        style: "post_search" 
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
    }
    else {
        var xml = builder.create('error')
            .txt('El post no existe');
        return xml.end({pretty: true});
    }
}
