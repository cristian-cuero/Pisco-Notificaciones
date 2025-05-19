//clase Principal Del Servicio Es La Que Se Inicia
const consulta = require("../db/DBConection");
const consultasController = require("../controller/ConsultasController.Js");
const { Logs } = require("../helpers/Logs");
const moment = require("moment");
const fs = require("fs");
//modelo del servidor

const expres = require("express");

const cors = require("cors");

//const { Logs } = require("../helper/Logs");

class Server {
  //constructor
  constructor() {
    this.app = expres();
    this.conectarDD();
    this.port = 8081;
    //paths de rutas
    this.paths = {
      pdf: "/api/PDF",
    };
    this.middleware();
    //rutas de la aplicacion
    this.routes();
  }

  //para que escuche la aplicacion
  listen() {
    Logs();
    this.app.listen(this.port, () => {
      console.log(`Backend corriendo en http://localhost:${this.port}`);
    });
  }

  //crea la configuracion de los parametros necesarias para loguearse
  async conectarDD() {
    try {
      // setInterval( async () =>  await CierreContable(), 5000)
      //const estado = false

      while (true) {
        console.log("INICIO");
        await Promise.all([
          this.consultarNotificaciones(),
          this.timeout(10000),
        ]);
      }
    } catch (error) {
      if (error.gdsparams) {
        console.log("Error En La Conexion Con La BD", error);
        Logs(error);
        this.conectarDD();
      } else {
        console.log("Error En La Consulta PRINCIPAL", error);
        Logs(error);
        this.conectarDD();
      }
    }
  }

  //middlewares de mi app
  middleware() {
    // uso de cors
    this.app.use(cors());
    //lectura y pareson de json
    this.app.use(expres.json());
  }

  //importar Rutas
  routes() {
    this.app.use(this.paths.pdf, require("../routes/Pdf"));
  }

  //funcion

  async consultarNotificaciones() {
    const cnx = process.env.cnxS.split(",");

    for (let cn of cnx) {
      // await consultarNotificacionesAuxilios()
      try {
        process.env.cnxP = cn;
        const data = await consulta(
          "select  * from TBLNOTIFICACIONES n WHERE ESTADO = 1 and  current_time >= n.fechaenvio and n.ultimavezenvio < cast('NOW' as date) and CORREOSAENVIAR <> '' order by IDGRUPO"
        );

        if (data) {
          for (const noti of data) {
            await consultasController(noti, data.length);
            let sql = `update tblnotificaciones  n set n.ultimavezenvio ='${moment().format(
              "YYYY-MM-DD"
            )}'  where n.id = ?`;
            // const rutaArchivo = "reporte.xlsx";
            // if (fs.existsSync(rutaArchivo)) {
            //   fs.unlinkSync(rutaArchivo);
            //   console.log("Archivo eliminado correctamente.");
            // } else {
            //   console.log("El archivo no existe.");
            // }
            //await consulta(sql, [noti.ID]);
          }
        }
      } catch (error) {
        if (error.gdsparams) {
          console.log("Error En La Conexion Con La BD", error);
          Logs(error);
          this.conectarDD();
        } else {
          console.log("Error En La Consulta PRINCIPAL", error);
          Logs(error);
          this.conectarDD();
        }
      }
    }
  }

  timeout(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  //importar Rutas
}
//exportar
module.exports = Server;
