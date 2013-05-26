var count = require('../public/javascripts/count.js');

//Renderiza sustituyendo en layout la parte de body por el index.ejs
exports.root = function(req, res){
	res.render('admin', { visitas: count.getCount(), style: "admin" });
};
