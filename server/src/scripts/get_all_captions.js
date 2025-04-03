import Utils from "../../../shared/Utils.js";
import Paths from "../lib/Paths.js";
import ServerUtils from "../utils/ServerUtils.js";
import fs from "fs";
import PDFDocument from "pdfkit";
import pdfParse from "pdf-parse";
import path from "path";

/* 
TO-DO: per funzionare bene deve

1. capire il profilo su quale lingua lavora (si mette nel json del profilo)
2. capire le caption dei post in che lingua sono per vedere quali sono le caption da tradurre (boh)
3. tradurre
4. aggiungere la traduzione
*/

function jsonToCaptionsPDF(jsonPath, outputPDFPath) {
    const data = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
    const captions = [];

    function extractCaptions(obj) {
        if (typeof obj === 'string') {
            captions.push(obj);
        } else if (typeof obj === 'object' && obj !== null) {
            Object.values(obj).forEach(extractCaptions);
        }
    }

    extractCaptions(data.instagram);

    const doc = new PDFDocument();
    console.log("creating pdf")
    doc.pipe(fs.createWriteStream(outputPDFPath));

    captions.forEach((caption, i) => {
        doc.text(caption, { align: 'left' });
        if (i !== captions.length - 1) {
            doc.moveDown();
            doc.text(SEPARATOR, { align: 'center' });
            doc.moveDown(1.5);
        }
    });

    doc.end();
}
async function pdfToCaptionsArray(pdfPath) {
    try {
        const buffer = fs.readFileSync(pdfPath);
        const data = await pdfParse(buffer);
        const text = data.text;

        // Split usando il separatore personalizzato
        const captions = text
            .split(SEPARATOR)
            .map(c => c.trim())
            .filter(c => c.length > 0);

        return captions;
    } catch (err) {
        console.error('Errore nella lettura del PDF:', err.message);
        return [];
    }
}
async function getLastDownloadedPdf(){
    let downloadsDir = "C:/Users/luca/Downloads";
    while( true ){
        const files = await fs.promises.readdir(downloadsDir);
        for( let file of files ){
            if( file.endsWith(".pdf") ){
                const filePath = path.join(downloadsDir, file);
                const stats = fs.statSync(filePath);
                const creationTs = parseInt(new Date(stats.birthtime).getTime()/1000)
                if( creationTs - SCRIPT_START > 0 ) return filePath;
            }
        }
        await Utils.sleep(500);
    }
}

let SCRIPT_START = Utils.nowInSecs();
let SEPARATOR = "!----------------!";
fs.writeFileSync(Paths.CAPTIONS_IN_PATH, "{}");


await ServerUtils.getAllLikedCaptionsNotTranslated();
jsonToCaptionsPDF(Paths.CAPTIONS_OUT_PATH, Paths.CAPTIONS_PDF_TO_TRANSLATE);
console.log("\n\n\n\n----- CAPTIONS FILE:\n\n"+Paths.CAPTIONS_PDF_TO_TRANSLATE+"\n\n-----\n\n\n\n");

let translationPdf = await getLastDownloadedPdf();
let translatedCaptions = await pdfToCaptionsArray(translationPdf);

console.log("Translated captions: ", translatedCaptions);

while(true){
    let json = null;
    try {
        json = JSON.parse(fs.readFileSync(Paths.CAPTIONS_IN_PATH))
    } catch (error) {
        await Utils.sleep(1000);
    }
    if(!json.lang) {
        console.log("[missing] Missing translation lang key");
        await Utils.sleep(1000);
        continue;
    }
    
    ServerUtils.addTranslatedCaptions(json);
}