const consultasController = require("../controller/consultasController.Js");
const consulta = require("../db/DBConection");


const consultarNotificacionesAuxilios = async () => {
    try {
      const data = await consulta(
        "select  * from TBLNOTIFICACIONES n WHERE ESTADO = 1  and CORREOSAENVIAR = '' "
      );
    
      if (data) {
        for (const noti of data) {
          await consultasController(noti);
          let sql = noti.UPDATE
          await consulta(sql);
        }
      }
    } catch (error) {
      if (error.gdsparams) {
        console.log("Error En La Conexion Con La BD", error);
      } else {
        console.log("Error En La Consulta PRINCIPAL", error);
      }
    }
  }

  module.exports = consultarNotificacionesAuxilios;