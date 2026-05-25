const fs = require('fs');
const path = require('path');

function copyDir(src, dest) {
  fs.mkdirSync(dest, { recursive: true });
  const entries = fs.readdirSync(src, { withFileTypes: true });
  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);
    if (entry.isDirectory()) {
      copyDir(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

copyDir('admin-system/dist', 'public/admin');
copyDir('cliente-system/dist', 'public/cliente');

// Copiar assets públicos para as subpastas
copyDir('admin-system/public/assets', 'public/admin/assets');
copyDir('cliente-system/public/assets', 'public/cliente/assets');

console.log('Arquivos copiados com sucesso!');