/*
 * GET de la página de inicio
 */
var count = require('../public/javascripts/count.js');

//Renderiza sustituyendo en layout la parte de body por el index.ejs
exports.index = function(req, res){
	res.render('index', { visitas: count.getCount(), style: "index" });
};
