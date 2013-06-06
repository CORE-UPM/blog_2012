var models = require('../models/models.js');
var count = require('../public/javascripts/count.js');
var crypto = require('crypto');

// Autoload
exports.load = function(req, res, next, id) {
    models.User
        .find({where: {id: Number(id)}})
        .success(function(user) {
            if (user) {
                req.user = user;
                next();
            }
            else {
                req.flash('error', 'No existe el usuario con id=' + id + '.');
                next('No existe el usuario con id=' + id + '.');
            }
        })
        .error(function(error) {
            next(error);
        });
};

// GET /users
exports.index = function(req, res, next) {
    var format = req.params.format || 'html';
    format = format.toLowerCase();
    models.User
        .findAll({offset: req.pagination.offset,
                  limit: req.pagination.limit,
                  order: 'name'})
        .success(function(users) {
            switch (format) {
                case 'html':
                case 'htm':
                    res.render('users/index', {
                        users: users,
                        visitas: count.getCount(),
                        style: "user_index" 
                    });
                    break;
                case 'json':
                    var users_json = users;
                    for (var i in users_json) {
                       delete users_json[i].hashed_password;
                       delete users_json[i].salt;
                    }
                    res.send(users_json);
                    break;
                case 'xml':
                    res.send(users_to_xml(users));
                    break;
                default:
                    console.log("Formato \"" + format + "\" no soportado");
                    res.send(406);
            }
        })
        .error(function(error) {
            next(error);
        }); 
};

// GET /users/#id
exports.show = function(req, res, next) {
    var format = req.params.format || 'html';
    format = format.toLowerCase();
    switch (format) {
        case 'html':
        case 'htm':
            models.Attachment.find({where: {id: req.user.photo}})
                .success(function (photo) {
                    var attachment;
                    if (photo) {
                        attachment = photo;
                    }
                    else {
                        attachment = 'sin foto';
			if (req.user.photo == -2) {
				attachment = 'root';
			}
                    }
                    res.render('users/show', {
                        user: req.user, 
                        visitas: count.getCount(), 
                        attachment: attachment,
                        style: "user_show" 
                    });
                })
                .error(function (error) {
                    next(error);
                });
            break;
        case 'json':
            var user_json = req.user;
            delete user_json.hashed_password;
            delete user_json.salt;
            res.send(user_json);
            break;
        case 'xml':
            res.send(user_to_xml(req.user));
            break;
        default:
            console.log("Formato \"" + format + "\" no soportado");
            res.send(406);
    }
}

// GET /users/new
exports.new = function(req, res, next) {
    var user = models.User.build({
        login: 'Login (identificador)',
        name: 'Tu nombre',
        email: 'Tu direccion e-mail'     
    });
    res.render('users/new', {user: user, visitas: count.getCount(), style: "user_new" });
}

//GET /users/#id/edit
exports.edit = function(req, res, next) {
    res.render('users/edit', {
        user: req.user, 
        visitas: count.getCount(), 
        style: "user_edit" 
    });
}

