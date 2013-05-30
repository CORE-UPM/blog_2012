
//Definicion del modelo de Favourite

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('Favourite',
        {
            userId: {
                type: DataTypes.INTEGER,
                validate: {
                    notEmpty: { msg: "El campo login no puede estar vacio" }
                }
            },
            postId: {
                type: DataTypes.INTEGER,
                validate: {
                    notEmpty: { msg: "El campo nombre no puede estar vacio" }
                }
            }
        }
    );
}