// Definicion del modelo Comment:

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('Favourite',
      { userId: {
            type: DataTypes.INTEGER,
            validate: {
                notEmpty: { msg: "El cuerpo del comentario no puede estar vacío" }
            }
        },
        postId: {
            type: DataTypes.INTEGER,
            validate: {
                notEmpty: { msg: "El cuerpo del comentario no puede estar vacío" }
            }
        }
      });
}