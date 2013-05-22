var visitas = require('./count');
/*
 * GET home page.
 */

exports.index = function(req, res){
   
  res.render('index', { title: 'Express', visitas:visitas.getCount()});
    
};