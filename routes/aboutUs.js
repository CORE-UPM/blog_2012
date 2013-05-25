
/*
 * GET home page.
 */
var count = require('../count');

exports.aboutUs = function(req, res){
  res.render('aboutUs', { title: 'BLOG' , cuenta: count.getCount() });
};