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
        .findAll({order: 'name'})
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
                    res.send(users);
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
            res.render('users/show', {
                user: req.user, 
                visitas: count.getCount(), 
                style: "user_show" 
            });
            break;
        case 'json':
            res.send(req.user);
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
                if (validate_errors) {
                    req.flash('error', 'Los datos del formulario son incorrectos');
                    for (var err in validate_errors) {
                        req.flash('error', validate_errors[err]);
                    };
                    res.render('users/new', {
                        user: user, 
                        visitas: count.getCount(), 
                        style: "user_new",
                        validate_errors:  validate_errors
                    });
                    return;
                }
                // El password no puede estar vacío
                if (!req.body.user.password) {
                    req.flash('error', 'Es obligatorio escribir una contraseña');
                    res.render('users/new', {
                        user: user, 
                        visitas: count.getCount(), 
                        style: "user_new"
                    });
                    return;
                }
                else if (req.body.user.password != req.body.user.confirm_password) {
                    req.flash('error', 'Las contraseñas tienen que coincidir');
                    res.render('users/new', {
                        user: user, 
                        visitas: count.getCount(), 
                        style: "user_new"
                    });
                    return;
                }
                user.salt = crearSalt();
                user.hashed_password = encriptarPassword(req.body.user.password, user.salt);
                user.save() 
                    .success(function() {
                        req.flash('success', 'Usuario creado con éxito.');
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
    if (validate_errors) {
        console.log("Errores de validacion:", validate_errors);
        req.flash('error', 'Los datos del formulario son incorrectos.');
        for (var err in validate_errors) {
            req.flash('error', validate_error[err]);
        };
        res.render('users/edit', {
            user: req.user, 
            visitas: count.getCount(), 
            style: "user_edit",
            validate_errors:  validate_errors
        });
        return;
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
    req.user.destroy()
        .success(function() {
            req.flash('success', 'Usuario eliminado con éxito.');
            res.redirect('/users');
        })
        .error(function(error) {
            next(error);
        });
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
