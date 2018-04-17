var express = require('express');
var router = express.Router();
var passport = require('passport');

/* GET home page. */
router.get('/', function(req, res, next) {
  res.redirect('/secret');
});

/* GET login page */
router.get('/login', function (req, res, next) {
    res.render('login');
});

/* GET signup page */
router.get('/signup', function (req, res, next) {
    res.render('signup');
});

/* POST to login */
router.post('/login', passport.authenticate('local-login', {
    successRedirect: '/secret',
    failureRedirect: '/login',
    failureFlash: true,
}));

/* POST to signup */
router.post('/signup', passport.authenticate('local-signup', {
    successRedirect: '/secret',
    failureRedirect: '/signup',
    failureFlash: true
}));

/* GET secret page */
router.get('/secret', isLoggedIn, function (req, res, next) {

    var user = req.user.local;

    res.render('secret', {
        username : user.username,
        twitterName: req.user.twitter.displayName,
        signupDate: req.user.signupDate,
        favorites: req.user.favorites
    });
});

/* middleware to verify if user is logged in, and to let them
 * proceed. If not, redirect to login page */
function isLoggedIn(req, res, next) {
    if (req.isAuthenticated()) {
        next();
    } else {
        res.redirect('/login');
    }
}

/* GET logout */
router.get('/logout', function (req, res, next) {
    //passport middleware adds the logout function
    req.logout();
    res.redirect('/');
})

/* POST to update secrets */
router.post('/saveSecrets', isLoggedIn, function (req, res, next) {

    if (req.body.color || req.body.luckyNumber) {
        // add to the req.user.favorites object
        req.user.favorites.color = req.body.color || req.user.favorites.color;
        req.user.favorites.luckyNumber = req.body.luckyNumber || req.user.favorites.luckyNumber;

        //Save the modified user, to save to the database
        req.user.save()
            .then( () => {
                req.flash('updateMsg', 'Your data was updated');
                res.redirect('/secret');
            })
            .catch( (err) => {
                if (err.name === "ValidationError") {
                    req.flash('updateMsg', 'Your data is not valid');
                    res.redirect('/secret');
                } else {
                    next(err);
                }
            });
    }

    else {
        req.flash('updateMsg', 'Please enter some data');
        res.redirect('/secret');
    }
});

/* GET twitter authentication. Call passport's authenticate method to redirect user to Twitter */
router.get('/auth/twitter', passport.authenticate('twitter'));

/* GET to handle response from Twitter
 * Twitter will request this route when user has authenticated */
router.get('/auth/twitter/callback', passport.authenticate('twitter', {
    successRedirect: '/secret',
    failureRedirect: '/'
}));

module.exports = router;
