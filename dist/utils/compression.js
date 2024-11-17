"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.compressImage = compressImage;
const sharp_1 = __importDefault(require("sharp"));
/**
 * Compresse une image à partir d'un buffer et retourne le buffer compressé.
 * @param inputBuffer - Le buffer de l'image à compresser.
 * @param options - Options de compression.
 * @returns Le buffer compressé de l'image.
 */
async function compressImage(dataUriOrBuffer, options = {}) {
    const { quality = 80, maxWidth = 1024, maxHeight = 1024 } = options;
    try {
        // Si l'entrée est une data URI, on extrait le buffer et le type MIME
        let inputBuffer;
        let mimeType;
        if (typeof dataUriOrBuffer === "string") {
            // Extraction du type MIME et des données Base64
            const match = dataUriOrBuffer.match(/^data:(image\/\w+);base64,/);
            if (!match) {
                throw new Error("Format de data URI invalide");
            }
            mimeType = match[1]; // Ex. "image/jpeg"
            inputBuffer = Buffer.from(dataUriOrBuffer.replace(/^data:image\/\w+;base64,/, ""), "base64");
        }
        else {
            throw new Error("Seules les data URIs avec métadonnées sont prises en charge.");
        }
        // Compression de l'image
        const compressedBuffer = await (0, sharp_1.default)(inputBuffer)
            .rotate()
            .resize({
            width: maxWidth,
            height: maxHeight,
            fit: sharp_1.default.fit.inside,
            withoutEnlargement: true,
        })
            .jpeg({ quality }) // Compresse en JPEG
            .toBuffer();
        // Retourne une nouvelle data URI en conservant le type MIME d'origine
        return `data:${mimeType};base64,${compressedBuffer.toString("base64")}`;
    }
    catch (error) {
        console.error("Erreur lors de la compression de l'image :", error);
        throw error;
    }
}
