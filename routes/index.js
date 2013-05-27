
/*
 * GET home page.
 */

exports.index = function(req, res){
  res.render('index', { title: 'Express' , visitas: req.count});
  //count.getCount()
  //visitas: "visitas"
};