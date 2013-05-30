// Para usar SQLite:
var path = require('path');
var Sequelize = require('sequelize');

// Usar BBDD definida en variables de entorno:
var sequelize = new Sequelize(process.env.DATABASE_NAME, 
                              process.env.DATABASE_USER, 
                              process.env.DATABASE_PASSWORD, 
			      { dialect: process.env.DATABASE_DIALECT, 
              protocol: process.env.DATABASE_PROTOCOL, 
              port: process.env.DATABASE_PORT,
			  host: process.env.DATABASE_HOST,
			  storage: process.env.DATABASE_STORAGE,
              omitNull: true});

// Importar la definicion de la clase Post desde post.js.
// Y que este modulo exporta la clase Post:


var Post = sequelize.import(path.join(__dirname,'post'));
var User = sequelize.import(path.join(__dirname, 'user'));
var Comment = sequelize.import(path.join(__dirname,'comment'));
var Attachment = sequelize.import(path.join(__dirname,'attachment'));
var Favourite = sequelize.import(path.join(__dirname,'favourite'));


User.hasMany(Post,{foreignKey: 'authorId'});
User.hasMany(Comment,{foreignKey: 'authorId'});
User.hasMany(Favourite,{foreignKey: 'userId'});
Post.hasMany(Comment, {foreignKey: 'postId'});
Post.hasMany(Favourite, {foreignKey: 'postId'});
Post.hasMany(Attachment, {foreignKey: 'postId'});
Post.belongsTo(User, {as:'Author', foreignKey: 'authorId'});
Comment.belongsTo(User, {as:'Author',foreignKey:'authorId'});
Comment.belongsTo(Post,{foreignKey: 'postId'});
Attachment.belongsTo(Post, {foreignKey: 'postId'});

exports.Post = Post;
exports.User = User;
exports.Comment = Comment;
exports.Attachment = Attachment;
exports.Favourite = Favourite;

sequelize.sync(); // No hace falta si la migracion se hace a mano