const bdConnect = require('./jsConnection').bdConnection;
const telegramBot = require('./jsConnection').telegramConnection;
const logins= require('./loginController').logins;

telegramBot.on('/myInfo', msg => {
    const id = msg.from.id;

    if(!getUser(id)){
        return telegramBot.sendMessage(id, 'No hay una sesion activa. Inicie una en /login');
    }

    var queryString = "select * from usuario where cedula= '"+getUser(id).cedula+"';";
    
    bdConnect.query(queryString, function (err, rows) {
        let data= JSON.stringify(rows);
        rows= JSON.parse(data).rows;

        //console.log(rows);
        let mensaje='';

        if (err) throw err;

        for (let i=0; i<rows.length; i++ ){
            mensaje += 'Cédula: '+rows[i].cedula+'\n';
            mensaje += 'Nombre: '+rows[i].titular+'\n';
            mensaje += 'Teléfono: '+rows[i].telefono+'\n';
            mensaje += 'Email: '+rows[i].email+'\n';
            mensaje += 'Saldo: '+rows[i].saldo;
        }
        return telegramBot.sendMessage(id,mensaje);

    });
});

function getUser(chat_id){
    for (let i = 0; i<logins.length;i++){
        let user= logins[i];
        if(user.chat_id==chat_id){
            return user;
        }
    }
    return null;
}