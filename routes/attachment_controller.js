var models = require('../models/models.js');
var count = require('../public/javascripts/count.js');
var fs = require('fs');
var path = require('path');

// Autoload
exports.load = function(req, res, next, id) {
    models.Attachment
        .find({where: {id: Number(id)}})
        .success(function(attachment) {
            if (attachment) {
                req.attachment = attachment;
                next();
            }
            else {
                flash('error', 'No existe ningún adjunto con id=' + id + '.'); // Error
                next('No existe ningún adjunto con id=' + id + '.'); // Error
            }
        })
        .error(function(error) {
            next(error);
        });
}

exports.index = function(req, res, next) {
	models.Attachment
		.findAll({where: {postId: req.post.id}, order: 'updatedAt DESC'})
		.success(function(attachments) {
			res.render('attachments/index', {
				attachments: attachments,
				post: req.post,
				visitas: count.getCount(),
				style: "attachment_index" 
			});
		})
		.error(function(error) {
		        next(error);
        	});
}

exports.new = function(req, res, next) {
	res.render('attachments/new', {
		post: req.post,
		visitas: count.getCount(),
		style: "attachment_new" 
	});
}


exports.newPhoto = function(req, res, next) {
	res.render('attachments/newPhoto', {
		user: req.user,
		visitas: count.getCount(),
		style: "attachment_new" 
	});
}

exports.create = function(req, res, next) {
	var upfile = req.files.adjunto;
	var cloudinary = require('cloudinary');
	if (!upfile || upfile.size==0) {
		req.flash('error', 'El adjunto no existe o está vacío');
		res.redirect('/posts/' + req.post.id);
		return;
	}
	var max_adj_size_in_KB = 500;
	if (upfile.size > max_adj_size_in_KB*1024) {
		req.flash('error', 'Tamaño máximo permitido de ' + max_adj_size_in_KB + 'KB.');
		res.redirect('/posts/' + req.post.id);
		return;
	}
	var out_stream = cloudinary.uploader.upload_stream(function(result) {
		fs.unlink(upfile.path); //borrar fichero subido
		if (!result.error) {
			var attachment = models.Attachment.build({
				public_id: result.public_id,
				url: result.url,
				filename: upfile.name,
				mime: upfile.type,
				postId: req.post.id
			});
			attachment.save()
				.success(function() {
					req.flash('success', 'Adjunto subido con éxito');
					res.redirect('/posts/' + req.post.id);
				})
				.error(function(error) {
					next(error);
				});
		}
		else {
			req.flash('error', result.error.message);
			res.redirect('/posts/', req.post.id);
		}
	}, {resource_type: 'raw', format: path.extname(upfile.name).replace('.', '')});
	fs.createReadStream(req.files.adjunto.path, {encoding: 'binary'})
		.on('data', function(data) {out_stream.write(data);})
		.on('end', function() {out_stream.end();})
		.on('error', function(error) {out_stream.error();});
}

exports.profile = function(req, res, next) {
	var upfile = req.files.adjunto;
	var cloudinary = require('cloudinary');
	if (!upfile || upfile.size==0) {
		req.flash('error', 'El adjunto no existe o está vacío');
		res.redirect('/users/' + req.user.id);
		return;
	}
	var max_adj_size_in_KB = 50;
	if (upfile.size > max_adj_size_in_KB*1024) {
		req.flash('error', 'Tamaño máximo permitido de ' + max_adj_size_in_KB + 'KB.');
		res.redirect('/users/' + req.user.id);
		return;
	}
	var out_stream = cloudinary.uploader.upload_stream(function(result) {
		fs.unlink(upfile.path); //borrar fichero subido
		if (!result.error) {
			var attachment = models.Attachment.build({
				public_id: result.public_id,
				url: result.url,
				filename: upfile.name,
				mime: upfile.type,
			});
			attachment.save()
				.success(function() {
					req.user.photo = attachment.id;
					req.user.save(['photo'])
						.success(function() {
							req.flash('success', 'Adjunto subido con éxito');
							res.redirect('/users/' + req.user.id);
						})
						.error(function(error) {
							next(error);
						});
				})
				.error(function(error) {
					next(error);
				});
		}
		else {
			req.flash('error', result.error.message);
			res.redirect('/users/', req.user.id);
		}
	}, {resource_type: 'raw', format: path.extname(upfile.name).replace('.', '')});
	fs.createReadStream(req.files.adjunto.path, {encoding: 'binary'})
		.on('data', function(data) {out_stream.write(data);})
		.on('end', function() {out_stream.end();})
		.on('error', function(error) {out_stream.error();});
}

exports.destroy = function(req, res, next) {
	var cloudinary = require('cloudinary');
	cloudinary.api.delete_resources(req.attachment.public_id, 
		function(result) {}, {resource_type: 'raw'});
	req.attachment.destroy()
		.success(function() {
			req.flash('success', 'Adjunto eliminado con éxito');
			res.redirect('/posts/' + req.post.id);
		})
		.error(function(error) {
			next(error);
		});
}

exports.deletePhoto = function(req, res, next) {
	var cloudinary = require('cloudinary');
	if (req.user.photo && req.user.photo != -1 && req.user.photo != -2) {
		models.Attachment
			.find({where: {id: Number(req.user.photo)}})
			.success(function(attachment) {
				cloudinary.api.delete_resources(attachment.public_id, 
					function(result) {}, {resource_type: 'raw'});
				attachment.destroy()
					.success(function() {
						req.user.photo = -1;
						if (req.user.login == 'root') {
							req.user.photo = -2;
						}
						req.user.save(['photo'])
						.success(function() {
							req.flash('success', 'Foto eliminada con éxito');
							res.redirect('/users/' + req.user.id);
						})
						.error(function(error) {
							next(error);
						});
					})
					.error(function(error) {
						next(error);
					});
			})
			.error(function(error) {
				next(error);
			});
	}
	else {
		req.flash('info', 'Esta es la foto por defecto, no se puede borrar');
	}
}
		

