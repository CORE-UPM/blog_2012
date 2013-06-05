var models = require('../models/models.js');
var count = require('../public/javascripts/count.js');

//Renderiza sustituyendo en layout la parte de body por el index.ejs
exports.root = function(req, res){
	res.render('admin/index', { visitas: count.getCount(), style: "admin_index" });
};

exports.show = function(req, res, next) {
	models.Post
		.findAll({order: 'updatedAt DESC', include: [{model:models.User, as:'Author'}]})
		.success(function(posts) {
			var posts_anonimos = posts;
			for (var i in posts_anonimos) {
				if (posts_anonimos[i].author != null) {
					delete posts_anonimos[i];
				}
			}
			for (var i in posts_anonimos) {
				if (posts_anonimos[i]) {
					res.render('admin/show', {
						posts: posts_anonimos,
						visitas: count.getCount(), 
						style: "admin_show" 
					});
				}
			}
			req.flash('info', 'No hay ningún post anónimo');
			res.redirect('/admin');
		})
		.error(function(error) {
			req.flash('error', 'Error al conseguir los posts sin autor');
			res.redirect('/admin');
		});
}
