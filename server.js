// server.js

// BASE SETUP
// =============================================================================

// call the packages we need
var express    = require('express');        // call express
var app        = express();                 // define our app using express
var bodyParser = require('body-parser');
var mongoose   = require('mongoose');
mongoose.connect('mongodb://localhost:27017/local');

var site = require('./app/models/sites');

// configure app to use bodyParser()
// this will let us get the data from a POST
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

var port = process.env.PORT || 8080;        // set our port

// ROUTES FOR OUR API
// =============================================================================
var router = express.Router();              // get an instance of the express Router

// middleware to use for all requests
router.use(function(req, res, next) {
    // do logging
    console.log('Something is happening.'); 
    next(); // make sure we go to the next routes and don't stop here
});

// test route to make sure everything is working (accessed at GET http://localhost:8080/api)
router.get('/', function(req, res) {
    res.json({ message: 'hooray! welcome to our api!' });   
});

// more routes for our API will happen here
// ----------------------------------------------------

router.route('/sites')
    .get(function(req, res) {
        var query = site.find().select('_id position operator site_name site_type technology');
        query.exec(function(err, sites) {
        console.log('getting all sites');
            if (err){
                console.log('error');
                res.send(err);
            }
            res.json(sites);
            console.log('Done');
        });
    });

router.route('/sites/:from/:limit')
    .get(function(req, res) {
        var query = site.find()
            .select('_id site_name site_id operator software_release technology position site_type controller_id operating_bands site_layouts')
            .limit(req.params.limit)
            .skip(req.params.from);
        query.exec(function(err, sites) {
        console.log('getting ', req.params.limit, ' sites');
            if (err){
                console.log('error');
                res.send(err);
            }
            res.json(sites);
            console.log('Done');
        });
    });

router.route('/sites/:siteName')
    .get(function(req, res) {
        var query = site.find().select('position');
        query.exec(function(err, sites) {
        console.log('getting site with site name', req.params.siteName);
            if (err){
                console.log('error');
                res.send(err);
            }
            res.json(sites);
            console.log('Done');
        });
    });

// REGISTER OUR ROUTES -------------------------------
// all of our routes will be prefixed with /api
app.use('/api', router);

// START THE SERVER
// =============================================================================
app.use(express.static('public'));
app.all('/*', function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "X-Requested-With");
  next();
});
app.listen(port);
console.log('Magic happens on port ' + port);