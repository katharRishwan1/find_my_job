// const { dotenv, app, morgan, cors, bodyParser, helment, xss, http } = require("./app/services/imports");

// dotenv.config();
// const config = require("./app/config/config");
// const responseHandler = require("./app/middlewares/response-handler");

// //define the env values
// dotenv.config();
// //database connection
// require('./connection')
// app.use(responseHandler())
// // adding morgan to log the http request
// app.use(morgan('tiny'));

// //enabling cors for all request
// app.use(cors());

// // using bodyParser to parse JSON bodies into JS objects
// app.use(bodyParser.json());

// // adding Helmet to enhance your API's security
// app.use(helment());

// // sanitize request data
// app.use(xss());

// // Start the Express server
// const router = require('./app/router/__index.js');
// app.use('/', router);

// app.listen(config.port, () => {
//     console.log('server running on prot', config.port);
// });

const express = require('express');
const os = require('os');

const app = express();

app.get('/api/ip', (req, res) => {
  const interfaces = os.networkInterfaces();
  let address;

  for (let iface in interfaces) {
    for (let i = 0; i < interfaces[iface].length; i++) {
      const alias = interfaces[iface][i];
      console.log('alis------', alias);
      if (alias.family === 'IPv4' && alias.address !== '127.0.0.1' && !alias.internal) {
        address = alias.address;
        break;
      }
    }
  }

  res.json({ ip: address });
});

app.listen(5000, () => console.log('Server running on port 5000'));
