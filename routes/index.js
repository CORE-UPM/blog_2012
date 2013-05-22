
/*
 * GET home page.
 */

var c = require ('../public/javascripts/count');

exports.index = function(req, res){
  res.render('index', { title: 'Tiza: index', cont: c.getContador() });

};
