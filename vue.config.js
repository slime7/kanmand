module.exports = {
  productionSourceMap: false,
  pluginOptions: {
    electronBuilder: {
      builderOptions: {
        win: {
          icon: './src/assets/logo.ico',
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
      },
    },
  },
};
