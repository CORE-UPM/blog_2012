
/*
 * GET home page.
 */
 var count = require('../modules/count');

 exports.about = function(req, res){
 	res.render('about', { visitas: count.getCount() + 1});
 };