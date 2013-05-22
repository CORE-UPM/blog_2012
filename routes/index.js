var count=require('./count');

/*
 * GET home page.
 */

exports.index = function(req, res){
  res.render('index', { title: 'Express',visitas: count.getCount()});
};