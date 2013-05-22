
/*
 * GET home page.
 */

exports.layout = function(req, res){
  res.render('layout', { contador: 'Hola Lamas guapo' });
};
