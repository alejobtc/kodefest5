const bdConnect = require('./jsConnection').bdConnection;
const telegramBot = require('./jsConnection').telegramConnection;
const logins= require('./loginController').logins;

let usuarioAcciones={};

telegramBot.on('/buyAction', msg => {
	const id = msg.from.id;

	//mostrar las acciones disponibles y precio
    let query = "select * from empresa where cantAcciones>=cantAccionesAct;";
    let data;
    let info;
    bdConnect.query(query, function (err, rows) {
        if (err)throw err;

            data= JSON.stringify(rows);
            info= JSON.parse(data).rows;
            
            //telegramBot.sendMessage(id,'Seleccione una accion a comprar');
          	for (var i = 0; i < info.length; i++) {
            	
		       	telegramBot.sendMessage(id, info[i].idempresa+" para-> Empresa: "+info[i].nombreempresa+" Cantidad Acciones: "+info[i].cantaccionesact +" precio c/u: "+info[i].precioaccion);
		       	
		       	if(i== info.length-1){
		            		
		       		return telegramBot.sendMessage(id, 'Seleccione una accion a comprar', {ask: 'buyinfo'});
		       	}
    		}
            
               
    });    
    
            


});

telegramBot.on('ask.buyinfo',msg=>{
	const id = msg.from.id;
	let usuario=getUser(id);
	usuarioAcciones[msg.from.id]={};
	usuarioAcciones[msg.from.id].cedula=usuario.cedula;
	usuarioAcciones[msg.from.id].idempresa=msg.text;
	
	
	
	let query="select saldo,precioAccion,cantAccionesAct from usuario,empresa where cedula='"+usuario.cedula+"'and idempresa='"+msg.text+"';";                 
	//verifica saldo y almacena
	bdConnect.query(query, function (err, rows) {                     
		if (err)throw err;                     
		let data= JSON.stringify(rows);                     
		usuarioAcciones[msg.from.id].saldo= JSON.parse(data).rows[0].saldo;
		usuarioAcciones[msg.from.id].precioaccion=JSON.parse(data).rows[0].precioaccion;
		usuarioAcciones[msg.from.id].accionesrestantes=JSON.parse(data).rows[0].cantaccionesact;
		
		return telegramBot.sendMessage(id,'indique cantidad de acciones a comprar',{ask:'buy'});
	});

	
	
	
});
telegramBot.on('ask.buy',msg=>{
	const id = msg.from.id;
	const cantidad = Number(msg.text);
	if(!cantidad){
		 return telegramBot.sendMessage(id, 'Cantidad incorrecta no numerico! intente de nuevo', {ask: 'buy'});
	}else{
		//guarda la cantidad de accion que quiere la persona
		usuarioAcciones[msg.from.id].cantidadacciones=cantidad;
		//verifica si el saldo que tiene le alcanza para la cantidad de acciones
		if(usuarioAcciones[msg.from.id].cantidadacciones*usuarioAcciones[msg.from.id].precioaccion>usuarioAcciones[msg.from.id].saldo){
			return telegramBot.sendMessage(id,'saldo insuficiente/no hay suficientes acciones');
		}
		//verifica si hay acciones dispobibles
		if(usuarioAcciones[msg.from.id].accionesrestantes < usuarioAcciones[msg.from.id].cantidadacciones){
			return telegramBot.sendMessage(id,'saldo insuficiente/no hay suficientes acciones');
		}

		let query="select *  from accion where idEmpresa='"+usuarioAcciones[msg.from.id].idempresa+"' and ceduladueño='"+usuarioAcciones[msg.from.id].cedula+"';"
		//verifica si ya existe Registro
		bdConnect.query(query, function (err, rows) {
				if (err)throw err;
				let data=JSON.stringify(rows);
				let info=JSON.parse(data).rows;
				//si existe update
				if(info.length>0){
					actualizarCompra(id,"adicion");
					actualizarEmpresa(id,"resta");
					actualizarSaldoBanco(id,"adicion");
					actualizarSaldoUsuario(id,"resta");
					delete usuarioAcciones[msg.from.id];
					
					//falta actualizar saldo banco
				}else{// insert
					insertarCompra(id);
					actualizarEmpresa(id,"resta");
					actualizarSaldoBanco(id,"adicion");
					actualizarSaldoUsuario(id,"resta");
					delete usuarioAcciones[msg.from.id];
					
					//falta actualizar saldo banco
				}

		});

	}
	
});

