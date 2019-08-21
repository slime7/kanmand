import http from 'http';
import { URL } from 'url';

class StoreServer {
  host;

  port;

  server;

  running = false;

  response;

  constructor(host = 'localhost', port = 10800) {
    this.host = host;
    this.port = port;
    this.server = http.createServer(this.onRequest.bind(this));
  }

  onRequest(request, response) {
    this.response = response;
    const { method } = request;
    const url = new URL(request.url, `http://${request.headers.host}`);
    if (method.toLowerCase() === 'get') {
      const pathname = url.pathname.toLowerCase();
      switch (true) {
        case pathname === '/ping':
          this.pong();
          break;

        case pathname === '/':
        case pathname === '/list': {
          const options = [
            {
              method: 'get',
              path: '/',
              description: '列出所有请求选项',
            },
            {
              method: 'get',
              path: '/list',
              description: '列出所有请求选项',
            },
            {
              method: 'get',
              path: '/ping',
              description: 'ping',
            },
            {
              method: 'get',
              path: '/store?name[]=storeName',
              description: '获取 store 内容',
            },
            {
              method: 'get',
              path: '/store/$1(/$2)',
              description: '获取 store 内容',
            },
          ];
          this.simpleJsonResponse(options);
        }
          break;

        case pathname === '/store': {
          const params = url.searchParams;

          this.getStore(params.getAll('name')
            .map(p => p.split('.')));
        }
          break;

        case !!pathname.match(/^\/store\/(?<p1>[^/]+)(?:\/(?<p2>[^/]+))?$/): {
          const matches = pathname.match(/^\/store\/(?<p1>[^/]+)(?:\/(?<p2>[^/]+))?$/);
          const { p1, p2 } = matches.groups;
          this.getStore([[p1, p2]]);
        }
          break;

        default:
          this.emptyResponse(405);
      }
    } else {
      this.emptyResponse(405);
    }
  }

  start() {
    if (!this.running) {
      const server = this;
      this.server.listen(this.port, this.host, () => {
        server.running = true;
      });
    }
  }

  stop(callback) {
    if (this.running) {
      const server = this;
      this.server.close(() => {
        server.running = false;
        if (typeof callback === 'function') {
          callback();
        }
      });
    }
  }

  restart() {
    this.stop(this.start.bind(this));
  }

  /* private */

  emptyResponse(status = 204) {
    this.response.statusCode = status;
    this.response.end();
    this.response = null;
  }

  simpleJsonResponse(data, status = 200) {
    const json = typeof data === 'object' ? data : { data };
    this.response.statusCode = status;
    this.response.setHeader('Content-Type', 'application/json; charset=utf-8');
    this.response.write(JSON.stringify(json));
    this.response.end();
    this.response = null;
  }

  pong() {
    this.simpleJsonResponse('pong');
  }

  /**
   *
   * @param names array[string[p1, p2], ...]
   * @return poiData
   */
  getStore(names) {
    const limits = [
      'info.fleets',
      'info.ships',
      'info.equips',
      'info.quests',
      'info.repairs',
      'info.basic',
      'const.$ships',
    ];
    const { getStore } = window;
    const poiData = {};

    names.forEach((name) => {
      const [p1, p2] = name;
      if (limits.indexOf(`${p1}.${p2}`) >= 0) {
        if (!poiData[p1]) {
          poiData[p1] = {};
        }
        if (!poiData[p1][p2]) {
          poiData[p1][p2] = {};
        }
        poiData[p1][p2] = getStore(`${p1}.${p2}`);
      }
    });

    if (!Object.keys(poiData).length) {
      this.emptyResponse(406);
    } else {
      this.simpleJsonResponse(poiData);
    }
  }
}

export default StoreServer;
