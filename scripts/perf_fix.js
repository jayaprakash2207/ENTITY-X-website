const fs = require('fs');
const path = require('path');

const indexPath = path.join(__dirname, '..', 'frontend', 'public', 'index.html');
let html = fs.readFileSync(indexPath, 'utf8');

// 1. Remove backdrop-filter (huge performance killer)
html = html.replace(/backdrop-filter:[^;]+;/g, '');

// 2. Make backgrounds slightly more opaque since we removed blur
html = html.replace(/rgba\(5, 14, 26, 0\.4\)/g, 'rgba(5, 14, 26, 0.85)');
html = html.replace(/background:rgba\(0,3,10,\.8\)/g, 'background:rgba(0,3,10,.95)');
html = html.replace(/background:rgba\(0,0,0,\.4\)/g, 'background:rgba(0,0,0,.8)');
html = html.replace(/background:rgba\(0,0,0,\.5\)/g, 'background:rgba(0,0,0,.9)');
html = html.replace(/background:rgba\(0,2,5,\.8\)/g, 'background:rgba(0,2,5,.95)');

// 3. Optimize Custom Cursor to use transform instead of left/top for hardware acceleration
// Replace cursor CSS
html = html.replace(
  /#cur\{position:fixed;width:8px;height:8px;[^\}]+\}/,
  `#cur{position:fixed;top:0;left:0;width:8px;height:8px;background:var(--cyan);border-radius:50%;pointer-events:none;z-index:9999;mix-blend-mode:screen;transition:width .12s,height .12s,background .2s,opacity .2s;will-change:transform;}`
);
html = html.replace(
  /#cur-r\{position:fixed;width:36px;height:36px;[^\}]+\}/,
  `#cur-r{position:fixed;top:0;left:0;width:36px;height:36px;border:1px solid rgba(0,212,255,.5);border-radius:50%;pointer-events:none;z-index:9998;transition:width .12s,height .12s;will-change:transform;}`
);
// Replace cursor JS
html = html.replace(
  /let cx=0,cy=0,rx=0,ry=0;[\s\S]+?requestAnimationFrame\(loop\);\}\)\(\);/m,
  `let cx=0,cy=0,rx=0,ry=0;
document.addEventListener('mousemove',e=>{cx=e.clientX;cy=e.clientY;cur.style.transform=\`translate3d(\${cx-4}px,\${cy-4}px,0)\`;});
(function loop(){rx+=(cx-rx)*.2;ry+=(cy-ry)*.2;ring.style.transform=\`translate3d(\${rx-18}px,\${ry-18}px,0)\`;requestAnimationFrame(loop);})();`
);

// 4. Optimize Three.js Setup (Disable antialias, set solid background)
html = html.replace(
  /const renderer = new THREE\.WebGLRenderer\(\{canvas, alpha:true, antialias:true\}\);/,
  `const renderer = new THREE.WebGLRenderer({canvas, alpha:false, antialias:false, powerPreference: "high-performance"});\nrenderer.setClearColor(0x000305, 1);`
);

// 5. Reduce Particle count aggressively
html = html.replace(/const N = 2000;/, 'const N = 400;');

// 6. Simplify Geometry completely (Use fewer vertices everywhere)
html = html.replace(/new THREE\.SphereGeometry\(\.1,8,8\)/g, 'new THREE.BoxGeometry(.15,.15,.15)'); // Boxes are much cheaper than spheres
html = html.replace(/new THREE\.SphereGeometry\(\.1,6,6\)/g, 'new THREE.BoxGeometry(.15,.15,.15)'); 

// 7. Remove transparent overdraw from Torus/Rings
html = html.replace(
  /new THREE\.TorusGeometry\(2\+i\*0\.8, \.02, 6, 48\), new THREE\.MeshBasicMaterial\(\{color:0x00d4ff, transparent:true, opacity:\.3-i\*\.05\}\)/g,
  `new THREE.TorusGeometry(2+i*0.8, .02, 4, 24), new THREE.MeshBasicMaterial({color:0x00d4ff, wireframe:true})` // No transparency
);

// 8. Remove transparency from neural network lines
html = html.replace(
  /const edgeMat = new THREE\.LineBasicMaterial\(\{color:0x00d4ff,transparent:true,opacity:\.15\}\);/,
  `const edgeMat = new THREE.LineBasicMaterial({color:0x004488});`
);

// 9. Remove DNA transparency
html = html.replace(
  /new THREE\.CylinderGeometry\(\.03,\.03,2\.4,4\), new THREE\.MeshBasicMaterial\(\{color:0x00ff88,transparent:true,opacity:\.4\}\)/g,
  `new THREE.CylinderGeometry(.03,.03,2.4,3), new THREE.MeshBasicMaterial({color:0x004422})`
);

// 10. Disable Parallax
html = html.replace(
  /camera\.position\.x \+= \(mx\*0\.2 - camera\.position\.x\)\*0\.05;/g,
  `// camera parallax disabled for perf`
);
html = html.replace(
  /camera\.position\.y \+= \(-my\*0\.2 - camera\.position\.y\)\*0\.05;/g,
  `// camera parallax disabled for perf`
);

fs.writeFileSync(indexPath, html, 'utf8');
console.log('Aggressive performance optimizations applied.');
