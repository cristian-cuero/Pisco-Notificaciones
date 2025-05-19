const ExcelJS = require("exceljs");
const { obtenerNombreDisponible } = require("./ExcelValidator");

const construirExcel = async (
  Datos = [],
  Omitir = [],
  Encabezado = [],
  EncabezadoSuma = []
) => {
  const columnas = Object.keys(Datos[0]);
  let columnasFiltradas = columnas;
  if (Omitir.length > 0) {
    columnasFiltradas = columnas.filter((col) => {
      if (!Omitir.includes(col)) return true;
      return Datos.some((row) => Number(row[col]) !== 0);
    });
  }

  const columnasParaAutosumar = EncabezadoSuma.map((c) => {
    const [nombre, tipo] = c.split(":");
    return {
      nombre: nombre.trim(),
      tipo: (tipo || "TEXTO").toUpperCase(),
    };
  });

  //creao Las Hojas

  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet("Reporte");

  // traigo que tan largo sera el infirme
  const ultimaColLetra = numeroAColumnaExcel(columnasFiltradas.length);

  //comsulto Si Tiene Encabezado
  let color 
  const fechaActual = new Date().toISOString().split("T")[0]; // Formato YYYY-MM-DD
  Encabezado.forEach((enc) => {
    const rango = `A${enc.FILA}:${ultimaColLetra}${enc.FILA}`;
    worksheet.mergeCells(rango);
    const celda = worksheet.getCell(`A${enc.FILA}`);
    celda.value = enc.TEXTO.replace("(FECHA)", fechaActual);
    if (!color) color =  enc.COLOR
    celda.font = {
      bold: enc.BOLD === 1,
      color: { argb: enc.COLOR || "000000" },
    };
    celda.alignment = { horizontal: enc.ALIGN || "center", vertical: "middle" };
  });

  const filaTitulos = Math.max(...Encabezado.map((e) => e.FILA)) + 1;
  worksheet.addRow(columnasFiltradas).eachCell((cell) => {
    cell.font = { bold: true, color: { argb: "0000FF" } };
    cell.alignment = { horizontal: "center" };
  });

  Datos.forEach((dato) => {
    const fila = columnasFiltradas.map((col) => dato[col]);
    worksheet.addRow(fila);
  });

  //AutosumaYFormato
  const ultimaFila = worksheet.lastRow.number;
  const filaDeAutosuma = ultimaFila + 1;
  worksheet.getCell(`A${filaDeAutosuma}`).value = "TOTAL";
  worksheet.getCell(`A${filaDeAutosuma}`).font = { bold: true };
  worksheet.getCell(`A${filaDeAutosuma}`).alignment = { horizontal: "center" };

  columnasFiltradas.forEach((col, index) => {
    const colLetter = worksheet.getColumn(index + 1).letter;

    const coincidencia = columnasParaAutosumar.find(
      (auto) => auto.nombre.trim() === col.trim()
    );
    if (coincidencia) {
      // Obtener valores numéricos de la columna (ignorando encabezado)
      const valores = worksheet
        .getColumn(index + 1)
        .values.slice(filaTitulos + 1) // valores debajo del encabezado
        .filter((v) => typeof v === "number");

      const total = valores.reduce((sum, val) => sum + val, 0);

      const cell = worksheet.getCell(`${colLetter}${filaDeAutosuma}`);
      cell.value = total;
      cell.font = { bold: true  ,
        color: { argb: color || "000000" },
      };
      cell.alignment = { horizontal: "right" };
    
      const excelCol = worksheet.getColumn(index + 1);
      // Formato según tipo
      if (coincidencia.tipo === "NUMERO") {
        excelCol.numFmt = "#,##0";
      } else if (coincidencia.tipo === "DINERO") {
        excelCol.numFmt = '"$"#,##0.00;[Red]-"$"#,##0.00';
      }
    }
  });

  const totalFilas = worksheet.lastRow.number;
  const totalColumnas = columnasFiltradas.length;

  for (let i = 1; i <= totalFilas; i++) {
    const row = worksheet.getRow(i);
    for (let j = 1; j <= totalColumnas; j++) {
      const cell = row.getCell(j);
      cell.border = {
        top: { style: "thin", color: { argb: "000000" } },
        left: { style: "thin", color: { argb: "000000" } },
        bottom: { style: "thin", color: { argb: "000000" } },
        right: { style: "thin", color: { argb: "000000" } },
      };
    }
  }

  // Ajustar el ancho de las columnas según el contenido
  columnasFiltradas.forEach((col, colIndex) => {
    let maxLength = 0;

    // Verificar el contenido de las celdas en cada columna
    worksheet.eachRow({ includeEmpty: true }, (row) => {
      const cellValue = row.getCell(colIndex + 1).value;
      if (cellValue) {
        maxLength = Math.max(maxLength, cellValue.toString().length);
      }
    });

    // Ajustar el ancho de la columna considerando un margen adicional
    const adjustedWidth = maxLength + 2; // Puedes ajustar el número 2 para dar más espacio
    worksheet.getColumn(colIndex + 1).width = adjustedWidth;
  });

  const nombreExcel = obtenerNombreDisponible()
  await workbook.xlsx.writeFile(nombreExcel);
};

function numeroAColumnaExcel(numero) {
  let columna = "";
  while (numero > 0) {
    let resto = (numero - 1) % 26;
    columna = String.fromCharCode(65 + resto) + columna;
    numero = Math.floor((numero - 1) / 26);
  }
  return columna;
}

module.exports = { construirExcel };
