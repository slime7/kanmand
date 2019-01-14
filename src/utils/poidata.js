import net from 'net';
import stick from '../libs/stick';

const [HOST, PORT] = ['localhost', 10800];

class Poidata {
  constructor(port, address) {
    this.pluginInstalled = true;
    this.socket = new net.Socket();
    this.address = address || HOST;
    this.port = port || PORT;
    this.init();
    this.chunks = [];
  }

  init() {
    const client = this;
    client.socket.connect(client.port, client.host, () => {
      console.log(`Client: connected to: ${client.address}: ${client.port}`);
    });

    client.socket.on('close', () => {
      console.log('Client: closed');
    });
  }

  fetch(paths) {
    const client = this;
    const msgCenter = new stick.msgCenter({ type: 32 });// eslint-disable-line new-cap

    return new Promise((resolve, reject) => {
      if (client.pluginInstalled) {
        const msgBuffer = msgCenter.publish(JSON.stringify(paths));
        client.socket.write(msgBuffer);

        client.socket.on('data', (data) => {
          msgCenter.putData(data);
        });

        msgCenter.onMsgRecv((data) => {
          const dataString = data.toString();
          resolve(dataString);
        });
      }

      client.socket.on('error', (error) => {
        if (error.code === 'ECONNREFUSED') {
          client.pluginInstalled = false;
        }
        reject(error);
      });
    });
  }

  close() {
    const client = this;
    client.socket.end();
  }
}
const poidata = new Poidata();
export default poidata;
