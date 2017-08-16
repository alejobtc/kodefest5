const bdConnect = require('./jsConnection').bdConnection;
const telegramBot = require('./jsConnection').telegramConnection;
const logins= require('./loginController').logins;
const loginController= require('./loginController');
let transacciones = [];
var moment = require('moment');


telegramBot.on('/history', msg => {
    const id = msg.from.id;

    var queryString = "select * from historial where origen= '"+getUser(id).cedula+"' or  destino =' "+getUser(id).cedula+"';";
    let mensaje="";
    bdConnect.query(queryString, function (err, rows) {
        let data= JSON.stringify(rows);
        rows= JSON.parse(data).rows;

        if (err) throw err;

        for (let i=0; i<rows.length; i++ ){
            mensaje += 'Cédula Origen: '+rows[i].origen+'\n';
            mensaje += 'Cédula Destino: '+rows[i].destino+'\n';
            mensaje += 'Monto: $'+rows[i].monto+'\n';
            mensaje += 'Fecha: '+rows[i].fecha;
            if(i+1<rows.length){
                mensaje += '\n_________________________\n';
            }
        }
        return telegramBot.sendMessage(id,mensaje);

    });
});

telegramBot.on('/transfer', msg => {
    const id = msg.from.id;
    if(loginController.verificarId(id)) {
        return telegramBot.sendMessage(id, 'Ingrese cantidad a consignar', {ask: 'monto'});
    }
    else{
        return telegramBot.sendMessage(id, 'No hay una sesion activa. Inicie una en /login');
    }
});

telegramBot.on('/pay', msg => {
    const id = msg.from.id;
    if(loginController.verificarId(id)) {
        return telegramBot.sendMessage(id, 'Ingrese cantidad a abonar', {ask: 'abono'});
    }
    else{
        return telegramBot.sendMessage(id, 'No hay una sesion activa. Inicie una en /login');
    }
});

telegramBot.on('ask.abono', msg => {
    const id = msg.from.id;
    let abono = msg.text*1;

    for (let i = 0; i<logins.length;i++){
        let user = logins[i];
        if(user.chat_id==""+id){
            let query= "select saldo from usuario where cedula='"+user.cedula+"'";
            bdConnect.query(query, function (err, rows) {
                if (err)throw err;
                let data= JSON.stringify(rows);
                let saldo = JSON.parse(data).rows[0].saldo;
                abono+=saldo*1;
                let query2 ="update usuario set saldo = '"+abono+"' where usuario.cedula= '"+user.cedula+"'";
                bdConnect.query(query2, function (err, rows) {
                    if (err)throw err;
                        return telegramBot.sendMessage(id, 'Abono exitoso');
                });
            });

        }
    }

});


telegramBot.on('ask.monto', msg => {
    const id = msg.from.id;
    const monto = msg.text;
    transacciones.push({"chat_id": msg.from.id, "monto": monto, "destino": 0, "key": ''});
    const Exp=/[0-9]+/;
    if(Exp.test(monto)){
        for (let i = 0; i<logins.length;i++){
            let user= logins[i];
            if(user.chat_id==id){
                let query= "select saldo from usuario where cedula='"+user.cedula+"'";
                bdConnect.query(query, function (err, rows) {
                    if (err)throw err;
                    let data= JSON.stringify(rows);
                    let saldo = JSON.parse(data).rows[0].saldo;
                    if(saldo*1<monto*1){
                        expulsar(id);
                        return telegramBot.sendMessage(id, 'No tienes fondos suficientes, Intentelo de nuevo ingresando a /transfer');
                    }
                    else if(monto<0){
                        expulsar(id);
                        return telegramBot.sendMessage(id, 'Cantidad Invalida. Intentelo de nuevo ingresando a /transfer');
                    }
                    else{
                        return telegramBot.sendMessage(id, 'Ingrese cedula destinatario ', {ask: 'destino'});
                    }
                });
            }
        }
    }
    else{
        expulsar(id);
        return telegramBot.sendMessage(id, 'Error en el monto. Intentelo de nuevo ingresando a /transfer');
    }

});

function expulsar(id) {
    for (let i = 0; i<transacciones.length;i++){
        let trans= transacciones[i];
        if(trans.chat_id==id){
            transacciones.splice(i,1);
        }
    }
}

telegramBot.on('ask.destino', msg => {
    const id = msg.from.id;
    const destino = msg.text;
    for (let i = 0; i<transacciones.length;i++){
        let trans = transacciones[i];
        if(trans.chat_id==""+id){
            trans.destino=destino;
            let query= "select count(*) cantidad from usuario where cedula='"+destino+"'";
            bdConnect.query(query, function (err, rows) {
                if (err)throw err;
                let data= JSON.stringify(rows);
                let count = JSON.parse(data).rows[0].cantidad;

                if(count>0){
                    return telegramBot.sendMessage(id, 'Ingrese contraseña para confirmar transaccion', {ask: 'keyc'});
                }
                else{
                    expulsar(id);
                    return telegramBot.sendMessage(id, 'Error! Usuario destino no existente. Intentelo de nuevo ingresando a /transfer');
                }
            });
        }
    }
});

telegramBot.on('ask.keyc', msg => {
    const id = msg.from.id;
    const key = msg.text;
    for (let i = 0; i<transacciones.length;i++){
        let trans = transacciones[i];
        if(trans.chat_id==""+id){
            for (let j = 0; j<logins.length;j++){
                if(logins[j].chat_id==trans.chat_id && logins[j].key==key){

                    let query= "update usuario set saldo="+trans.monto+" +";
                    query+="(select saldo from usuario where cedula="+trans.destino+")";
                    query+=" where cedula="+trans.destino+";";

                    bdConnect.query(query, function (err, rows) {

                        query= "update usuario set saldo=";
                        query+="(select saldo from usuario where cedula="+getUser(trans.chat_id).cedula+")";
                        query+=" - "+trans.monto+" where cedula="+getUser(trans.chat_id).cedula+";";

                        bdConnect.query(query, function (err, rows) {
                            query = "insert into historial (origen, destino, Monto, fecha) values ('"+getUser(trans.chat_id).cedula+"', '"+trans.destino+"','"+trans.monto+"', '"+moment().format()+"');";
                            bdConnect.query(query, function (err, rows) {
                                return telegramBot.sendMessage(id, 'Transacción realizada exitosamente!');
                            });
                        });
                    });
                }
            }
        }
    }
});

function getUser(chat_id){
    for (let i = 0; i<logins.length;i++){
        let user= logins[i];
        if(user.chat_id==chat_id){
            return user;
        }
    }
}
