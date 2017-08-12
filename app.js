<<<<<<< HEAD
//
//-------------------------------------APP----------------------------------
//
var express=require("express");
var app=express();
var fs=require('fs');
//
//----------------------------------SECURITY--------------------------------
//
app.disable('x-powered-by');
//var helmet = require('helmet');
//app.use(helmet());
//
//---------------------------------BODY-PARSER------------------------------
//
var bodyParser = require('body-parser');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
//
// ------------DATA BASE---------------------------------
/*
var pg = require('pg');
var connectionString = process.env.DATABASE_URL || 'postgres://rdcxzzqhactsqs:fdf3dfda20cbce7a857d073ac624462b1a53b24ac262e5efea6dd68e1c03b3d8@ec2-54-221-244-196.compute-1.amazonaws.com:5432/d7elf6revnmp3n';
var client = new pg.Client(connectionString);
//client.connect();
*/

require('./controllers/Controller');



//-----------------------------------ROUTES---------------------------------
app.get("/", function (req, res) {
    fs.readFile('./views/index.html', function (err,html) {
        res.write(html);
        res.end();
    });
});

app.set('port', process.env.PORT || 443);

app.listen(app.get('port'), function() {
    console.log('Node app is running on port', app.get('port'));
});
=======
//
//-------------------------------------APP----------------------------------
//
var express=require("express");
var app=express();
var fs=require('fs');

//

//----------------------------------SECURITY--------------------------------
//
app.disable('x-powered-by');
//var helmet = require('helmet');
//app.use(helmet());
//
//---------------------------------BODY-PARSER------------------------------
//
var bodyParser = require('body-parser');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
app.use(function (req, res, next) {

    // Website you wish to allow to connect
    res.setHeader('Access-Control-Allow-Origin', '*');

    // Request methods you wish to allow
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');

    // Request headers you wish to allow
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');

    // Set to true if you need the website to include cookies in the requests sent
    // to the API (e.g. in case you use sessions)
    res.setHeader('Access-Control-Allow-Credentials', true);

    // Pass to next layer of middleware
    next();
});
//
// ------------DATA BASE---------------------------------
require('./controllers/Controller');
//-----------------------------------ROUTES---------------------------------
app.get("/", function (req, res) {
    fs.readFile('./views/index.html', function (err,html) {
        res.write(html);
        res.end();
    });
});


app.set('port', process.env.PORT || 443);


app.listen(app.get('port'), function() {
    console.log('Node app is running on port', app.get('port'));
});



var TelegramBot = require('node-telegram-bot-api');
var token = '434489850:AAGQbaNZXKdTrWC-erKCnejrcWI0G2XU51M';
var bot = new TelegramBot(token, {polling: true});


bot.onText(/\/start/, (msg) => {
bot.sendMessage(msg.chat.id, "Bienvenido al hsasaola");
    
});
>>>>>>> 9834515ded67b76cc2851cf74db19c3c3eb7f208
