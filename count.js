//var express = require('express');
//var app = express();

exports.count_mw = function(){
		var count=0;
		return function(req, res, next){
			count++;
			console.log("Visitas: " + count);
			res.locals.visitors = count;
			next();
		}
};