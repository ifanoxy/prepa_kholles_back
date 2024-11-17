import sharp from "sharp";
import fs from "fs";
import * as buffer from "node:buffer";

/**
 * Options de compression pour l'image.
 */
interface CompressionOptions {
    quality?: number; // Qualité de l'image (0 à 100).
    maxWidth?: number; // Largeur maximale de l'image.
    maxHeight?: number; // Hauteur maximale de l'image.
}

/**
 * Compresse une image à partir d'un buffer et retourne le buffer compressé.
 * @param inputBuffer - Le buffer de l'image à compresser.
 * @param options - Options de compression.
 * @returns Le buffer compressé de l'image.
 */
export async function compressImage(
    dataUriOrBuffer: Buffer | string,
    options: CompressionOptions = {}
): Promise<string> {
    const { quality = 80, maxWidth = 1024, maxHeight = 1024 } = options;

    try {
        // Si l'entrée est une data URI, on extrait le buffer et le type MIME
        let inputBuffer: Buffer;
        let mimeType: string;

        if (typeof dataUriOrBuffer === "string") {
            // Extraction du type MIME et des données Base64
            const match = dataUriOrBuffer.match(/^data:(image\/\w+);base64,/);
            if (!match) {
                throw new Error("Format de data URI invalide");
            }

            mimeType = match[1]; // Ex. "image/jpeg"
            inputBuffer = Buffer.from(dataUriOrBuffer.replace(/^data:image\/\w+;base64,/, ""), "base64");
        } else {
            throw new Error("Seules les data URIs avec métadonnées sont prises en charge.");
        }

        // Compression de l'image
        const compressedBuffer = await sharp(inputBuffer)
            .rotate()
            .resize({
                width: maxWidth,
                height: maxHeight,
                fit: sharp.fit.inside,
                withoutEnlargement: true,
            })
            .jpeg({ quality }) // Compresse en JPEG
            .toBuffer();

        // Retourne une nouvelle data URI en conservant le type MIME d'origine
        return `data:${mimeType};base64,${compressedBuffer.toString("base64")}`;
    } catch (error) {
        console.error("Erreur lors de la compression de l'image :", error);
        throw error;
    }
}