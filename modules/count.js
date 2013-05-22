var cont = 0;

var url = require('url');
var util = require('util');




exports.getCount=function(){
	return cont;
}
exports.count_mw = function(){
	return function(req,res,next){
		console.log('query: ' + req.originalUrl);
		if(req.originalUrl == '/stylesheets/style.css'){
			++cont;
			console.log('Visitas: ' + cont);
		}
		next();
	}
};