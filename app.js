require('dotenv').config();
const Server = require("./model/server");

//creo una instancia del servidor
const server = new Server();

//inicializo el servicor
server.listen();  

