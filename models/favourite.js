
// Definicion del modelo Comment:

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('Favourite',
      { authorId: {
            type: DataTypes.INTEGER,
            validate: {
                notEmpty: { msg: "El campo authorId no puede estar vacío" }
            }
        },
        postId: {
            type: DataTypes.INTEGER,
            validate: {
                notEmpty: { msg: "El campo postId no puede estar vacío" }
            }
        }
        
      });
}
