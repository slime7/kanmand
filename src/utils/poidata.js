import net from 'net';
import stick from '../libs/stick';

const [HOST, PORT] = ['localhost', 10800];

class Poidata {
  constructor(port, address) {
    this.pluginInstalled = false;
    this.socket = null;
    this.address = address || HOST;
    this.port = port || PORT;
    this.msgCenter = null;
  }

  async init() {
    const client = this;
    client.socket = new net.Socket();

    client.socket.on('close', () => {
      console.log('Client: closed');
    });

    return new Promise((resolve, reject) => {
      client.socket.connect(client.port, client.host, () => {
        console.log(`Client: connected to: ${client.address}: ${client.port}`);
        client.pluginInstalled = true;
        resolve(true);
      });

      client.socket.on('error', (error) => {
        if (error.code === 'ECONNREFUSED' || error.code === 'ECONNRESET') {
          console.log('Client: connect refused');
          client.socket.destroy();
          client.socket = null;
          client.pluginInstalled = false;
          reject(error);
        } else {
          console.log(error);
        }
      });

      client.socket.on('data', (data) => {
        client.msgCenter.putData(data);
      });
    });
  }

  async fetch(paths) {
    const client = this;
    client.msgCenter = new stick.msgCenter({ type: 32 });// eslint-disable-line new-cap

    if (!client.pluginInstalled) {
      try {
        await client.init();
        client.pluginInstalled = true;
      } catch (e) {
        client.pluginInstalled = false;
      }
    }

    return new Promise((resolve, reject) => {
      if (client.pluginInstalled) {
        const msgBuffer = client.msgCenter.publish(JSON.stringify(paths));
        client.socket.write(msgBuffer);

        client.msgCenter.onMsgRecv((data) => {
          const dataString = data.toString();
          resolve(dataString);
        });
      } else {
        client.msgCenter = null;
        reject();
      }
    });
  }

  close() {
    const client = this;
    client.socket.end();
  }
}

const poidata = new Poidata();
export default poidata;
