const fs = require('fs');
const glob = require('glob');
const { exec, execSync } = require("child_process");

const ignoreFilesRegexes = [
  /^.*\/\..*$/g,
  /^.*\/package\.json$/g,
  /^.*\/yarn\.lock$/g
];

console.log('Removing old build directories...');
execSync('rm -rf ./functions/server ./functions/static ./functions/node_modules');

console.log('Removing old build files...');
const files = glob.sync('functions/**/*', { 'follow': true, 'dot': true });
files.forEach((file) => {
  let ignored = false;
  for (const regex of ignoreFilesRegexes) {
    if ((file.match(regex) || []).length) {
      console.log('Ignore', file);
      ignored = true;
      break;
    }
  }
  if (!ignored && !fs.statSync(file).isDirectory()) {
    fs.unlinkSync(file)
  }
});

console.log('Compiling front end app...');
exec('cd ./app && yarn && yarn build', {}, (error, stdout, stderr) => {
  if (error) {
      console.error('stderr:', stderr);
      throw error;
  }

  console.log('Copying front end build to functions...');
  execSync('cp -R ./app/build/ ./functions/');

  console.log('Inserting HTML comment for meta into index.html...');
  const indexPath = './functions/index.html';
  const builtHtml = fs.readFileSync(indexPath, 'utf8');
  const finalHtml = builtHtml.replace('<head>', '<head><!-- ::META:: -->'); // Add target comment in <head>
  fs.writeFile(indexPath, finalHtml, (error) => {
    if (error) {
      console.error('stderr:', stderr);
      throw error;
    }

    console.log('Build complete! Run `yarn serveall` to serve locally.');
  });
});

console.log('Compiling server code...');
exec('yarn babel && cd ./functions && yarn', {}, (error, stdout, stderr) => {
  if (error) {
    console.error('stderr:', stderr);
    throw error;
  }
});
