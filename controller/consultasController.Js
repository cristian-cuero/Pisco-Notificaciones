//**Clase Encargada De La Notificacion  */
const consulta = require("../db/DBConection");
const EnviarCorreo = require("../helpers/EnviarCorreo");
const json2xls = require("json2xls");
const fs = require("fs");
const consultasController = async (noti) => {

    const datos = await consulta(noti.SQL);

    if (datos.length > 0) {
      const xls = json2xls(datos);
      fs.writeFileSync("datos.xlsx", xls, "binary");
      await EnviarCorreo(
        noti.MENSAJE,
        noti.CORREOSAENVIAR,
        noti.TIPONOTIFICACION
      );
    }
  
};

module.exports = consultasController;
