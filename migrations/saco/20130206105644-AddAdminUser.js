module.exports = {
  up: function(migration, DataTypes) {
    // add altering commands here
    
    console.log('Migracion UP (0) de AddAdmin');
    console.log(__dirname);

    var sequelize = migration.queryInterface.sequelize;
     
    console.log(migration);

    var Post = sequelize.import(__dirname+'/../models/post');

Post.create({title: 'admin',
	body: 'Administrador',
	authorId: 0
})
 .success(function(post) {
    console.log('Post creado con exito');
  }).error(function(error) {
    console.log(error);
  });

    console.log('Migracion UP (9) de AddAdmin');


  },
  down: function(migration) {
    // add reverting commands here
    console.log('Migracion DOWN de AddAdmin');
  }
}