const db = require("odbc")

const consulta = async (sql = "", parametros = []) => {

  
             const cnx = 'DSN='+ process.env.cnxP
              const coneccion =   await db.connect(cnx);   
              let data = await coneccion.query(sql, parametros)
              coneccion.close();
              //console.log(data);
               //data = data.splice(data.length - 4)
               //console.log(data);
              return data;
              
       
      
  
}



module.exports =  consulta