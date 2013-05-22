
/*
 * GET home page.
 */
var count = require('../modules/count');
exports.index = function(req, res){
  res.render('index', { visitas: count.getCount() + 1 });
};