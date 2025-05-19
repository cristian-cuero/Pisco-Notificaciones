const multer = require("multer");
const fs = require("fs");
const { Router } = require("express");
const { P12Signer } = require("@signpdf/signer-p12");
const signpdf = require("@signpdf/signpdf").default;
const { plainAddPlaceholder } = require("@signpdf/placeholder-plain");
const verifyPDF = require("@ninja-labs/verify-pdf");
const routes = new Router();
//Es un middleware para Express que se usa para manejar multipart/form-dat
//Este objeto de configuración indica a multer que debe almacenar los archivos subidos en una carpeta llamada uploads en el directorio raíz del proyecto.
const upload = multer({ dest: "uploads/" });

routes.post("/Firmar", upload.single("file"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).send("No se subió ningún archivo");
    }
    //obtnerr El PDF
    const pdfPath = req.file.path;
    //ruta Del Certificado
    const certPath = "C:\\inetpub\\wwwroot\\Pisco-Notificaciones\\output.p12";
    

    // Leer el archivo PDF
    const pdfBuffer = fs.readFileSync(pdfPath);
    const certificateBuffer = fs.readFileSync(certPath);
    // Guardar el PDF firmado

    const signer = new P12Signer(certificateBuffer);

    const pdfWithPlaceholder = plainAddPlaceholder({
      pdfBuffer,
      reason: "The user is decalaring consent.",
      contactInfo: "signpdf@example.com",
      name: "PISCO COMPANY",
      location: "Free Text Str., Free World",
    });

    const signedPdf = await signpdf.sign(pdfWithPlaceholder, signer);
    const signedPdfPath = `signed_${req.file.originalname}`;
    fs.writeFileSync(signedPdfPath, signedPdf);

    // Limpiar archivos temporales
    // fs.unlinkSync(pdfPath);
    res.download(signedPdfPath, (err) => {
      if (err) {
        console.error(err);
      }
      fs.unlinkSync(signedPdfPath); // Borra el archivo firmado
    });
  } catch (error) {
    console.log("error :>> ", error);
    return res.status(500).send(error);
  }
});

routes.post("/Validar", upload.single("file"), async (req, res) => {
  if (!req.file) {
    return res.status(400).send("No se subió ningún archivo");
  }
  const pdfPath = req.file.path;
  const pdfBuffer = fs.readFileSync(pdfPath);

  try {
    const data = verifyPDF(pdfBuffer);

    
    fs.unlinkSync(pdfPath);
    if ("integrity" in data) {
      if (data.integrity){
        return res.status(200).send(true);
      }else{
        return res.status(500).send(false);
      }
      
    } else {
      return res.status(500).send(false);
    }
   
  } catch (error) {
    fs.unlinkSync(pdfPath);
    return res.status(500).send(false);
  }

  // Limpiar archivos temporales

  // if (signatures.length === 0) {
  //   return res.status(400).json({ valid: false, message: 'El PDF no está firmado.' });
  // }
});

module.exports = routes;