telegramBot.on('/sellAction', msg => {
	const id = msg.from.id;
	let usuario=getUser(id);
	let query="SELECT accion.idEmpresa,cantidad,ceduladueño,nombreEmpresa,precioAccion from accion,empresa where ceduladueño='"+usuario.cedula+"' and empresa.idEmpresa=accion.idEmpresa;"
	
	let data;
    let info;

    bdConnect.query(query, function (err, rows) {
		if (err)throw err;
		data= JSON.stringify(rows);
        info= JSON.parse(data).rows;
            
        //telegramBot.sendMessage(id,'Seleccione una accion a comprar');
        for (var i = 0; i < info.length; i++) {
            	
		  	telegramBot.sendMessage(id, info[i].idempresa+" para-> Empresa: "+info[i].nombreempresa+" Cantidad Acciones: "+info[i].cantidad +" precio c/u: "+info[i].precioaccion);
		       	
		   	if(i== info.length-1){
		            		
		   		return telegramBot.sendMessage(id, 'Seleccione su accion a vender', {ask: 'sellinfo'});
		   	}
    	}

	});
});
telegramBot.on('ask.sellinfo',msg=>{
	const id = msg.from.id;
	let usuario=getUser(id);
	usuarioAcciones[msg.from.id]={};
	usuarioAcciones[msg.from.id].cedula=usuario.cedula;
	usuarioAcciones[msg.from.id].idempresa=msg.text;
	//agregar la cantidad que posee y verificar con la que quiere vender
	let query="SELECT cantidad,precioAccion from accion,empresa where ceduladueño='"+usuario.cedula+"' and empresa.idEmpresa=accion.idEmpresa and accion.idempresa='"+usuarioAcciones[msg.from.id].idempresa+"';"
	bdConnect.query(query, function (err, rows) {
		if (err)throw err;
		let data= JSON.stringify(rows);  
		//guarda la cantidad de acciones de la empresa dispobibles de la persona
		usuarioAcciones[msg.from.id].cantidad=JSON.parse(data).rows[0].cantidad;
		usuarioAcciones[msg.from.id].precioaccion=JSON.parse(data).rows[0].precioaccion;
		return telegramBot.sendMessage(id,'indique cantidad de acciones a vender',{ask:'sell'});
	});
	
});
telegramBot.on('ask.sell',msg=>{
	const id = msg.from.id;
	const cantidad = Number(msg.text);
	if(!cantidad){
		 return telegramBot.sendMessage(id, 'Cantidad incorrecta no numerico! intente de nuevo', {ask: 'sell'});
	}else{
		//guarda la cantidad de accion que vende la persona
		usuarioAcciones[msg.from.id].cantidadacciones=cantidad;
		//verifica si hay acciones dispobibles
		if(usuarioAcciones[msg.from.id].cantidad<usuarioAcciones[msg.from.id].cantidadacciones){
			return telegramBot.sendMessage(id,'no tienes suficientes acciones');
		}
		//venderle al banco y recivir el dinero por cada accion
		actualizarCompra(id,"resta");
		actualizarSaldoUsuario(id,"adicion");
		actualizarSaldoBanco(id,"resta");
		actualizarEmpresa(id,"adicion");
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
function actualizarSaldoUsuario(id,tipo){
	if(tipo=="adicion"){
		let query="update usuario set saldo=saldo+'"+(usuarioAcciones[id].cantidadacciones*usuarioAcciones[id].precioaccion)+"' where cedula='"+usuarioAcciones[id].cedula+"';";
		bdConnect.query(query, function (err, rows) {
			if (err)throw err;
			return telegramBot.sendMessage(id,'saldo actualizado');

		});
	}else{
		if(tipo=="resta"){
			let query="update usuario set saldo=saldo-'"+(usuarioAcciones[id].cantidadacciones*usuarioAcciones[id].precioaccion)+"' where cedula='"+usuarioAcciones[id].cedula+"';";
			bdConnect.query(query, function (err, rows) {
				if (err)throw err;
				return telegramBot.sendMessage(id,'saldo actualizado');

			});
		}

	}
}
function actualizarCompra(id,tipo){
	if(tipo=="adicion"){
		let query="update accion set cantidad=cantidad+"+usuarioAcciones[id].cantidadacciones+"where idempresa='"+usuarioAcciones[id].idempresa+"' and ceduladueño='"+usuarioAcciones[id].cedula+"';" 
		bdConnect.query(query, function (err, rows) {
			if (err)throw err;
			return telegramBot.sendMessage(id,'Compra realizada con exito');

		});
	}else{
		if(tipo=="resta"){
			let query="update accion set cantidad=cantidad-"+usuarioAcciones[id].cantidadacciones+"where idempresa='"+usuarioAcciones[id].idempresa+"' and ceduladueño='"+usuarioAcciones[id].cedula+"';" 
			bdConnect.query(query, function (err, rows) {
				if (err)throw err;
				return telegramBot.sendMessage(id,'Compra realizada con exito');

			});
		}
	}
}
function insertarCompra(id){
	let query="insert into accion(idEmpresa,cantidad,ceduladueño) values ('"+usuarioAcciones[id].idempresa+"','"+usuarioAcciones[id].cantidadacciones+"','"+usuarioAcciones[id].cedula+"');";
	bdConnect.query(query, function (err, rows) {
		if (err)throw err;
		return telegramBot.sendMessage(id,'Compra realizada con exito');

	});
}
function actualizarEmpresa(id,tipo){
	if(tipo=="resta"){
		let query="update empresa set cantAccionesAct=cantAccionesAct-"+usuarioAcciones[id].cantidadacciones+" where idEmpresa="+usuarioAcciones[id].idempresa+";"
		bdConnect.query(query, function (err, rows) {
			if (err)throw err;
			//console.log("actualizacion de bd good");

		});
	}else{
		if(tipo=="adicion"){
			let query="update empresa set cantAccionesAct=cantAccionesAct+"+usuarioAcciones[id].cantidadacciones+" where idEmpresa="+usuarioAcciones[id].idempresa+";"
			bdConnect.query(query, function (err, rows) {
				if (err)throw err;
				//console.log("actualizacion de bd good");

			});
		}
	}
}
function actualizarSaldoBanco(id,tipo){
	if(tipo=="adicion"){
		let query="update usuario set saldo=saldo+"+(usuarioAcciones[id].cantidadacciones*usuarioAcciones[id].precioaccion)+"where cedula='8080' ;";
		bdConnect.query(query, function (err, rows) {
			if (err)throw err;
			//console.log("actualizacion de banco good");

		});
	}else{
		if(tipo=="resta"){
			let query="update usuario set saldo=saldo-"+(usuarioAcciones[id].cantidadacciones*usuarioAcciones[id].precioaccion)+"where cedula='8080' ;";
			bdConnect.query(query, function (err, rows) {
				if (err)throw err;
				//console.log("actualizacion de banco good");

			});
		}
	}
}
