const fs = require('fs');
const path = require('path');

const projectRoot = path.resolve(__dirname, '..');
const envPath = path.join(projectRoot, '.env');
const outputPath = path.join(projectRoot, 'public', 'env.js');

function parseEnv(content) {
  return content
    .split(/\r?\n/)
    .reduce((acc, line) => {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) return acc;
      const index = trimmed.indexOf('=');
      if (index === -1) return acc;
      const key = trimmed.slice(0, index).trim();
      let value = trimmed.slice(index + 1).trim();
      if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
        value = value.slice(1, -1);
      }
      acc[key] = value;
      return acc;
    }, {});
}

let env = {};
if (fs.existsSync(envPath)) {
  env = parseEnv(fs.readFileSync(envPath, 'utf8'));
}

const supabaseUrl = env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = env.VITE_SUPABASE_ANON_KEY || '';

const content = `window.__env__ = {
  VITE_SUPABASE_URL: ${JSON.stringify(supabaseUrl)},
  VITE_SUPABASE_ANON_KEY: ${JSON.stringify(supabaseAnonKey)}
};\n`;

fs.writeFileSync(outputPath, content, 'utf8');
console.log(`Generated ${outputPath}`);
