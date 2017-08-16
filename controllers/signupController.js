const bdConnect = require('./jsConnection').bdConnection;
const telegramBot = require('./jsConnection').telegramConnection;

var usuario = {};

telegramBot.on('/start', msg => {
	let replyMarkup = telegramBot.keyboard([
        ['/registro', '/login']
        ]
    , {resize: true});
    return telegramBot.sendMessage(
        msg.from.id, 
        "Bienvenido a BantelegramBot que desea hacer:\n"+ 
        "/registro Para crear un nuevo usuario \n"+
        "/login para ingresar a su cuenta",  {replyMarkup}
    );
});

telegramBot.on('/registro', msg=>{
	usuario[msg.from.id]={}
	const id = msg.from.id;
    return telegramBot.sendMessage(id, 'Cuál es tu nombre completo?', {ask: 'name', replyMarkup: 'hide'});
	// Ask age event
});


telegramBot.on('ask.name', msg => {

    const id = msg.from.id;
    usuario[msg.from.id].nombre=msg.text;
    //usuario.name = msg.text;
    const name = msg.text;

    // Ask user age
    return telegramBot.sendMessage(id, "Ingresa tu documento de identidad: ", {ask: 'cedulaCreate'});
});


telegramBot.on('ask.cedulaCreate', msg => {

    const id = msg.from.id;
    const cedula = Number(msg.text);
    let query = "select count(*) cantidad from usuario where cedula='"+cedula+"';"
    bdConnect.query(query,(err,rows)=>{
    	if(err){
    		throw err;
    	}
    	else{
    		let data= JSON.stringify(rows);
            let count = JSON.parse(data).rows[0].cantidad;
            if (count>0) {
            	telegramBot.sendMessage(id, 'Esta cedula ya esta registrada.\n Ingresa tu documento de identidad: ', {ask: 'cedulaCreate'});
            }else {
		    	usuario[msg.from.id].cedula=msg.text;
		        // Last message (don't ask)
		        telegramBot.sendMessage(id, 'Ingresa tu numero telefonico: ',{ask: 'numero'});

    		}
    	}
    });
});

telegramBot.on('ask.numero', msg => {

    const id = msg.from.id;
    const numero = Number(msg.text);

    if (!numero) {
        telegramBot.sendMessage(id, 'Este no es un correcto, Ingresa tu numero telefonico: ', {ask: 'numero'});

    } else {
    	usuario[msg.from.id].numero=msg.text;
        telegramBot.sendMessage(id, 'Cual es tu email?',{ask: 'email'});

    }
});


telegramBot.on('ask.email', msg => {
    const id = msg.from.id;
    usuario[msg.from.id].email=msg.text;
    return telegramBot.sendMessage(id, "Ingresa una contraseña: ", {ask: 'contraseña'});
});

telegramBot.on('ask.contraseña', msg => {
    const id = msg.from.id;
    usuario[msg.from.id].contraseña=msg.text;
    return telegramBot.sendMessage(id, "Confirma la contraseña: ", {ask: 'contraseñaconfir'});
});
telegramBot.on('ask.contraseñaconfir', msg => {
    const id = msg.from.id;
    if (msg.text==usuario[msg.from.id].contraseña) {

    	let query = 'insert into usuario (cedula,contraseña,titular,telefono,email,saldo) values ('+usuario[msg.from.id].cedula+", '"+usuario[msg.from.id].contraseña+"', '"+usuario[msg.from.id].nombre+"', "+usuario[msg.from.id].numero+", '"+usuario[msg.from.id].email+"',10000);";
    	//console.log(query);
    	//telegramBot.sendMessage(id,query);
    	bdConnect.query(query,(err,rows)=>{
    		if (err) {
    			throw err;
    		}
    		else{
    			telegramBot.sendMessage(id,'Registrado con exito');
    		}
    	});
    }
    else{
    	return telegramBot.sendMessage(id, "Contraseñas distintas, vuelve a intetarlo ", {ask: 'contraseña'});
    }
});