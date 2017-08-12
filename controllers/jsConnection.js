/**
 * Created by jimmyloaiza on 10/06/17.
 */

const pg = require('pg');

/*
let client = new pg.Client({
    host: 'ec2-54-221-244-196.compute-1.amazonaws.com',
    user: 'rdcxzzqhactsqs',
    password: 'fdf3dfda20cbce7a857d073ac624462b1a53b24ac262e5efea6dd68e1c03b3d8',
    database: 'rdcxzzqhactsqs',
    port: 5432,
    ssl: true
});
client.connect();
*/
let client = new pg.Client({
    host: 'localhost',
    user: 'Anderson',
    password: '123456',
    database: 'Pruebas',
    port: 5432
   // ssl: true
});
client.connect();

/*
const TelegramBot = require('node-telegram-bot-api');
const token = '443862803:AAGMgCf2SrxKb--pSuII2vhSfxkb2WHBHzI';
const bot = new TelegramBot(token, {polling: true});
*/


const TeleBot= require('telebot');
const bot = new TeleBot({
    token: '443862803:AAGMgCf2SrxKb--pSuII2vhSfxkb2WHBHzI',
    usePlugins: ['askUser']
});

module.exports.telegramConnection = bot;
module.exports.bdConnection = client;

bot.start();