var express = require('express'),
    router = express.Router(),
    mongoose = require('mongoose'), //mongodb 연결
    bodyParser = require('body-parser'), //POST로부터의 정보 parsing
    methodOverride = require('method-override'); //POST 다루기 위한 package

//
router.use(bodyParser.urlencoded({ extended: true }))
router.use(methodOverride(function(req, res){
    if (req.body && typeof req.body === 'object' && '_method' in req.body) {
        // look in urlencoded POST bodies and delete it
        var method = req.body._method
        delete req.body._method
        return method
    }
}))


//REST operation build하기

router.route('/').get(function(req, res, next) {
    // mongo에서 모든 article 가져오기
    mongoose.model('article').find({}, function (err, articles) {
        if (err) {
            return console.error(err);
        } else {
            res.render('index.jade', {
                title: 'Blog',
                articles: articles
            });
        }
    })
})

router.route('/blog/new').get(function(req, res) {
    res.render('blog_new.jade', {title: 'New Post'});
});

router.route('/blog/new').post(function(req, res) {
    mongoose.model('article').create({
        title: req.param('title'),
        body: req.param('body'),
        created_at: new Date()
    }, function(error, article) {
        if (error) {
            res.send("There is a problem adding the information to the databases.");
        } else {
            console.log('POST creating new article: ' + article);
            res.redirect('/');
        }
    })
})

// route middleware to validate :id
router.param('id', function(req, res, next, id) {
    //console.log('validating ' + id + ' exists');
    //find the ID in the Database
    mongoose.model('article').findById(id, function (err, article) {
        //if it isn't found, we are going to repond with 404
        if (err) {
            console.log(id + ' was not found');
            res.status(404)
            var err = new Error('Not Found');
            err.status = 404;
            res.format({
                html: function(){
                    next(err);
                },
                json: function(){
                    res.json({message : err.status  + ' ' + err});
                }
            });
            //if it is found we continue on
        } else {
            //uncomment this next line if you want to see every JSON document response for every GET/PUT/DELETE call
            //console.log(blob);
            // once validation is done save the new item in the req
            req.id = id;
            // go to the next thing
            next();
        }
    });
});

router.route('/blog/:id').get(function(req, res) {
    mongoose.model('article').findById(req.params.id, function (err, article) {
        if (err) {
            return console.error(err);
        } else {
            console.log("req.params.id is " + req.params.id);
                res.render('blog_show.jade', {
                    title: article.title,
                    article: article
                });
        }
    })
})

router.route('/blog/addcomments/:id').post(function (req, res) {
    mongoose.model('article').findByIdAndUpdate(req.params.id, {$push: {'comment': {
        person: req.param('person'),
        comment: req.param('comment'),
        created_at: new Date()
    }}}, function (error, article) {
        if (error) {
            res.send("There is a problem adding the information to the databases.");
        } else {
            console.log('POST creating new comment: ' + comment);
            res.redirect('/blog/' + req.param.id);
        }
    })
})


module.exports = router;



