var current = 0;
exports.count = function(req,res,next){
	current ++;
	next();

}
exports.getCount = function(){
	return current;
}