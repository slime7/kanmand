/* global window */
import net from 'net';

const { getStore } = window;
const [host, port] = ['localhost', 10800];

const server = net.createServer();

export const pluginDidLoad = () => {
  server.listen({
    host,
    port,
    exclusive: true,
  });

  server.on('connection', (socket) => {
    socket.setEncoding('utf8');
    socket.on('data', (data) => {
      let ret;
      switch (data) {
        case 'info.fleets':
        case 'info.ships':
        case 'info.equips':
        case 'info.quests':
        case 'info.repairs':
        case 'const.$ships':
          ret = JSON.stringify(getStore(data));
          break;

        case 'close':
        default:
          // ret = 'close';
          break;
      }
      if (ret) {
        socket.write(`::${data}::`);
        socket.write(ret);
        socket.write(`;;${data};;`);
      }
      // socket.end();
    }
  );
    });
  };
  export const pluginWillUnload = () => {
    server.close();
  };
