const fs = require('fs');
const path = require('path');

const indexPath = path.join(__dirname, '..', 'public', 'index.html');
let c = fs.readFileSync(indexPath, 'utf8');
c = c.replace(/\r\n/g, '\n');

// Full-screen mobile menu CSS
c = c.replace(
  /\.mobile-nav-overlay \{[\s\S]*?\.mobile-nav-header \{[\s\S]*?border-bottom: 1px solid var\(--border-color\);\n        \}/,
  `        .mobile-nav-overlay {
            position: fixed;
            inset: 0;
            background: rgba(2, 6, 23, 0.85);
            backdrop-filter: blur(6px);
            z-index: 2000;
            opacity: 0;
            visibility: hidden;
            pointer-events: none;
            transition: opacity 0.3s ease, visibility 0.3s ease;
        }

        .mobile-nav-overlay.open {
            opacity: 1;
            visibility: visible;
            pointer-events: auto;
        }

        .mobile-nav {
            position: fixed;
            inset: 0;
            width: 100%;
            height: 100%;
            min-height: 100dvh;
            background: var(--bg-primary);
            z-index: 2001;
            padding: max(1.25rem, env(safe-area-inset-top)) 1.5rem max(2rem, env(safe-area-inset-bottom));
            display: flex;
            flex-direction: column;
            opacity: 0;
            visibility: hidden;
            pointer-events: none;
            transition: opacity 0.3s ease, visibility 0.3s ease;
            overflow: hidden;
        }

        .mobile-nav.open {
            opacity: 1;
            visibility: visible;
            pointer-events: auto;
        }

        .mobile-nav-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 2.5rem;
            padding-bottom: 1rem;
            border-bottom: 1px solid var(--border-color);
            flex-shrink: 0;
        }`
);

c = c.replace(
  /\.mobile-nav-links \{[\s\S]*?\.mobile-nav-links a:hover \{[\s\S]*?background: rgba\(59, 130, 246, 0\.1\);\n        \}/,
  `        .mobile-nav-links {
            list-style: none;
            display: flex;
            flex-direction: column;
            justify-content: center;
            flex: 1;
            gap: 0.5rem;
        }

        .mobile-nav-links a {
            display: block;
            padding: 1rem 0.75rem;
            color: var(--text-secondary);
            text-decoration: none;
            font-weight: 600;
            font-size: 1.25rem;
            border-radius: 10px;
            transition: all 0.2s ease;
        }

        .mobile-nav-links a:hover {
            color: var(--text-primary);
            background: rgba(59, 130, 246, 0.1);
        }`
);

c = c.replace(
  /\.mobile-nav-cta \{[\s\S]*?width: 100%;\n        \}/,
  `        .mobile-nav-cta {
            display: block;
            margin-top: 1rem;
            padding: 1rem 1.5rem !important;
            text-align: center;
            width: 100%;
            font-size: 1.1rem !important;
        }`
);

// Move menu outside header
const html1Old =
  '        </nav>\n        <div class="mobile-nav-overlay" id="mobileNavOverlay" aria-hidden="true"></div>';
const html1New =
  '        </nav>\n    </header>\n\n    <div class="mobile-nav-overlay" id="mobileNavOverlay" aria-hidden="true"></motion.div>'.replace(
    /<\/motion\.div>/,
    '</div>'
  );

if (!c.includes(html1Old)) {
  console.error('HTML block 1 not found');
  process.exit(1);
}
c = c.replace(html1Old, html1New);

const html2Old =
  '            </ul>\n        </nav>\n    </header>\n\n    <!-- Hero Section -->';
const html2New = '            </ul>\n    </nav>\n\n    <!-- Hero Section -->';

if (!c.includes(html2Old)) {
  console.error('HTML block 2 not found');
  process.exit(1);
}
c = c.replace(html2Old, html2New);

fs.writeFileSync(indexPath, c.replace(/\n/g, '\r\n'), 'utf8');
console.log('Patched:', indexPath);
