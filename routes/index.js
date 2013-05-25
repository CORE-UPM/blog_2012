
/*
 * GET home page.
 */
var count = require('../count');

exports.index = function(req, res) {
  res.render('index', { title: "BLOG", cuenta: count.getCount()});
};