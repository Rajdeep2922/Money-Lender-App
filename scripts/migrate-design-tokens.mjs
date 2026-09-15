/**
 * migrate-design-tokens.mjs
 * 
 * Automatically parses design tokens from DESIGN.md and synchronizes:
 * 1. CSS Variables in frontend/src/index.css (:root and .dark)
 * 2. Extended color palette, border radius, and box shadows in frontend/tailwind.config.js
 * 
 * Usage: node scripts/migrate-design-tokens.mjs
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

const DESIGN_FILE = path.join(rootDir, 'DESIGN.md');
const INDEX_CSS_FILE = path.join(rootDir, 'frontend', 'src', 'index.css');
const TAILWIND_CONFIG_FILE = path.join(rootDir, 'frontend', 'tailwind.config.js');

function parseDesignTokens(content) {
    const tokens = {
        colors: {},
        rounded: {},
        spacing: {}
    };

    // Extract colors block from YAML frontmatter
    const colorsMatch = content.match(/colors:\s*\n([\s\S]*?)(?=\n\w+:|$)/);
    if (colorsMatch) {
        const lines = colorsMatch[1].split('\n');
        for (const line of lines) {
            const m = line.match(/^\s*([a-zA-Z0-9_-]+):\s*["']?([^"'\n]+)["']?/);
            if (m) {
                tokens.colors[m[1]] = m[2].trim();
            }
        }
    }

    // Extract rounded block
    const roundedMatch = content.match(/rounded:\s*\n([\s\S]*?)(?=\n\w+:|$)/);
    if (roundedMatch) {
        const lines = roundedMatch[1].split('\n');
        for (const line of lines) {
            const m = line.match(/^\s*([a-zA-Z0-9_-]+):\s*["']?([^"'\n]+)["']?/);
            if (m) {
                tokens.rounded[m[1]] = m[2].trim();
            }
        }
    }

    // Extract spacing block
    const spacingMatch = content.match(/spacing:\s*\n([\s\S]*?)(?=\n\w+:|$)/);
    if (spacingMatch) {
        const lines = spacingMatch[1].split('\n');
        for (const line of lines) {
            const m = line.match(/^\s*([a-zA-Z0-9_-]+):\s*["']?([^"'\n]+)["']?/);
            if (m) {
                tokens.spacing[m[1]] = m[2].trim();
            }
        }
    }

    return tokens;
}

function generateCssVariables(tokens) {
    const c = tokens.colors;

    return `/* ==========================================================================
   CSS Variables for Theming (Synchronized from DESIGN.md Revolut Specification)
   ========================================================================== */
