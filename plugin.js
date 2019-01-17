const npm = require('npm');
const path = require('path');
const fs = require('fs');

npm.load(() => {
  npm.commands.pack(['./poi-ghost'], (err, data) => {
    const rootdir = path.join(__dirname);
    const packagename = data[0].filename;
    fs.rename(path.join(rootdir, packagename),
      path.join(rootdir, 'public', 'poi-plugin-ghost.tgz'),
      (fserr) => {
        if (fserr) {
          console.log(fserr.message);
        }
      });
  });
});
