// Definición de la clase User

module.exports = function(sequelize, DataTypes) {
	return sequelize.define('User', {
		login: {
			type: DataTypes.STRING,
			validate: {
				notEmpty: { msg: "El campo login no puede estar vacío" }
			}
		},
		name: {
			type: DataTypes.STRING,
			validate: {
				notEmpty: { msg: "El campo nombre no puede estar vacío" }
			}
		},
		email: {
			type: DataTypes.TEXT,
			validate: {
				isEmail: { msg: "El formato de e-mail no es válido" },
				notEmpty: { msg: "El campo e-mail no puede estar vacío" }
			}
		},
		hashed_password: {
			type: DataTypes.STRING
		},
		salt: {
			type: DataTypes.STRING
		}
	});
}
