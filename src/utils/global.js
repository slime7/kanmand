import { app } from 'electron';
import path from 'path';

global.ROOT = path.join(__dirname, '..');
global.APPDATA_PATH = path.join(app.getPath('appData'), 'kanmand');
global.store = {};
