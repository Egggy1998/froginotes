/**
 * Regression check: floating frog bubble geometry
 * Run: node scripts/test-desktop-bubble.cjs
 * Exit 0 = pass, Exit 1 = fail
 *
 * Checks:
 *  1. bubbleWindow size >= minimum needed to contain circle + hover shadow
 *  2. bubble-move clamp uses correct margin (windowSize - 5)
 *  3. FloatingFrogWidget has outline-none on interactive div
 *  4. CSS desktop-mode has background: transparent
 *  5. BrowserWindow has frame: false, transparent: true, hasShadow: false
 */

const fs = require('fs');
const path = require('path');

let pass = true;
const errors = [];
const checks = [];

function check(name, ok, msg) {
  checks.push({ name, ok, msg });
  if (!ok) {
    pass = false;
    errors.push(`FAIL: ${name} — ${msg}`);
  }
}

// ── 1. Parse electron/main.cjs ──────────────────────────────────────────────
const mainPath = path.join(__dirname, '../electron/main.cjs');
const mainSrc = fs.readFileSync(mainPath, 'utf8');

// Extract bubbleWindow width/height
const widthMatch = mainSrc.match(/bubbleWindow\s*=\s*new BrowserWindow\(\{[\s\S]*?width:\s*(\d+)/);
const heightMatch = mainSrc.match(/bubbleWindow\s*=\s*new BrowserWindow\(\{[\s\S]*?height:\s*(\d+)/);
const bw = widthMatch ? parseInt(widthMatch[1]) : 0;
const bh = heightMatch ? parseInt(heightMatch[1]) : 0;

// Geometry: frog=62px, hover shadow: blur=30, offset-y=12
// Minimum window needed: frog/2 + 30(blur) + 12(offset-y) + frog/2 = 62 + 42 = 104 → window >= 2*73=146
const FROG = 62;
const HOVER_BLUR = 30;
const HOVER_OFFSET_Y = 12;
const MIN_WINDOW = 2 * (FROG / 2 + HOVER_BLUR + HOVER_OFFSET_Y); // 148

check(
  'bubbleWindow-width',
  bw >= MIN_WINDOW,
  `width=${bw}, need >=${MIN_WINDOW} to contain hover shadow without clipping`
);
check(
  'bubbleWindow-height',
  bh >= MIN_WINDOW,
  `height=${bh}, need >=${MIN_WINDOW} to contain hover shadow without clipping`
);

// Check frame:false, transparent:true in bubble block
const bubbleBlock = mainSrc.slice(mainSrc.indexOf('function createBubbleWindow'), mainSrc.indexOf('function createBubbleWindow') + 1000);
check('bubble-frame-false', /frame\s*:\s*false/.test(bubbleBlock), 'frame must be false');
check('bubble-transparent-true', /transparent\s*:\s*true/.test(bubbleBlock), 'transparent must be true');
check('bubble-hasShadow-false', /hasShadow\s*:\s*false/.test(bubbleBlock), 'hasShadow must be false (native shadow would cause rect)');

// Clamp margins
const clampMatches = [...mainSrc.matchAll(/sw\s*-\s*(\d+),\s*currX/g)];
const clampMatchY = [...mainSrc.matchAll(/sh\s*-\s*(\d+),\s*currY/g)];
const expectedClamp = bw - 5; // allow 5px padding inside workarea
if (clampMatches.length > 0) {
  const clampX = parseInt(clampMatches[0][1]);
  check(
    'bubble-move-clamp-x',
    clampX >= bw - 10 && clampX <= bw,
    `clamp x margin=${clampX}, expected ~${bw - 5} (windowWidth minus small margin)`
  );
}
if (clampMatchY.length > 0) {
  const clampY = parseInt(clampMatchY[0][1]);
  check(
    'bubble-move-clamp-y',
    clampY >= bh - 10 && clampY <= bh,
    `clamp y margin=${clampY}, expected ~${bh - 5} (windowHeight minus small margin)`
  );
}

// ── 2. Parse FloatingFrogWidget.tsx ─────────────────────────────────────────
const frogPath = path.join(__dirname, '../src/components/FloatingFrogWidget.tsx');
const frogSrc = fs.readFileSync(frogPath, 'utf8');

check(
  'FloatingFrogWidget-outline-none',
  frogSrc.includes('outline-none'),
  'Interactive div must have outline-none to prevent focus-rect square border'
);

// ── 3. Parse CSS ─────────────────────────────────────────────────────────────
const cssPath = path.join(__dirname, '../src/styles/index.css');
const cssSrc = fs.readFileSync(cssPath, 'utf8');

const desktopModeBlock = cssSrc.match(/body\.desktop-mode\s*\{([^}]+)\}/);
check(
  'css-desktop-mode-transparent',
  desktopModeBlock && desktopModeBlock[1].includes('transparent'),
  'body.desktop-mode must declare background: transparent'
);

// ── 4. App.tsx body style ────────────────────────────────────────────────────
const appPath = path.join(__dirname, '../src/App.tsx');
const appSrc = fs.readFileSync(appPath, 'utf8');
check(
  'App-body-transparent',
  appSrc.includes("backgroundColor = 'transparent'"),
  "App.tsx must set document.body.style.backgroundColor = 'transparent' in desktop mode"
);

// ── 5. index.html root transparent ──────────────────────────────────────────
const htmlPath = path.join(__dirname, '../index.html');
const htmlSrc = fs.readFileSync(htmlPath, 'utf8');
check(
  'html-root-transparent',
  htmlSrc.includes('background: transparent'),
  'index.html body/root must have background: transparent'
);

// ── Report ───────────────────────────────────────────────────────────────────
console.log('\nFROGI BUBBLE REGRESSION CHECK\n' + '='.repeat(50));
for (const c of checks) {
  console.log(`  [${c.ok ? 'PASS' : 'FAIL'}] ${c.name}${c.ok ? '' : '\n         → ' + c.msg}`);
}
console.log('='.repeat(50));

if (pass) {
  console.log('ALL CHECKS PASSED ✅\n');
  process.exit(0);
} else {
  console.log(`\n${errors.length} check(s) FAILED ❌`);
  errors.forEach(e => console.log('  ' + e));
  console.log();
  process.exit(1);
}
