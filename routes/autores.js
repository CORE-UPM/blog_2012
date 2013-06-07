/*
 * GET de la página de inicio
 */
var count = require('../public/javascripts/count.js');

//Renderiza sustituyendo en layout la parte de body por el index.ejs
exports.autores = function(req, res){
	res.render('autores', { visitas: count.getCount(), style: "autores" });
};
