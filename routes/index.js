/*
 * GET home page.
 */

exports.index = function(req, res){
  res.render('index', { count: req.count });
};