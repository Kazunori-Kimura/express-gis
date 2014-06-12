// app.js
var express = require('express'),
    app = express();

// view
app.set('view engine', 'ejs');
app.set('views', __dirname + '/views');

app.get('/', function(req, res){
    res.render('index', {title: 'GeoTest'});
});

app.listen(3000);
