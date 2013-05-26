var models = require('../../models/models.js');
var crypto = require('crypto');
var startup = true;

exports.configRoot = function(req, res, next) {
	if (startup) {
		models.User.find({where: {login: 'root'}})
	       		.success(function(existing_user) {
				if (!existing_user) {
					var user = models.User.build({
						login: 'root',
						name: 'Administrador',
						email: 'root@admin.com'
					});
					user.salt = crearSalt();
					user.hashed_password = encriptarPassword(process.env.ADMIN_PASSWORD, user.salt);
					user.save()
						.success(function() {
							startup = false;
							next();
						})
						.error(function(error) {
							startup = false;
							next(error);
						});
				}
				else {
					startup = false;
					next();
				}

			})
			.error(function(error) {
				next(error);
			});
	}
	else {
		next();
	}
}

function crearSalt() {
	return Math.round((new Date().valueOf() * Math.random())) + '';
}

function encriptarPassword(password, salt) {
	return crypto.createHmac('sha1', salt).update(password).digest('hex');
}
