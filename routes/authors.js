var visitas = require('./count');

exports.authors = function(req, res){
   
  res.render('authors', { title: 'Acerca de', visitas:visitas.getCount()});

};