// POST /users
exports.create = function(req, res, next) {
    var user = models.User.build({
        login: req.body.user.login,
        name: req.body.user.name,
        email: req.body.user.email
    });
    //El login debe ser único
    models.User.find({where: {login: req.body.user.login}}) // NO se usa "built" se busca en la BD
        .success(function(existing_user) {
            if (existing_user) {
                req.flash('error', "Error: El usuario \"" + req.body.user.login + "\" ya existe.");
                res.render('users/new', {
                    user: user, 
                    visitas: count.getCount(), 
                    style: "user_new",
                    validate_errors:  {login: "El usuario \"" + req.body.user.login + "\" ya existe."}
                });
                return;
            }
            else {
                var validate_errors = user.validate();
                if (validate_errors || !req.body.user.password || 
                    req.body.user.password != req.body.user.confirm_password) {
			if (validate_errors) {
                            req.flash('error', 'Los datos del formulario son incorrectos');
                            for (var err in validate_errors) {
                                req.flash('error', validate_errors[err]);
                            };
                        }
                        var password = "";
                        if (!req.body.user.password) {
                            if (!validate_errors) {
                                req.flash('error', 'Los datos del formulario son incorrectos');
                            }
                            req.flash('error', 'Es obligatorio escribir una contraseña');
                            password = "empty";
                        }
                        else if (req.body.user.password != req.body.user.confirm_password) {
                            if (!validate_errors) {
                                req.flash('error', 'Los datos del formulario son incorrectos');
                            }
                            req.flash('error', 'Las contraseñas tienen que coincidir');
                            password = "mismatch";
                        }
                        res.render('users/new', {
                            user: user, 
                            visitas: count.getCount(), 
                            style: "user_new",
                            validate_errors:  validate_errors,
                            password: password
                        });
                        return;
                }
                user.salt = crearSalt();
                user.hashed_password = encriptarPassword(req.body.user.password, user.salt);
		user.photo = -1;
                user.save() 
                    .success(function() {
                        req.flash('success', 'Usuario creado con éxito.');
			req.session.user = {id:user.id, login:user.login, name:user.name};
                        res.redirect('/users');
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

// PUT users/#id
exports.update = function(req, res, next) {
    //req.user.login = req.body.user.login; El login no cambia
    req.user.name = req.body.user.name;
    req.user.email = req.body.user.email;
    var validate_errors = req.user.validate();
    if (validate_errors || req.body.user.password) {
	if (validate_errors) {
	        console.log("Errores de validacion:", validate_errors);
        	req.flash('error', 'Los datos del formulario son incorrectos.');
        	for (var err in validate_errors) {
        	    req.flash('error', validate_errors[err]);
        	};
	}
        var password = "";
        if (req.body.user.password) {
            var old_password = req.body.user.old_password || '';
            var new_password = req.body.user.password;
            var confirm_password = req.body.user.confirm_password || '';
            old_password = encriptarPassword(old_password, req.user.salt);
            if (old_password == '') {
                req.flash('error', 'Tienes que escribir tu contraseña actual');
                password = "old";
            }
	    else if (old_password == req.user.hashed_password) {
                if (new_password != confirm_password) {
                    req.flash('error', 'Las contraseñas no coinciden');
                    password = "mismatch";
                }
            }
            else {
                req.flash('error', 'Contraseña incorrecta');
                password = "old";
            }
        }
        if (validate_errors || password != "") {
            res.render('users/edit', {
                user: req.user, 
                visitas: count.getCount(), 
                style: "user_edit",
                validate_errors:  validate_errors,
                password: password
            });
            return;
        }
    }
    var fields_to_update = ['name', 'email'];
    if (req.body.user.password) {
        console.log('Actualizando password');
        req.user.salt = crearSalt();
        req.user.hashed_password = encriptarPassword(req.body.user.password, req.user.salt);
        fields_to_update.push('salt');
        fields_to_update.push('hashed_password');
    }
    req.user.save(fields_to_update) //Se guardan solo los cambios especificados
        .success(function() {
            req.flash('success', 'Usuario actualizado con éxito.');  
            res.locals.session.user = req.user; 
            res.redirect('/users');
        })
        .error(function(error) {
            next(error);
        });
}

// DELETE /users/#id
exports.destroy = function(req, res, next) {
    var Sequelize = require('sequelize');
    var chainer = new Sequelize.Utils.QueryChainer;
    req.user.getFavourites()
        .success(function(favourites) {
            for (var i in favourites) {
                chainer.add(favourites[i].destroy()); // Eliminar favorito
            }
            chainer.add(req.user.destroy());
            chainer.run()
                .success(function() {})
                .error(function(errors) { next(errors[0]); });
            models.Attachment.find({where: {id: req.user.photo}})
                .success(function (photo) {
                    if (photo) {
                        photo.destroy();
                    }
                    req.flash('success', 'Usuario eliminado con éxito.');
                    res.redirect('/users');
                })
                .error(function(error) {
                    next(error);
                });
        })
        .error(function(error) { next(error); });
}

// Generador de contraseña
exports.autenticar = function(login, password, callback) {
    models.User.find({where: {login: login}})
        .success(function(user) {
            if (user) {
                if (user.hashed_password == "" && password == "") {
                    callback(null, user);
                    return;
                }
                var hash = encriptarPassword(password, user.salt);
                if (hash == user.hashed_password) {
                    callback(null, user);
                }
                else {
                    callback('Contraseña errónea');
                }
            }
            else {
                callback('Nombre de usuario incorrecto');
            }
        })
        .error(function(err) {
            callback(err);
        });
}

exports.loggedUserIsUser = function(req, res, next) {
	if (req.session.user && req.session.user.login == 'root') {
		next();
	}
	else if (req.session.user && req.session.user.id == req.user.id) {
		next();
	}
	else {
		console.log("Ruta prohibida: no soy el usuario logueado");
		res.send(403);
	}
}

exports.loggedUserIsRoot = function(req, res, next) {
	if (req.session.user && req.session.user.login == 'root') {
		next();
	}
	else {
		console.log("Ruta prohibida: se necesitan privilegios de administrador");
		res.send(403);
	}
}

function encriptarPassword(password, salt) {
	return crypto.createHmac('sha1', salt).update(password).digest('hex');
}

function crearSalt() {
	return Math.round((new Date().valueOf() * Math.random())) + '';
}

function users_to_xml(users) {
    var builder = require('xmlbuilder');
    var xml = builder.create('users');
    for (var i in users) {
        xml.ele('user')
            .ele('login')
                .txt(users[i].login)
                .up()
            .ele('name')
                .txt(users[i].name)
                .up()
            .ele('email')
                .txt(users[i].email)
                .up()
            .ele('createdAt')
                .txt(users[i].createdAt)
                .up()
            .ele('updatedAt')
                .txt(users[i].updatedAt);
    }
    return xml.end({pretty: true});
}

function user_to_xml(user) {
    var builder = require('xmlbuilder');
    if (user) {
        var xml = builder.create('user')
            .ele('login')
                .txt(user.login)
                .up()
            .ele('name')
                .txt(user.name)
                .up()
            .ele('email')
                .txt(user.email)
                .up()
            .ele('createdAt')
                .txt(user.createdAt)
                .up()
            .ele('updatedAt')
                .txt(user.updatedAt);
        return xml.end({pretty: true});
    }
    else {
        var xml = builder.create('error')
            .txt('El usuario no existe');
        return xml.end({pretty: true});
    }
}
