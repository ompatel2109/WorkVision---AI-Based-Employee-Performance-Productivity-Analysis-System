import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const sourceDir = "C:\\Users\\omdpa\\.gemini\\antigravity\\brain\\d79bbdf6-cf80-415c-a051-8b43ca8a2836";
const targetDir = path.join(process.cwd(), 'public', 'assets');

const icons = {
    "nexus_ai_logo_1769766073331.png": "logo.png",
    "modern_office_auth_bg_1769766092264.png": "auth-bg.png"
};

if (!fs.existsSync(targetDir)) {
    console.log(`Creating directory: ${targetDir}`);
    fs.mkdirSync(targetDir, { recursive: true });
}

for (const [src, dest] of Object.entries(icons)) {
    const srcPath = path.join(sourceDir, src);
    const destPath = path.join(targetDir, dest);

    if (fs.existsSync(srcPath)) {
        fs.copyFileSync(srcPath, destPath);
        console.log(`Copied ${src} to ${dest}`);
    } else {
        console.error(`Source missing: ${srcPath}`);
    }
}