:root {
  /* Brand Primary */
  --color-primary: ${c['primary'] || '#494fdf'};
  --color-primary-bright: ${c['primary-bright'] || '#4f55f1'};
  --color-primary-deep: ${c['primary-deep'] || '#3a40c4'};
  --color-primary-hover: #4349cf;
  --color-primary-glow: rgba(73, 79, 223, 0.35);

  /* Canvas & Surfaces (Light Mode) */
  --color-canvas-light: ${c['canvas-light'] || '#ffffff'};
  --color-canvas-dark: ${c['canvas-dark'] || '#000000'};
  --color-surface-soft: ${c['surface-soft'] || '#f4f4f4'};
  --color-surface-card: ${c['surface-card'] || '#ffffff'};
  --color-surface-deep: ${c['surface-deep'] || '#0a0a0a'};
  --color-surface-elevated: ${c['surface-elevated'] || '#16181a'};
  --color-background: #f8f9fa;
  --color-surface: ${c['surface-card'] || '#ffffff'};

  /* Typography & Text */
  --color-ink: ${c['ink'] || '#191c1f'};
  --color-body: ${c['body'] || '#1f2226'};
  --color-charcoal: ${c['charcoal'] || '#3a3d40'};
  --color-mute: ${c['mute'] || '#505a63'};
  --color-ash: ${c['ash'] || '#5c5e60'};
  --color-stone: ${c['stone'] || '#8d969e'};
  --color-faint: ${c['faint'] || '#c9c9cd'};
  --color-text: ${c['ink'] || '#191c1f'};
  --color-text-secondary: ${c['mute'] || '#505a63'};

  /* Dividers & Borders */
  --color-hairline-light: ${c['hairline-light'] || '#e2e2e7'};
  --color-hairline-dark: ${c['hairline-dark'] || 'rgba(255,255,255,0.12)'};
  --color-hairline-strong: ${c['hairline-strong'] || '#191c1f'};
  --color-divider-soft: ${c['divider-soft'] || 'rgba(255,255,255,0.06)'};
  --color-border: ${c['hairline-light'] || '#e2e2e7'};

  /* Semantic Product Accents */
  --color-accent-teal: ${c['accent-teal'] || '#00a87e'};
  --color-accent-blue-link: ${c['accent-blue-link'] || '#376cd5'};
  --color-accent-light-blue: ${c['accent-light-blue'] || '#007bc2'};
  --color-accent-light-green: ${c['accent-light-green'] || '#428619'};
  --color-accent-green-text: ${c['accent-green-text'] || '#006400'};
  --color-accent-yellow: ${c['accent-yellow'] || '#b09000'};
  --color-accent-warning: ${c['accent-warning'] || '#ec7e00'};
  --color-accent-pink: ${c['accent-pink'] || '#e61e49'};
  --color-accent-danger: ${c['accent-danger'] || '#e23b4a'};
  --color-accent-deep-red: ${c['accent-deep-red'] || '#8b0000'};
  --color-accent-brown: ${c['accent-brown'] || '#936d62'};
  --color-link: ${c['link'] || '#376cd5'};

  /* Semantic UI Status Aliases */
  --color-success: ${c['accent-teal'] || '#00a87e'};
  --color-success-glow: rgba(0, 168, 126, 0.35);
  --color-warning: ${c['accent-warning'] || '#ec7e00'};
  --color-warning-glow: rgba(236, 126, 0, 0.35);
  --color-error: ${c['accent-danger'] || '#e23b4a'};
  --color-error-glow: rgba(226, 59, 74, 0.35);
  --color-info: ${c['accent-blue-link'] || '#376cd5'};
  --color-info-glow: rgba(55, 108, 213, 0.35);

  /* Gradients & Shadows */
  --gradient-primary: linear-gradient(135deg, ${c['primary'] || '#494fdf'} 0%, ${c['primary-bright'] || '#4f55f1'} 50%, #686ef7 100%);
  --gradient-surface: linear-gradient(145deg, #ffffff 0%, ${c['surface-soft'] || '#f4f4f4'} 100%);
  --shadow-glow: 0 0 20px rgba(73, 79, 223, 0.16);
}

.dark {
  /* Canvas & Surfaces (Dark Mode per DESIGN.md: canvas-dark: #000000) */
  --color-background: ${c['canvas-dark'] || '#000000'};
  --color-surface: ${c['surface-elevated'] || '#16181a'};
  --color-surface-card: ${c['surface-elevated'] || '#16181a'};

  /* Text (Dark Mode) */
  --color-text: ${c['on-dark'] || '#ffffff'};
  --color-text-secondary: ${c['on-dark-mute'] || 'rgba(255,255,255,0.72)'};

  /* Borders & Dividers */
  --color-border: ${c['hairline-dark'] || 'rgba(255,255,255,0.12)'};

  /* Gradients & Shadows */
  --gradient-surface: linear-gradient(145deg, ${c['surface-elevated'] || '#16181a'} 0%, ${c['surface-deep'] || '#0a0a0a'} 100%);
  --shadow-glow: 0 0 25px rgba(73, 79, 223, 0.28);
}`;
}

function updateIndexCss(indexCssContent, newVariablesBlock) {
    // Replace the :root { ... } and .dark { ... } blocks
    const pattern = /\/\* CSS Variables for theming \*\/[\s\S]*?\.dark\s*\{[\s\S]*?\n\}/;
    if (pattern.test(indexCssContent)) {
        return indexCssContent.replace(pattern, newVariablesBlock);
    }
    
    // Also check if already migrated
    const migratedPattern = /\/\* ==========================================================================\s*\n\s*CSS Variables for Theming[\s\S]*?\.dark\s*\{[\s\S]*?\n\}/;
    if (migratedPattern.test(indexCssContent)) {
        return indexCssContent.replace(migratedPattern, newVariablesBlock);
    }

    // Fallback: replace lines 16 to 48
    const lines = indexCssContent.split('\n');
    const rootStart = lines.findIndex(l => l.includes(':root {'));
    let darkEnd = -1;
    let insideDark = false;
    for (let i = rootStart; i < lines.length; i++) {
        if (lines[i].includes('.dark {')) insideDark = true;
        if (insideDark && lines[i].trim() === '}') {
            darkEnd = i;
            break;
        }
    }

    if (rootStart !== -1 && darkEnd !== -1) {
        lines.splice(rootStart, darkEnd - rootStart + 1, newVariablesBlock);
        return lines.join('\n');
    }

    throw new Error('Could not find CSS variables section in index.css');
}

function generateTailwindConfig(tokens) {
    const c = tokens.colors;
    const r = tokens.rounded;

    return `/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    darkMode: 'selector',
    theme: {
        extend: {
            colors: {
                primary: {
                    50: '#eef0fd',
                    100: '#dcdefb',
                    200: '#bcbef7',
                    300: '#9498f2',
                    400: '#6f74ec',
                    500: '${c['primary-bright'] || '#4f55f1'}',
                    600: '${c['primary'] || '#494fdf'}',
                    700: '${c['primary-deep'] || '#3a40c4'}',
                    800: '#2f349f',
                    900: '#272b7f',
                    DEFAULT: '${c['primary'] || '#494fdf'}',
                },
                brand: {
                    cobalt: '${c['primary'] || '#494fdf'}',
                    bright: '${c['primary-bright'] || '#4f55f1'}',
                    deep: '${c['primary-deep'] || '#3a40c4'}',
                },
                canvas: {
                    light: '${c['canvas-light'] || '#ffffff'}',
                    dark: '${c['canvas-dark'] || '#000000'}',
                },
                surface: {
                    soft: '${c['surface-soft'] || '#f4f4f4'}',
                    card: '${c['surface-card'] || '#ffffff'}',
                    deep: '${c['surface-deep'] || '#0a0a0a'}',
                    elevated: '${c['surface-elevated'] || '#16181a'}',
                    light: '${c['canvas-light'] || '#ffffff'}',
                    dark: '${c['surface-elevated'] || '#16181a'}',
                },
                hairline: {
                    light: '${c['hairline-light'] || '#e2e2e7'}',
                    dark: '${c['hairline-dark'] || 'rgba(255,255,255,0.12)'}',
                    strong: '${c['hairline-strong'] || '#191c1f'}',
                },
                ink: '${c['ink'] || '#191c1f'}',
                body: '${c['body'] || '#1f2226'}',
                charcoal: '${c['charcoal'] || '#3a3d40'}',
                mute: '${c['mute'] || '#505a63'}',
                accent: {
                    teal: '${c['accent-teal'] || '#00a87e'}',
                    blue: '${c['accent-blue-link'] || '#376cd5'}',
                    lightBlue: '${c['accent-light-blue'] || '#007bc2'}',
                    green: '${c['accent-light-green'] || '#428619'}',
                    yellow: '${c['accent-yellow'] || '#b09000'}',
                    warning: '${c['accent-warning'] || '#ec7e00'}',
                    pink: '${c['accent-pink'] || '#e61e49'}',
                    danger: '${c['accent-danger'] || '#e23b4a'}',
                    red: '${c['accent-deep-red'] || '#8b0000'}',
                    brown: '${c['accent-brown'] || '#936d62'}',
                },
            },
            borderRadius: {
                none: '${r['none'] || '0px'}',
                sm: '${r['sm'] || '8px'}',
                md: '${r['md'] || '12px'}',
                lg: '${r['lg'] || '20px'}',
                xl: '${r['xl'] || '28px'}',
                full: '${r['full'] || '9999px'}',
            },
            fontFamily: {
                sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
                display: ['Inter', 'system-ui', 'sans-serif'],
            },
            animation: {
                'fade-in': 'fadeIn 0.3s ease-out',
                'slide-up': 'slideUp 0.3s ease-out',
                'slide-down': 'slideDown 0.3s ease-out',
                'pulse-glow': 'pulseGlow 2s infinite',
                'shimmer': 'shimmer 1.5s infinite',
                'scale-in': 'scaleIn 0.2s ease-out',
                'bounce-subtle': 'bounceSubtle 0.5s ease-out',
            },
            keyframes: {
                fadeIn: {
                    '0%': { opacity: '0' },
                    '100%': { opacity: '1' },
                },
                slideUp: {
                    '0%': { transform: 'translateY(10px)', opacity: '0' },
                    '100%': { transform: 'translateY(0)', opacity: '1' },
                },
                slideDown: {
                    '0%': { transform: 'translateY(-10px)', opacity: '0' },
                    '100%': { transform: 'translateY(0)', opacity: '1' },
                },
                pulseGlow: {
                    '0%, 100%': { boxShadow: '0 0 8px rgba(73, 79, 223, 0.4)' },
                    '50%': { boxShadow: '0 0 20px rgba(73, 79, 223, 0.6)' },
                },
                shimmer: {
                    '0%': { backgroundPosition: '-200% 0' },
                    '100%': { backgroundPosition: '200% 0' },
                },
                scaleIn: {
                    '0%': { transform: 'scale(0.95)', opacity: '0' },
                    '100%': { transform: 'scale(1)', opacity: '1' },
                },
                bounceSubtle: {
                    '0%, 100%': { transform: 'translateY(0)' },
                    '50%': { transform: 'translateY(-4px)' },
                },
            },
            boxShadow: {
                'glow-primary': '0 0 20px rgba(73, 79, 223, 0.3)',
                'glow-success': '0 0 20px rgba(0, 168, 126, 0.3)',
                'glow-warning': '0 0 20px rgba(236, 126, 0, 0.3)',
                'glow-error': '0 0 20px rgba(226, 59, 74, 0.3)',
                'elevated': '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 10px 15px -3px rgba(0, 0, 0, 0.1)',
            },
            backgroundImage: {
                'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
                'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
            },
        },
    },
    plugins: [],
};
`;
}

export function runMigration() {
    console.log('🔄 Starting Design Token Migration...');
    console.log(`📖 Reading DESIGN.md from: ${DESIGN_FILE}`);

    if (!fs.existsSync(DESIGN_FILE)) {
        console.error(`❌ DESIGN.md not found at ${DESIGN_FILE}`);
        process.exit(1);
    }

    const designContent = fs.readFileSync(DESIGN_FILE, 'utf-8');
    const tokens = parseDesignTokens(designContent);

    const colorKeys = Object.keys(tokens.colors);
    console.log(`✅ Parsed ${colorKeys.length} color tokens and ${Object.keys(tokens.rounded).length} rounded tokens.`);

    // 1. Update frontend/src/index.css
    console.log(`🎨 Updating CSS Variables in ${INDEX_CSS_FILE}...`);
    const indexCssContent = fs.readFileSync(INDEX_CSS_FILE, 'utf-8');
    fs.writeFileSync(`${INDEX_CSS_FILE}.bak`, indexCssContent, 'utf-8'); // Backup

    const newCssVars = generateCssVariables(tokens);
    const updatedIndexCss = updateIndexCss(indexCssContent, newCssVars);
    fs.writeFileSync(INDEX_CSS_FILE, updatedIndexCss, 'utf-8');
    console.log('✅ Updated frontend/src/index.css successfully (backup created at .bak).');

    // 2. Update frontend/tailwind.config.js
    console.log(`⚙️  Updating Tailwind configuration in ${TAILWIND_CONFIG_FILE}...`);
    const tailwindContent = fs.readFileSync(TAILWIND_CONFIG_FILE, 'utf-8');
    fs.writeFileSync(`${TAILWIND_CONFIG_FILE}.bak`, tailwindContent, 'utf-8'); // Backup

    const updatedTailwind = generateTailwindConfig(tokens);
    fs.writeFileSync(TAILWIND_CONFIG_FILE, updatedTailwind, 'utf-8');
    console.log('✅ Updated frontend/tailwind.config.js successfully (backup created at .bak).');

    console.log('\n📊 Summary of migrated core color variables:');
    console.table([
        { Token: 'primary', Hex: tokens.colors['primary'], Role: 'Cobalt Brand Accent' },
        { Token: 'primary-bright', Hex: tokens.colors['primary-bright'], Role: 'Interactive Bright' },
        { Token: 'canvas-dark', Hex: tokens.colors['canvas-dark'], Role: 'Dark Canvas (True Black)' },
        { Token: 'canvas-light', Hex: tokens.colors['canvas-light'], Role: 'Light Canvas (White)' },
        { Token: 'surface-elevated', Hex: tokens.colors['surface-elevated'], Role: 'Dark Elevated Card' },
        { Token: 'surface-soft', Hex: tokens.colors['surface-soft'], Role: 'Light Soft Surface' },
        { Token: 'hairline-light', Hex: tokens.colors['hairline-light'], Role: 'Light Border / Divider' },
        { Token: 'hairline-dark', Hex: tokens.colors['hairline-dark'], Role: 'Dark Border / Divider' },
        { Token: 'accent-teal', Hex: tokens.colors['accent-teal'], Role: 'Success / Paid Status' },
        { Token: 'accent-warning', Hex: tokens.colors['accent-warning'], Role: 'Warning / Due Today' },
        { Token: 'accent-danger', Hex: tokens.colors['accent-danger'], Role: 'Error / Overdue' }
    ]);

    console.log('🎉 Migration completed successfully!\n');
}

// Execute if run directly
if (process.argv[1] === fileURLToPath(import.meta.url)) {
    runMigration();
}
