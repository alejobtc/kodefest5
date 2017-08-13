const telegramBot = require('./jsConnection').telegramConnection;

telegramBot.on('/help', msg => {
 let replyMarkup = telegramBot.keyboard([
        ['/registro', '/login','/logout'],
        ['/transfer','/history','/pay'],
        ['/buyAction','/sellAction'],
        ['/myInfo']
        ]
    , {resize: true});
    return telegramBot.sendMessage(
        msg.from.id, 
        "Bienvenido a BantelegramBot que desea hacer:\n"+ 
        "/registro Para crear un nuevo usuario \n"+
        "/login para ingresar a su cuenta\n\n"+
        "Si ha iniciado sesión puede acceder a los siguientes comandos:\n"+
        "/logout para salir de su cuenta \n"+
        "/myInfo para obtener toda la informacion de su cuenta\n"+
        "/transfer para consignar dinero a otras cuentas\n"+
        "/history para mirar el historial de transferencias\n"+
        "/pay para ingresar dinero a la cuenta\n\n"+
        "Para el mercado accionario estan los siguientes comandos: \n \n"+
        "/buyAction ver y comprar las acciones que disponga el banco\n"+
        "/sellAction vender al valor actual las acciones disponibles",  {replyMarkup}
    );
});