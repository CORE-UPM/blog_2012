var count = 0;

exports.getCount = function(req, res, next){
  if(req.url == '/'){
    count++;

    req.number = count;
    console.log(req.number);
  }

  next();
};
