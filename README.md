# GSV Risk

Grocery Store Visits is a web and native application to calculate COVID-19 risk in terms we all know: going to the grocery store.

## Project Structure

### Web front end code: `app/`
`app/` contains all the code for the React web front end. It was created with create-react-app and can be used as such, like running locally with `yarn start`.

### Native front end code: `native/`
`native/` contains all the code for the React Native front end. It was created with expo and can be used as such, like running locally with `yarn start`.

### Server code: `server/`
`server/` and `index.js` contain the code for the the express server that runs as a Firebase function. It is a small server-side rendered React app to put meta content in the head dynamically. It can be compiled using `yarn babel`.

### Firebase functions code: `functions/`
`functions/` contains the build files for the project. Use `yarn buildall` in the root to update these files. Firebase functions points at this directory.

## Available Scripts

In the root directory, you can run:

### `yarn start`
Builds `public/bundle.js` for running server locally.

### `yarn util`
Copies `app/src/js/util.js` into `server/js/_util.js` as it is shared by the server and the front end. It is automatically called by each of the other commands defined above.

### `yarn babel`
Compiles `index.js` and the code in `server/` into `functions/`.

### `yarn buildall`
Builds all aspects of the project with one command. That includes:
* deleting old build directories (`functions/node_modules/`, `functions/static/`, `functions/server/`)
* deleting old build files (all except things like `package.json`, `.gitignore`, etc)
* compiling the front end React app
* inserting the comment into `<head>` of `index.html` that the server looks for
* compiling the server code and running yarn

### `yarn serveall`
Starts a local server for firebase functions and hosting.
