
/*
 * GET home page.
 */
counter = require('./counter');
exports.index = function(req, res){
  res.render('index', { title: 'Blog SWCM', contador: counter.getCount()}); 	//renderiza index con la etiqueta title = 'Express', usa el motor EJS con la plantilla layout.ejs y index.ejs en el body
  //res.redirect('/index.html');	// Las peticiones a / las redirigimos a index.ejs

};
