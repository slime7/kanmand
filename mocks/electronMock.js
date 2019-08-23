export const remote = {
  getCurrentWindow: jest.fn(),
};

export const ipcRenderer = {
  send: jest.fn(),
  on: jest.fn(),
};

export const clipboard = {
  writeText: jest.fn(),
  readText: jest.fn(),
};
