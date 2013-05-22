
/*
 * GET home page.
 */
var count = require('../public/javascripts/count');

exports.index = function(req, res){
  res.render('index', {counter: count.contador()});
};