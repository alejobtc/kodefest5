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
