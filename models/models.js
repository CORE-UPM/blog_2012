// Modelos ORM
var path = require('path');
var Sequelize = require('sequelize');

// Para utilizar SQLite y Postgress
var sequelize = new Sequelize(
	process.env.DATABASE_NAME,
	process.env.DATABASE_USER,
	process.env.DATABASE_PASSWORD,
	{
		dialect: process.env.DATABASE_DIALECT,
		protocol: process.env.DATABASE_PROTOCOL,
		port: process.env.DATABASE_PORT,
		host: process.env.DATABASE_HOST,
		storage: process.env.DATABASE_STORAGE,
		omitNull: true
	}
);
// Importar la definicion de la clase Post desde post.js
// Y que este modulo exporta la clase Post:
Post = sequelize.import(path.join(__dirname, 'post'));
User = sequelize.import(path.join(__dirname, 'user'));

User.hasMany(Post, {foreignKey: 'authorId'});
Post.belongsTo(User, {as: 'Author', foreignKey: 'authorId'});

exports.Post = Post;
exports.User = User;

sequelize.sync(); // No hace falta si la migración se hace a mano
