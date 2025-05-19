const fs = require('fs');
const path = require('path');


// Función para obtener nombre disponible
function obtenerNombreDisponible(base = 'reporte', ext = "xlsx") {
  dir =  process.cwd();
  let nombre = `${base}.${ext}`;
  let contador = 1;

  while (fs.existsSync(path.join(dir, nombre))) {
    nombre = `${base}_${contador}.${ext}`;
    contador++;
  }

  return nombre;
}

const extensionesExcel = ['.xlsx', '.xls']; // asegúrate de tener esto definid
// Función principal
function obtenerInfoArchivosExcelEnRaiz() {
    return new Promise((resolve, reject) => {
        const rootDir = process.cwd();
    
        fs.readdir(rootDir, (err, files) => {
          if (err) {
            return reject('Error leyendo la carpeta: ' + err);
          }
    
          const archivosExcel = files
            .filter(file => extensionesExcel.includes(path.extname(file).toLowerCase()))
            .map(file => {
              return {
                nombre: file,
                ruta: path.join(rootDir, file)
              };
            });
    
          resolve(archivosExcel);
        });
      });
}


module.exports = {
    obtenerNombreDisponible,
    obtenerInfoArchivosExcelEnRaiz
}

