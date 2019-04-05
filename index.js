const express = require('express');
const path = require('path');

const { PORT = 3300 } = process.env;

const app = express()
  .use(express.static(path.join(__dirname, 'dist')));

const server = app.listen(PORT, () => {
  console.log('App listening at port', server.address().port);
});
