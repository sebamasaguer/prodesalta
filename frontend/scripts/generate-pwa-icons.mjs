import sharp from "sharp";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const root = path.resolve(__dirname, "..");

const svgPath = path.join(root, "public", "icons", "icon.svg");
const icon192Path = path.join(root, "public", "icons", "icon-192.png");
const icon512Path = path.join(root, "public", "icons", "icon-512.png");

await sharp(svgPath).resize(192, 192).png().toFile(icon192Path);
await sharp(svgPath).resize(512, 512).png().toFile(icon512Path);

console.log("Iconos PWA generados correctamente.");