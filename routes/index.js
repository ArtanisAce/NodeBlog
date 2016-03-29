var express = require('express');
var router = express.Router();
var mongo = require('mongodb');
var db = require('monk')('localhost/nodeblog');

// Homepage Blog Posts
router.get('/', function(req, res, next) {
    var db = req.db;
    var posts = db.get('posts');
    posts.find({},function(err, posts){
      if (err) throw err;
  	res.render('index',{"title":'Nodeblog',"posts":posts});
    });
});

module.exports = router;
