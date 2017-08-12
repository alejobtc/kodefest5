/**
 * Created by Ander on 12/08/2017.
 */
const bdConnect = require('./jsConnection').bdConnection;
const telegramBot = require('./jsConnection').telegramConnection;

/*
telegramBot.on('message', function (msg, match) {
   telegramBot.sendMessage(msg.from.id, 'AnderEsGAy');
});
*/

let logins = [];


function verificarId(id){
    for (let i = 0; i<logins.length;i++){
        let user = logins[i];
        console.log("comparacion "  + user.chat_id+"=="+id);
        if(user.chat_id==""+id){
            return true;
        }
    }
    return false;
}
function verificarCed(ced){
    for (let i = 0; i<logins.length;i++){
        let user = logins[i];

        if(user.cedula==""+ced){
            return true;
        }
    }
    return false;
}

telegramBot.on('/login', msg => {
    const id = msg.from.id;
    if(!verificarId(id)) {
        logins.push({"chat_id": msg.from.id, "step": 1, "cedula": '', "key": ''});
        return telegramBot.sendMessage(id, 'Ingrese su cedula', {ask: 'cedula'});
    }
    else{
         return telegramBot.sendMessage(id, 'Ya existe una sesion activa');
    }
});


telegramBot.on('/logout', msg => {
    const id = msg.from.id;
    for (let i = 0; i<logins.length;i++){
        let user = logins[i];
        if(user.chat_id==""+id){
            logins.splice(i,1);
            return telegramBot.sendMessage(id, 'Sesion Expirada');
        }
    }
    return telegramBot.sendMessage(id, 'Error');
});

telegramBot.on('ask.cedula', msg => {
    const id = msg.from.id;
    const cedula = msg.text;
    logins.forEach(function (user, index) {
        if(user.chat_id==id){

            if(!verificarCed(cedula)) {
                user.cedula=cedula;
                return telegramBot.sendMessage(id, 'Ingrese su contraseña', {ask: 'key'});

            }
            else{
                logins.splice(index,1);
                return telegramBot.sendMessage(id, "Sesion activa en otro chat!");
            }
        }
    });
});

telegramBot.on('ask.key', msg => {
    const id = msg.from.id;
    const key = msg.text;

    logins.forEach(function (user, index) {
        if(user.chat_id==id){
            user.key=key;
            let query = "select count(*) cantidad from usuario where cedula= '"+user.cedula+"' and contraseña='"+user.key+"';";
            bdConnect.query(query, function (err, rows) {
                if (err)throw err;
                let data= JSON.stringify(rows);
                let count = JSON.parse(data).rows[0].cantidad;

                console.log(count);

                if(count>0){
                    console.log(logins);
                    return telegramBot.sendMessage(id, 'Logeado');
                }
                else{
                    logins.splice(index,1);
                    return telegramBot.sendMessage(id, 'Error!');
                }
            });

        }
    });
});
