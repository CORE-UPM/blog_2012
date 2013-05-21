
/*
 * GET home page.
 */
var count= count = require('../count');

exports.index = function(req, res){
  res.render('index', { title: 'Express' ,visits: count.getCount()});
};
