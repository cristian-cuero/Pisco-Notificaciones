

//clase Principal Del Servicio Es La Que Se Inicia 
const consulta = require("../db/DBConection");
const consultasController = require("../controller/ConsultasController.Js");
const { Logs } = require("../helpers/Logs");
const moment =  require('moment');

//const { Logs } = require("../helper/Logs");




class Server {
  //constructor
  constructor() {
     this.conectarDD();
  }

  //para que escuche la aplicacion
  listen() {
       Logs() 
      console.log(`Backend corriendo De Manera Satisfactoria`);
  }


  //crea la configuracion de los parametros necesarias para loguearse
  async conectarDD(){

    try {
      const data =  await consulta("select  * from TBLNOTIFICACIONES n WHERE ESTADO = 1 and  current_time >= n.fechaenvio and n.ultimavezenvio < cast('NOW' as date)") ;
      
      if(data){

        for( const noti of data){
            await consultasController( noti)
            let sql =`update tblnotificaciones  n set n.ultimavezenvio ='${moment().format('YYYY-MM-DD')}'  where n.id = ?`
            await consulta(sql , noti.ID )
        }

      }
       
     
       // setInterval( async () =>  await CierreContable(), 5000)
      //const estado = false
     
       while(true) {
        console.log("INICIO")
        await Promise.all([
          this.conectarDD(),
          this.timeout(30000)
      ]);
      
    
       }
       

    } catch (error) {
      if(error.gdsparams){
        console.log ("Error En La Conexion Con La BD", error)
        Logs(error) 
        this.conectarDD();
      }else{
        console.log ("Error En La Consulta PRINCIPAL", error)
        Logs(error) 
        this.conectarDD();
      }
     
    }

   
     

  }

 
  timeout(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}


  //importar Rutas

}
//exportar
module.exports = Server;