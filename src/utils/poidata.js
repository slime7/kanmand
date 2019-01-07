import net from 'net';

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
      console.log(`Client connected to: ${client.address}: ${client.port}`);
    });

    client.socket.on('close', () => {
      console.log('Client closed');
    });
  }

  fetch(path) {
    const client = this;

    return new Promise((resolve, reject) => {
      if (client.pluginInstalled) {
        client.socket.write(path);

        client.socket.on('data', (data) => {
          client.chunks.push(data);
        });

        client.socket.on('end', () => {
          const result = Buffer.concat(client.chunks);
          resolve(result.toString());
          client.socket.destroy();
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
}

export default Poidata;
