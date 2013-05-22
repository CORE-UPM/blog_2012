
/*
 * GET home page.
 */


 var express = require('express')
 , cuenta = require('./conta');

  var app = express();

exports.index = function(req, res){

  // res.send("respond with a resource");
  res.redirect('/info.html');
    // (app.get(cuenta.contador()));

  // res.render('num', { title: '20' });
};

