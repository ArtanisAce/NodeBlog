var express = require('express');
var router = express.Router();
var mongo = require('mongodb');
var db = require('monk')('localhost/nodeblog');

router.get('/add', function(req, res, next){
	var categories = db.get('categories');

	categories.find({},{}, function(err, categories){
		res.render('addpost',{
			"title": "Add Post",
			"categories": categories
		});
	});
});

// Show single posts
router.get('/show/:id', function(req,res,next){
    var db = req.db;
    var post = db.get('posts');
    post.findById(req.params.id,function(err, post){
      if (err) throw err;
      var comments = db.get('comments');
      comments.find({linkedto:post.title},{},function(err, comments){
         res.render('singlepost',{"title":"View single post","post":post,"comments":comments}); 
      });  
    });
});

router.post('/add', function(req, res, next){
	// Get Form Values
	var title 		= req.body.title;
	var category 	= req.body.category;
	var body 		= req.body.body;
	var author 		= req.body.author;
	var date 		= new Date();
        
    /*    
	if(req.files.mainimage){
		var mainImageOriginalName 	= req.files.mainimage.originalname;
		var mainImageName 			= req.files.mainimage.name;
		var mainImageMime    		= req.files.mainimage.mimetype;
		var mainImagePath    		= req.files.mainimage.path;
		var mainImageExt    		= req.files.mainimage.extension;
		var mainImageSize    		= req.files.mainimage.size;
	} else {
		var mainImageName = 'noimage.png';
	}
    */


	// Form Validation
	req.checkBody('title','Title field is required').notEmpty();
	req.checkBody('body', 'Body field is required').notEmpty();

	// Check Errors
	var errors = req.validationErrors();

	if(errors){
       var categories = db.get('categories');
	    categories.find({},{},function(err,categories){
            if (err) throw err;
            res.render('addpost',{
			"errors": errors,
			"title": title,
            "categories":categories, 
			"body": body
		});
      });

	} else {
		var posts = db.get('posts');

		// Submit to DB
		posts.insert({
			"title": title,
			"body": body,
			"category": category,
			"date": date,
			"author": author//,
			//"mainimage": mainImageName
		}, function(err, post){
			if(err){
				res.send('There was an issue submitting the post');
			} else {
				req.flash('success','Post Submitted');
				res.location('/');
				res.redirect('/');
			}
		});
	}
});


// Get comments from post 
router.post('/show/:id', function(req, res, next){
    
    var id          = req.params.id;    
	// Get Form Values
    var linkedto    = req.body.linkedto;
	var name 		= req.body.name;
	var email 	    = req.body.email;
	var body 		= req.body.body;
	var date 		= new Date();
    
        
	// Form Validation
	req.checkBody('name','Name field is required').notEmpty();
    req.checkBody('email','Email field is required').notEmpty();
    req.checkBody('email','Email is not formatted correctly').isEmail();
	req.checkBody('body', 'Body field is required').notEmpty();

	// Check Errors
	var errors = req.validationErrors();

	if(errors){
    var posts = db.get('posts');
    posts.findById(req.params.id,function(err, post){
      if (err) throw err;
      var comments = db.get('comments');
      comments.findById(req.params.id,function(err, comments){
         res.render('singlepost',{
             "title":"View single post",
             "post":post,
             "comments":comments,
             "errors":errors,
             "name":name,
             "email":email,
             "body":body
            }); 
      });  
    });


	} else {
		var comments = db.get('comments');

		// Submit to DB
		comments.insert({
			"linkedto": linkedto,
            "name": name,
			"email": email,
			"body": body,
			"date": date
		}, function(err, comment){
			if(err){
				res.send('There was an issue submitting the comment');
			} else {
				req.flash('success','Comment Submitted');
				res.location('/posts/show/'+id);
				res.redirect('/posts/show/'+id);
			}
		});
	}
});

module.exports = router;