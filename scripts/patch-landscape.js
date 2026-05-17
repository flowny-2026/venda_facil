const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const root = path.join(__dirname, '..');
const indexPath = path.join(root, 'public', 'index.html');

// Restore UTF-8 from last good commit
const good = execSync('git show 30ca830:public/index.html', {
  cwd: root,
  encoding: 'utf8',
});
fs.writeFileSync(indexPath, good, 'utf8');

let c = fs.readFileSync(indexPath, 'utf8').replace(/\r\n/g, '\n');

c = c.replace(
  `        @media (max-width: 768px) {
            .logo-img {
                height: 56px;
            }
        }`,
  `        @media (max-width: 1024px), (max-height: 520px) {
            .logo-img {
                height: 48px;
            }
        }`
);

c = c.replace(
  `        /* Responsive */
        @media (max-width: 768px) {
            nav {
                padding: 0.75rem 1rem;
            }

            .nav-links {
                display: none;
            }

            .header-cta {
                display: none !important;
            }
            
            .mobile-menu-btn {
                display: flex;
                flex-shrink: 0;
            }
            
            .hero {
                padding: 100px 1.5rem 60px;
            }`,
  `        /* Header mobile: retrato, paisagem e tablets estreitos */
        @media (max-width: 1024px), (max-height: 520px) {
            nav {
                padding: 0.5rem 1rem;
            }

            .nav-links {
                display: none;
            }

            .header-cta {
                display: none !important;
            }

            .mobile-menu-btn {
                display: flex;
                flex-shrink: 0;
            }
        }

        /* Celular deitado (paisagem): hero mais compacto */
        @media (orientation: landscape) and (max-height: 520px) {
            .hero {
                padding: 72px 1.25rem 28px;
            }

            .hero h1 {
                font-size: 1.65rem;
                margin-bottom: 0.5rem;
            }

            .hero p {
                font-size: 0.85rem;
                margin-bottom: 1rem;
                line-height: 1.4;
            }

            .hero-buttons {
                flex-direction: row;
                flex-wrap: wrap;
                gap: 0.75rem;
            }

            .btn-primary,
            .btn-secondary {
                width: auto;
                padding: 0.6rem 1.1rem;
                font-size: 0.85rem;
            }
        }

        /* Responsive */
        @media (max-width: 768px) {
            .hero {
                padding: 100px 1.5rem 60px;
            }`
);

c = c.replace('                .mobile-nav-links {', '        .mobile-nav-links {');
c = c.replace('                .mobile-nav-cta {', '        .mobile-nav-cta {');

fs.writeFileSync(indexPath, c, 'utf8');
fs.writeFileSync(path.join(root, 'index.html'), c, 'utf8');

if (!c.includes('Começar Agora')) {
  console.error('Encoding check failed');
  process.exit(1);
}
console.log('Landscape patch OK');
