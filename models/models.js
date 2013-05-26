// Modelos ORM
var path = require('path');
var Sequelize = require('sequelize');

// Para utilizar SQLite
var sequelize = new Sequelize(null, null, null, {dialect:"sqlite", storage:"blog.sqlite"});
// Importar la definicion de la clase Post desde post.js
// Y que este modulo exporta la clase Post:
Post = sequelize.import(path.join(__dirname, 'post'));
User = sequelize.import(path.join(__dirname, 'user'));

User.hasMany(Post, {foreignKey: 'authorId'});
Post.belongsTo(User, {as: 'Author', foreignKey: 'authorId'});

exports.Post = Post;
exports.User = User;

sequelize.sync(); // No hace falta si la migración se hace a mano
