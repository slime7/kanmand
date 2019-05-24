module.exports = {
  productionSourceMap: false,
  devServer: {
    headers: { 'Access-Control-Allow-Origin': '*' },
    https: false,
    disableHostCheck: true,
  },
  pluginOptions: {
    electronBuilder: {
      builderOptions: {
        nsis: {
          oneClick: false,
        },
        win: {
          icon: './src/assets/icons/logo.ico',
          target: [
            {
              target: 'nsis',
              arch: [
                'x64',
              ],
            },
            {
              target: '7z',
              arch: [
                'x64',
              ],
            },
            {
              target: 'portable',
              arch: [
                'x64',
              ],
            },
          ],
        },
        linux: {
          icon: './src/assets/icons',
          target: [
            'deb',
            'AppImage',
          ],
        },
      },
    },
  },
};
