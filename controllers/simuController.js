const CronJob = require('cron').CronJob;
const bdConnect = require('./jsConnection').bdConnection;
new CronJob('*/30 * * * * *', function() {
	let query = "select * from empresa;";
    bdConnect.query(query, function (err, rows) {
        let data= rows.rows;
        for (var i = data.length - 1; i >= 0; i--) {
        	let valor = Number(data[i].precioaccion)+
        	(Math.floor(Math.random()*(15))-Math.floor(Math.random()*(15)));
        	if(valor<=0)
        		valor=1;
        	let query = "UPDATE empresa SET precioaccion="+valor+
        	" WHERE idempresa="+data[i].idempresa+";";
        	bdConnect.query(query);
        	//console.log(data[i]);
        }
    });
}, null, true, 'America/Los_Angeles');