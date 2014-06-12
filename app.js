// app.js
var express = require('express'),
    bodyParser = require('body-parser'),
    app = express();

// route
var area = require('./routes/area.js'),
    school = require('./routes/school.js'),
    district = require('./routes/district.js');

// view
app.set('view engine', 'ejs');
app.set('views', __dirname + '/views');

// serve static files
app.use(express.static(__dirname + '/bower_components'));
app.use(express.static(__dirname + '/public'));

app.get('/', function(req, res){
    res.render('index', {title: 'GeoTest'});
});

// area 行政区域
app.get('/areas', area.findAll);
app.get('/areas/:code', area.find);

// school 小学校
app.get('/areas/:code/schools', school.find);

// district 校区
app.get('/areas/:code/districts', district.find);

app.listen(3000);
