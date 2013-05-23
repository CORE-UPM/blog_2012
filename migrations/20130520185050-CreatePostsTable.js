module.exports = {
  up: function(migration, DataTypes, done) {
    // add altering commands here, calling 'done' when finished
     migration.createTable(
      'Posts', { id: { type: DataTypes.INTEGER,
                        allowNull: false,
                        primaryKey: true,
                        autoIncrement: true,
                        unique: true },
            authorId: { type: DataTypes.INTEGER,
                        allowNull: false },
               title: { type: DataTypes.STRING,
                        allowNull: false,
                        defaultValue:'Titulo del Posts' },
                body: { type: DataTypes.TEXT,
                        allowNull: false },
           createdAt: { type: DataTypes.DATE,
                        allowNull: false },
           updatedAt: { type: DataTypes.DATE,
                        allowNull: false }
      }, { sync: {force:true} })
    .complete(done);;
  },
  down: function(migration, DataTypes, done) {
    // add reverting commands here, calling 'done' when finished
     migration.dropTable('Posts')
        .complete(done);
  }
}