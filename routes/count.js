var count = 0;

module.exports = {
  count_mw: function(){
    return function(req, res, next){
      count++;
      console.log("Visitas: " + count);
      next();
    }
  },
  getCount: function(req, res){
    res.send(count + " personas han visitado esta pagina");
  }
};
