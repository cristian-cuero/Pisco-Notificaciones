//**Clase Encargada De La Notificacion  */
const consulta = require("../db/DBConection");
const EnviarCorreo = require("../helpers/EnviarCorreo");
const json2xls = require("json2xls");
const fs = require("fs");
const { construirExcel } = require("../helpers/CrearExcelDinamico");
let cantidad = 1;
let idgrupoA;
const consultasController = async (noti, len) => {
  const datos = await consulta(noti.SQL);

  if (datos.length > 0) {
    //Opcion De Siempre
    if (noti.CORREOSAENVIAR != "") {
      if (process.env.cnxP === "CnxPiscoServ") {
        const xls = json2xls(datos);
        fs.writeFileSync("reporte.xlsx", xls, "binary");
        await EnviarCorreo(
          noti.MENSAJE,
          noti.CORREOSAENVIAR,
          noti.TIPONOTIFICACION
        );
      } else {
        const encabezado = await consulta(
          "select e.ID, cast(e.TEXTO as varchar(255)CHARACTER SET WIN1252) TEXTO, e.FILA, e.COLOR, e.BOLD, e.align from tblencabezadoexcel e inner join tblrelencabezadosinfo i on e.id = i.idencabezado where i.idnoti  = ?",
          [noti.ID]
        );
        await construirExcel(
          datos,
          noti.COLUMNASOMITIR.split(","),
          encabezado,
          noti.COLUMNASSUMAR.split(",")
        );
        idgrupoA = noti.IDGRUPO;
        if (
          noti.IDGRUPO === "NULL" ||
          cantidad === len ||
          noti.IDGRUPO != idgrupoA
        ) {
          await EnviarCorreo(
            noti.MENSAJE,
            noti.CORREOSAENVIAR,
            noti.TIPONOTIFICACION
          );
        }

      
        cantidad++;
      }
    }
    //nueva Opcion
    else {
      for (let i = 0; i < datos.length; i++) {
        const mensaje = generarCorreo(datos[i], noti.MENSAJE);
        await EnviarCorreo(mensaje, datos[i].EMAIL, noti.TIPONOTIFICACION, 0);
      }
    }
  }
};

//Cambia Lo Que Esta En () por Los Datos
function generarCorreo(datos, correoFinal) {
  correoFinal;

  // Reemplazar todos los marcadores dinámicos con los valores correspondientes
  for (let campo in datos) {
    const marcador = new RegExp(`\\(${campo.toUpperCase()}\\)`, "g"); // Expresión regular con 'g'
    correoFinal = correoFinal.replace(marcador, datos[campo]);
  }

  return correoFinal;
}

module.exports = consultasController;
