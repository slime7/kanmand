'use strict';

const net = require('net');
const stick = require('../../index');
const msgCenter = new stick.msgCenter({type: 32});

const client = net.createConnection({ port: 8080, host: '127.0.0.1' }, function () {
    const msgBuffer = msgCenter.publish('test');

    client.write(msgBuffer);
});

client.on('data', function (data) {
    msgCenter.putData(data);
});
client.on('end', function () {
    console.log('disconnect from server');
});
msgCenter.onMsgRecv(data => {
		console.log('serve ret data: ' + data.toString());
	});