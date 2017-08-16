//
//-------------------------------------APP----------------------------------
//
const express = require("express");
const app = express();
const fs = require('fs');
//
//---------------------------------BODY-PARSER------------------------------
//
var bodyParser = require('body-parser');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
//
// ---------------------------------DATA BASE------------------------------
//
require('./controllers/controllers');
//
//-----------------------------------ROUTES---------------------------------
//
app.get("/", function (req, res) {
    fs.readFile('./views/index.html', function (err,html) {
        res.write(html);
        res.end();
    });
});

app.set('port', process.env.PORT || 8081);

app.listen(app.get('port'), function() {
    console.log('Node app is running on port', app.get('port'));
});