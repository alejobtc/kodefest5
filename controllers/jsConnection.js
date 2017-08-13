const pg = require('pg');


let client = new pg.Client({
    host: 'ec2-54-221-244-196.compute-1.amazonaws.com',
    user: 'rdcxzzqhactsqs',
    password: 'fdf3dfda20cbce7a857d073ac624462b1a53b24ac262e5efea6dd68e1c03b3d8',
    database: 'd7elf6revnmp3n',
    port: 5432,
    ssl: true
});
client.connect();

/*
let client = new pg.Client({
    host: 'localhost',
    user: 'alumno',
    password: 'alumno',
    database: 'prueba',
    port: 5432
});
client.connect();
*/

const TeleBot= require('telebot');
const bot = new TeleBot({
    token: '434489850:AAGQbaNZXKdTrWC-erKCnejrcWI0G2XU51M',
    //token: '424428738:AAErvV51VDT5v0gfomhap3Z6pnhqoKDPvzA',
    usePlugins: ['askUser']
});

module.exports.telegramConnection = bot;
module.exports.bdConnection = client;

bot.start();