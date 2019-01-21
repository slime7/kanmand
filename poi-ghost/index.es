/* global window */
import net from 'net';
import stick from './libs/stick';

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
    const msgCenter = new stick.msgCenter({ type: 32 });// eslint-disable-line new-cap
    socket.setEncoding('utf8');
    socket.on('data', (data) => {
      if (typeof data === 'string') {
        msgCenter.putData(Buffer.from(data));
      } else {
        msgCenter.putData(data);
      }
    });
    msgCenter.onMsgRecv((data) => {
      try {
        const poidata = {};
        const paths = JSON.parse(data.toString());
        paths.forEach((path) => {
          switch (path) {
            case 'info.fleets':
            case 'info.ships':
            case 'info.equips':
            case 'info.quests':
            case 'info.repairs':
            case 'info.basic':
            case 'const.$ships': {
              const pathSplit = path.split('.');
              if (!poidata[pathSplit[0]]) {
                poidata[pathSplit[0]] = {};
              }
              if (!poidata[pathSplit[0]][pathSplit[1]]) {
                poidata[pathSplit[0]][pathSplit[1]] = {};
              }
              poidata[pathSplit[0]][pathSplit[1]] = getStore(path);
              break;
            }

            case 'close':
            default:
              break;
          }
        });
        const retBuff = msgCenter.publish(JSON.stringify(poidata));
        socket.write(retBuff);
      } catch (e) {
        console.log(e.message);
      }
    });
  });
};
export const pluginWillUnload = () => {
  server.close();
};
