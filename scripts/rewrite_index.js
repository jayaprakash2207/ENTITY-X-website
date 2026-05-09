const fs = require('fs');
const path = require('path');

const indexPath = path.join(__dirname, '..', 'frontend', 'public', 'index.html');

const htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Entity X — Digital Forensics AI Platform</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=Orbitron:wght@400;700;900&family=Rajdhani:wght@300;400;500;600&family=Share+Tech+Mono&display=swap" rel="stylesheet">
<!-- GSAP & Three.js -->
<script src="https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/gsap.min.js"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/ScrollTrigger.min.js"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/ScrollToPlugin.min.js"></script>
<style>
:root{
  --void:#000305;--deep:#010810;--surface:rgba(5, 14, 26, 0.4);
  --cyan:#00d4ff;--cyan2:#00ffea;--magenta:#ff0080;--gold:#ffd700;--green:#00ff88;--violet:#8b5cf6;
  --text:#e8f4ff;--muted:#6e9bbd;
  --mono:'Share Tech Mono',monospace;--display:'Orbitron',sans-serif;--body:'Rajdhani',sans-serif;
}
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}

html, body {
  margin: 0; padding: 0;
  width: 100%; height: 100%;
  background: var(--void); color: var(--text); font-family: var(--body);
  overflow: hidden; cursor: none;
}

/* SCROLL CONTAINER */
#scroll-container {
  height: 100vh;
  overflow-y: auto;
  scroll-snap-type: y mandatory;
  scrollbar-width: none; /* Firefox */
  position: relative;
  z-index: 10;
}
#scroll-container::-webkit-scrollbar { display: none; /* Chrome */ }

/* SLIDE */
.slide {
  min-height: 100vh; /* Changed from fixed 100vh to prevent overlap */
  width: 100vw;
  scroll-snap-align: start;
  scroll-snap-stop: always;
  display: flex;
  flex-direction: column;
  justify-content: center;
  position: relative;
  padding: 120px 8vw 80px 8vw; /* Added padding to clear nav and footer */
}

/* CURSOR */
#cur{position:fixed;width:8px;height:8px;background:var(--cyan);border-radius:50%;pointer-events:none;z-index:9999;transform:translate(-50%,-50%);mix-blend-mode:screen;transition:width .12s,height .12s,background .2s,opacity .2s;}
#cur-r{position:fixed;width:36px;height:36px;border:1px solid rgba(0,212,255,.5);border-radius:50%;pointer-events:none;z-index:9998;transform:translate(-50%,-50%);}
#cur-r.h{width:52px;height:52px;border-color:var(--magenta);border-style:dashed;}

/* CANVAS */
#c{position:fixed;top:0;left:0;width:100%;height:100%;z-index:1;pointer-events:none;}

/* OVERLAYS */
.scan{position:fixed;inset:0;background:repeating-linear-gradient(0deg,transparent,transparent 2px,rgba(0,0,0,.04) 2px,rgba(0,0,0,.04) 4px);pointer-events:none;z-index:2;}
.vig{position:fixed;inset:0;background:radial-gradient(ellipse at center,transparent 20%,rgba(0,3,5,.98) 100%);pointer-events:none;z-index:3;}

/* NAV */
nav{position:fixed;top:0;left:0;right:0;z-index:100;padding:20px 52px;display:flex;align-items:center;justify-content:space-between;background:linear-gradient(180deg, rgba(0,3,5,.95) 0%, transparent 100%);}
.nlogo{font-family:var(--display);font-size:16px;font-weight:900;letter-spacing:6px;color:#fff;text-decoration:none;display:flex;align-items:center;gap:8px;}
.nlogo .x{color:var(--cyan);text-shadow:0 0 16px var(--cyan),0 0 40px rgba(0,212,255,.4);}
.npls{width:6px;height:6px;background:var(--green);border-radius:50%;box-shadow:0 0 8px var(--green);animation:pls 2s infinite;}
@keyframes pls{0%,100%{transform:scale(1);opacity:1}50%{transform:scale(1.8);opacity:.3}}
.nlinks{display:flex;gap:32px;list-style:none;}
.nlinks a{font-family:var(--mono);font-size:10px;color:var(--muted);text-decoration:none;letter-spacing:3px;text-transform:uppercase;transition:color .2s;cursor:none;}
.nlinks a:hover, .nlinks a.active{color:var(--cyan);}
.ndl{font-family:var(--mono);font-size:10px;letter-spacing:2px;text-transform:uppercase;border:1px solid rgba(0,212,255,.3);color:var(--cyan);padding:8px 20px;background:rgba(0,212,255,.05);backdrop-filter:blur(10px);cursor:none;text-decoration:none;transition:all .3s;position:relative;overflow:hidden;}
.ndl::before{content:'';position:absolute;inset:0;background:var(--cyan);transform:scaleX(0);transform-origin:left;transition:transform .3s;}
.ndl:hover::before{transform:scaleX(1);}
.ndl:hover{color:#000;box-shadow: 0 0 20px rgba(0,212,255,.4);}
.ndl span{position:relative;z-index:1;}

/* PAGINATION DOTS */
.pagination {
  position: fixed;
  right: 30px;
  top: 50%;
  transform: translateY(-50%);
  z-index: 100;
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.dot {
  width: 6px; height: 6px;
  border-radius: 50%;
  background: rgba(255,255,255,0.2);
  cursor: none;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
}
.dot::after {
  content: '';
  position: absolute; inset: -6px; border-radius: 50%;
  border: 1px solid var(--cyan);
  opacity: 0; transform: scale(0.5);
  transition: all 0.3s;
}
.dot:hover { background: rgba(255,255,255,0.6); }
.dot.active { background: var(--cyan); box-shadow: 0 0 10px var(--cyan); }
.dot.active::after { opacity: 1; transform: scale(1); }

/* SLIDE 1: HERO */
.heyebrow{display:inline-flex;align-items:center;gap:10px;font-family:var(--mono);font-size:10px;color:var(--green);letter-spacing:3px;text-transform:uppercase;margin-bottom:20px;}
.heyebrow::before{content:'';width:20px;height:1px;background:var(--green);box-shadow:0 0 8px var(--green);}
.htitle{font-family:var(--display);font-weight:900;font-size:clamp(40px,7vw,90px);line-height:1;letter-spacing:1px; margin-bottom:24px;}
.htitle .l1,.htitle .l2{display:block;color:#fff;}
.htitle .l3{display:block;background:linear-gradient(90deg,var(--cyan) 0%,var(--magenta) 50%,var(--gold) 100%);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;filter:drop-shadow(0 0 20px rgba(0,212,255,.3));}
.hsub{max-width:600px;font-size:16px;line-height:1.6;color:var(--muted);font-weight:400;margin-bottom:40px;}
.hctas{display:flex;gap:20px;align-items:center;flex-wrap:wrap;}
.bglow{display:inline-flex;align-items:center;gap:10px;background:linear-gradient(135deg,var(--cyan),#0055ff);color:#000;font-family:var(--mono);font-size:11px;letter-spacing:2px;text-transform:uppercase;text-decoration:none;padding:16px 36px;font-weight:700;position:relative;overflow:hidden;clip-path:polygon(12px 0,100% 0,calc(100% - 12px) 100%,0 100%);transition:all .3s;}
.bglow::before{content:'';position:absolute;inset:0;background:linear-gradient(135deg,var(--gold),var(--magenta));opacity:0;transition:opacity .3s;}
.bglow:hover::before{opacity:1;}
.bglow:hover{transform:translateY(-2px);box-shadow:0 15px 40px rgba(0,212,255,.4);}
.bglow svg,.bglow span{position:relative;z-index:1;}
.bgh{font-family:var(--mono);font-size:10px;letter-spacing:2px;text-transform:uppercase;color:rgba(0,212,255,.6);text-decoration:none;padding:12px 0;border-bottom:1px solid rgba(0,212,255,.18);display:inline-flex;align-items:center;gap:8px;transition:all .2s;}
.bgh:hover{color:var(--cyan);border-color:var(--cyan);}

/* SECTION HEADERS */
.seye{font-family:var(--mono);font-size:10px;color:var(--cyan);letter-spacing:3px;text-transform:uppercase;margin-bottom:16px;display:flex;align-items:center;gap:10px;}
.seye::before{content:'';width:24px;height:1px;background:var(--cyan);box-shadow:0 0 8px var(--cyan);}
.stitle{font-family:var(--display);font-size:clamp(32px,4.5vw,60px);font-weight:900;line-height:1;letter-spacing:1px;color:#fff;margin-bottom:16px;}
.stitle em{background:linear-gradient(90deg,var(--cyan),var(--cyan2));-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;font-style:normal;}
.sdesc{font-size:15px;color:var(--muted);max-width:550px;line-height:1.6;}

/* SLIDE 2: FEATURES */
.fgrid{display:grid;grid-template-columns:repeat(3,1fr);gap:16px;margin-top:40px;}
.fcard{position:relative;padding:28px 24px;background:var(--surface);backdrop-filter:blur(8px);border:1px solid rgba(0,212,255,.1);border-radius:6px;transition:all .2s;}
.fcard::before{content:'';position:absolute;top:0;left:0;right:0;height:2px;background:linear-gradient(90deg,transparent,var(--cyan),transparent);transform:scaleX(0);transition:transform .3s;}
.fcard:hover::before{transform:scaleX(1);}
.fcard:hover{transform:translateY(-5px);box-shadow:0 10px 30px rgba(0,0,0,.5), inset 0 0 0 1px rgba(0,212,255,.2); background:rgba(0,3,10,.8);}
.ficn{width:48px;height:48px;border-radius:8px;background:linear-gradient(135deg, rgba(0,212,255,.1), rgba(0,0,0,0));border:1px solid rgba(0,212,255,.2);display:flex;align-items:center;justify-content:center;font-size:20px;margin-bottom:16px;}
.fnum{position:absolute;top:16px;right:20px;font-family:var(--mono);font-size:10px;color:rgba(255,255,255,.15);letter-spacing:2px;}
.fh{font-family:var(--display);font-size:14px;font-weight:700;letter-spacing:1px;color:#fff;margin-bottom:8px;}
.fp{font-size:13px;color:var(--muted);line-height:1.5;}
.ftag{margin-top:16px;display:inline-block;padding:4px 8px;background:rgba(0,255,136,.05);border:1px solid rgba(0,255,136,.2);border-radius:4px;font-family:var(--mono);font-size:9px;color:var(--green);letter-spacing:1px;text-transform:uppercase;}

/* SLIDE 3: MODELS */
.models-content { display: flex; gap: 40px; align-items: center; flex-wrap: wrap; }
.models-left { flex: 1; min-width: 300px; }
.models-right { flex: 1; min-width: 300px; }
.mgrid{display:flex; flex-direction: column; gap: 12px; margin-top: 30px;}
.mc{background:var(--surface);backdrop-filter:blur(8px);padding:20px 24px;border-radius:6px;border:1px solid rgba(255,255,255,.05);position:relative;overflow:hidden;transition:all .2s;}
.mc:hover{background:rgba(0,212,255,.05); border-color: rgba(0,212,255,.2); transform:translateX(5px);}
.mchd{display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:12px;}
.mname{font-family:var(--mono);font-size:11px;color:#fff;letter-spacing:1px;}
.mtype{font-family:var(--mono);font-size:9px;color:var(--muted);letter-spacing:1px;text-transform:uppercase;margin-top:4px;}
.mpct{font-family:var(--display);font-size:24px;font-weight:900;background:linear-gradient(135deg,var(--cyan),var(--cyan2));-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;}
.mbar{height:2px;background:rgba(255,255,255,.05);border-radius:1px;overflow:hidden;}
.mfill{height:100%;background:linear-gradient(90deg,var(--cyan),var(--magenta));width:0;}

.console{background:rgba(0,2,5,.8);backdrop-filter:blur(10px);border:1px solid rgba(0,212,255,.15);border-radius:6px;overflow:hidden;box-shadow: 0 20px 40px rgba(0,0,0,0.6);}
.cbar{background:rgba(0,212,255,.05);border-bottom:1px solid rgba(0,212,255,.1);padding:10px 16px;display:flex;align-items:center;gap:6px;}
.cdot{width:10px;height:10px;border-radius:50%;}
.cdot:nth-child(1){background:#ff5f56;}.cdot:nth-child(2){background:#ffbd2e;}.cdot:nth-child(3){background:#27c93f;}
.ctit{font-family:var(--mono);font-size:9px;color:var(--muted);letter-spacing:2px;margin-left:auto;}
.cbody{padding:24px 30px;}
.cln{font-family:var(--mono);font-size:11px;line-height:2;display:block;}
.cln .pr{color:var(--cyan);}.cln .ok{color:var(--green);}.cln .w{color:var(--gold);}.cln .er{color:var(--magenta);}.cln .d{color:var(--muted);}.cln .b{color:#fff;font-weight:bold;}

/* SLIDE 4: TRUST */
.tin{display:grid;grid-template-columns:1fr 1fr;gap:60px;align-items:center;}
@media (max-width: 900px) { .tin { grid-template-columns: 1fr; gap: 40px; } }
.hcard{position:relative;}
.hin{background:linear-gradient(135deg,rgba(0,212,255,.06),rgba(255,0,128,.03),rgba(0,212,255,.06));backdrop-filter:blur(10px);border:1px solid rgba(0,212,255,.2);border-radius:8px;padding:40px;position:relative;overflow:hidden;}
.hs{font-family:var(--display);font-size:80px;font-weight:900;line-height:1;color:#fff;position:relative;z-index:1;text-shadow: 0 0 20px rgba(255,255,255,0.2);}
.hsl{font-family:var(--mono);font-size:10px;color:var(--green);letter-spacing:3px;text-transform:uppercase;margin:8px 0 24px;position:relative;z-index:1;}
.hbars{display:flex;gap:4px;margin-bottom:24px;position:relative;z-index:1;}
.hb{flex:1;height:4px;background:rgba(255,255,255,.05);border-radius:2px;}
.hb.on{background:linear-gradient(90deg,var(--cyan),var(--green));box-shadow: 0 0 8px var(--cyan);}
.hlvs{display:flex;flex-direction:column;gap:8px;position:relative;z-index:1;}
.hlv{display:flex;justify-content:space-between;align-items:center;font-family:var(--mono);font-size:10px;color:var(--muted);letter-spacing:1px;padding:8px 0;border-bottom:1px solid rgba(255,255,255,.05);}
.hlvl{display:flex;align-items:center;gap:10px;}
.hd{width:8px;height:8px;border-radius:50%;flex-shrink:0;}
.tform{margin-top:30px;background:rgba(0,0,0,.4);backdrop-filter:blur(8px);border:1px solid rgba(0,212,255,.1);border-radius:6px;padding:16px 20px;font-family:var(--mono);font-size:12px;line-height:2;color:var(--muted);}
.tform .op{color:var(--cyan);}.tform .val{color:#fff;}.tform .note{font-size:9px;color:rgba(110,155,189,.5);letter-spacing:2px;text-transform:uppercase;}

/* SLIDE 5: HOW */
.hwsteps{display:grid;grid-template-columns:repeat(4,1fr);gap:24px;margin-top:50px;position:relative;}
.hwline { position: absolute; top: 30px; left: 40px; right: 40px; height: 1px; background: rgba(0,212,255,.1); z-index: 0; }
.hwline-fill { position: absolute; top: 0; left: 0; height: 100%; width: 0%; background: linear-gradient(90deg, var(--cyan), var(--magenta)); }
.hws{position:relative;z-index:1;}
.hwn{width:60px;height:60px;border-radius:50%;border:1px solid rgba(0,212,255,.2);display:flex;align-items:center;justify-content:center;font-family:var(--display);font-size:24px;font-weight:900;background:var(--void);margin-bottom:20px;color:#fff;transition:all .3s;}
.hws:hover .hwn{border-color:var(--cyan);color:var(--cyan);box-shadow:0 0 20px rgba(0,212,255,.3);transform:scale(1.05);}
.hwt{font-family:var(--display);font-size:16px;font-weight:700;letter-spacing:1px;color:#fff;margin-bottom:10px;}
.hwd{font-size:13px;color:var(--muted);line-height:1.6;}

/* SLIDE 6: DOWNLOAD */
.dlsec { text-align: center; align-items: center; }
.dltit{font-family:var(--display);font-size:clamp(40px,7vw,90px);font-weight:900;line-height:1;letter-spacing:2px;color:#fff;margin-bottom:24px;}
.dltit em{background:linear-gradient(90deg,var(--cyan),var(--magenta),var(--gold));-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;font-style:normal; filter:drop-shadow(0 0 20px rgba(255,0,128,.3));}
.dlsub{font-family:var(--mono);font-size:11px;color:var(--muted);letter-spacing:3px;text-transform:uppercase;margin-bottom:40px;}
.dlbtn{display:inline-flex;align-items:center;gap:12px;font-family:var(--mono);font-size:12px;letter-spacing:3px;text-transform:uppercase;color:#000;text-decoration:none;padding:20px 48px;background:linear-gradient(135deg,var(--cyan),#3399ff);clip-path:polygon(16px 0,100% 0,calc(100% - 16px) 100%,0 100%);font-weight:700;transition:all .3s;overflow:hidden;}
.dlbtn::before{content:'';position:absolute;inset:0;background:linear-gradient(135deg,var(--gold),var(--magenta));opacity:0;transition:opacity .3s;}
.dlbtn:hover::before{opacity:1;}
.dlbtn:hover{transform:translateY(-3px);box-shadow:0 20px 60px rgba(0,212,255,.4);}
.dlbtn svg,.dlbtn span{position:relative;z-index:1;}
.dlmeta{margin-top:30px;display:flex;justify-content:center;gap:24px;flex-wrap:wrap;}
.dlmi{font-family:var(--mono);font-size:10px;color:var(--muted);letter-spacing:2px;text-transform:uppercase;display:flex;align-items:center;gap:6px;}
.dlmi::before{content:'✓';color:var(--green);font-weight:bold;}
.dlrow{margin-top:40px;display:flex;justify-content:center;gap:12px;}
.dlg{font-family:var(--mono);font-size:10px;letter-spacing:2px;text-transform:uppercase;color:var(--muted);text-decoration:none;border:1px solid rgba(255,255,255,.1);padding:10px 20px;border-radius:4px;transition:all .2s;}
.dlg:hover{border-color:var(--cyan);color:var(--cyan);background:rgba(0,212,255,.05);}

footer{position:absolute;bottom:0;left:0;right:0;padding:24px 52px;display:flex;align-items:center;justify-content:space-between;border-top:1px solid rgba(255,255,255,.05);background:rgba(0,0,0,.5);backdrop-filter:blur(8px);}
.flogo{font-family:var(--display);font-size:14px;font-weight:900;letter-spacing:4px;color:rgba(255,255,255,.4);}
.flogo span{color:var(--cyan);}
.flinks{display:flex;gap:24px;list-style:none;}
.flinks a{font-family:var(--mono);font-size:9px;color:var(--muted);text-decoration:none;letter-spacing:2px;text-transform:uppercase;transition:color .2s;}
.flinks a:hover{color:var(--cyan);}
.fcopy{font-family:var(--mono);font-size:9px;color:rgba(110,155,189,.4);letter-spacing:1px;}

/* RESPONSIVE Adjustments for smaller screens */
@media (max-width: 1024px) {
  .slide { padding: 100px 4vw 60px 4vw; }
  .fgrid { grid-template-columns: repeat(2, 1fr); gap: 12px; }
  .hwsteps { grid-template-columns: repeat(2, 1fr); gap: 20px; }
  .hwline { display: none; }
  .tin { grid-template-columns: 1fr; gap: 30px; }
}
@media (max-width: 768px) {
  .fgrid { grid-template-columns: 1fr; }
  .hwsteps { grid-template-columns: 1fr; }
  .nlinks { display: none; }
  .pagination { display: none; }
  .slide { scroll-snap-align: none; } /* Disable snap on mobile for smoother scrolling if content is too tall */
}
</style>
</head>
<body>

<canvas id="c"></canvas>
<div class="scan"></div>
<div class="vig"></div>
<div id="cur"></div>
<div id="cur-r"></div>

<nav>
  <a href="#" class="nlogo">ENTITY <span class="x">X</span><div class="npls"></div></a>
  <ul class="nlinks">
    <li><a href="#s-hero" class="nav-link active">Home</a></li>
    <li><a href="#s-features" class="nav-link">Features</a></li>
    <li><a href="#s-models" class="nav-link">AI Stack</a></li>
    <li><a href="#s-trust" class="nav-link">Trust Score</a></li>
    <li><a href="#s-how" class="nav-link">Process</a></li>
  </ul>
  <a href="#s-download" class="ndl nav-link"><span>↓ Download v1.5</span></a>
</nav>

<div class="pagination">
  <div class="dot active" data-target="#s-hero"></div>
  <div class="dot" data-target="#s-features"></div>
  <div class="dot" data-target="#s-models"></div>
  <div class="dot" data-target="#s-trust"></div>
  <div class="dot" data-target="#s-how"></div>
  <div class="dot" data-target="#s-download"></div>
</div>

<div id="scroll-container">

  <!-- SLIDE 1: HERO -->
  <section class="slide" id="s-hero">
    <div class="gsap-hero">
      <div class="heyebrow"><span class="npls"></span> v1.5.0 · Windows x64 · Live Cloud Backend</div>
      <h1 class="htitle">
        <span class="l1 gsap-title">DIGITAL</span>
        <span class="l2 gsap-title">FORENSICS</span>
        <span class="l3 gsap-title">REDEFINED BY AI</span>
      </h1>
      <p class="hsub gsap-sub">Entity X silently wraps a live browser in a real-time AI monitoring layer — detecting deepfakes, AI-generated content, and misinformation as you browse. No setup. No expertise required.</p>
      <div class="hctas gsap-sub">
        <a href="#s-download" class="bglow nav-link">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M12 16l-6-6h4V4h4v6h4l-6 6zM4 20h16v-2H4v2z"/></svg>
          <span>Download for Windows</span>
        </a>
        <a href="https://github.com/jayaprakash2207/ENTITY-X" class="bgh" target="_blank">View Source on GitHub →</a>
      </div>
    </div>
  </section>

  <!-- SLIDE 2: FEATURES -->
  <section class="slide" id="s-features">
    <div class="gsap-feat-header">
      <div class="seye">Core Capabilities</div>
      <h2 class="stitle">WHAT ENTITY <em>X</em><br>DEFENDS YOU FROM</h2>
      <p class="sdesc">A complete forensic intelligence stack — from image deepfake detection to legal complaint generation.</p>
    </div>
    <div class="fgrid">
      <div class="fcard gsap-fcard"><span class="fnum">01</span><div class="ficn">🖼️</div><div class="fh">IMAGE DEEPFAKES</div><p class="fp">5-model ensemble: ViT (99.3%), SwinV2, UniversalFakeDetect. Whistleblower rule enforced.</p><div class="ftag">✓ 99.3% accuracy</div></div>
      <div class="fcard gsap-fcard"><span class="fnum">02</span><div class="ficn">📰</div><div class="fh">ARTICLE FORENSICS</div><p class="fp">Gemini 2.0 Flash analyzes credibility, bias, and source verification in real-time.</p><div class="ftag">✓ Real-time AI</div></div>
      <div class="fcard gsap-fcard"><span class="fnum">03</span><div class="ficn">🤖</div><div class="fh">AI TEXT DETECTION</div><p class="fp">RoBERTa classifier + statistical burstiness to find AI-written content anywhere.</p><div class="ftag">✓ ChatGPT-detector</div></div>
      <div class="fcard gsap-fcard"><span class="fnum">04</span><div class="ficn">⚖️</div><div class="fh">LEGAL AI ENGINE</div><p class="fp">Auto-generates legal complaints and packages evidence. Legal chat via DeepSeek R1.</p><div class="ftag">✓ PDF export</div></div>
      <div class="fcard gsap-fcard"><span class="fnum">05</span><div class="ficn">🔔</div><div class="fh">REAL-TIME ALERTS</div><p class="fp">Silent monitoring fires instant alert toasts the moment any threat is detected.</p><div class="ftag">✓ Background monitor</div></div>
      <div class="fcard gsap-fcard"><span class="fnum">06</span><div class="ficn">🗺️</div><div class="fh">THREAT INTELLIGENCE</div><p class="fp">Domain intelligence, live threat map, case management, community tracking.</p><div class="ftag">✓ Live Watchlist</div></div>
    </div>
  </section>

  <!-- SLIDE 3: MODELS -->
  <section class="slide" id="s-models">
    <div class="models-content">
      <div class="models-left gsap-mod-left">
        <div class="seye">AI Stack</div>
        <h2 class="stitle">THE MODELS<br>BEHIND THE <em>TRUTH</em></h2>
        <p class="sdesc">No single model. No single point of failure. A multi-model ensemble.</p>
        <div class="mgrid">
          <div class="mc"><div class="mchd"><div><div class="mname">ViT · deepfake_vs_real</div><div class="mtype">Vision Transformer</div></div><div class="mpct">99.3%</div></div><div class="mbar"><div class="mfill" data-w="99.3%"></div></div></div>
          <div class="mc"><div class="mchd"><div><div class="mname">SwinV2 · ai-detector</div><div class="mtype">Shifted Window Transformer</div></div><div class="mpct">98.1%</div></div><div class="mbar"><div class="mfill" data-w="98.1%"></div></div></div>
          <div class="mc"><div class="mchd"><div><div class="mname">UniversalFakeDetect</div><div class="mtype">CVPR 2023 SOTA</div></div><div class="mpct" style="color:var(--gold);-webkit-text-fill-color:var(--gold);">SOTA</div></div><div class="mbar"><div class="mfill" style="background:var(--gold);" data-w="96%"></div></div></div>
        </div>
      </div>
      <div class="models-right gsap-mod-right">
        <div class="console">
          <div class="cbar"><div class="cdot"></div><div class="cdot"></div><div class="cdot"></div><div class="ctit">ENTITY-X TERMINAL</div></div>
          <div class="cbody">
            <span class="cln"><span class="pr">entity-x</span> scan --image suspect.jpg</span>
            <span class="cln"><span class="ok">✓</span> <span class="d">ViT ready · 5-model init</span></span>
            <span class="cln">&nbsp;</span>
            <span class="cln"><span class="w">⚡</span> ViT:        <span class="er">96.4% FAKE</span></span>
            <span class="cln"><span class="w">⚡</span> SwinV2:     <span class="er">91.7% FAKE</span></span>
            <span class="cln"><span class="w">⚡</span> CLIP:       <span class="er">79.1% FAKE</span></span>
            <span class="cln">&nbsp;</span>
            <span class="cln"><span class="pr">›</span> Final:  <span class="b">🔴 DEEPFAKE CONFIRMED</span></span>
            <span class="cln"><span class="pr">›</span> Trust:  <span class="er">-96 pts</span> <span class="d">[CRITICAL]</span></span>
          </div>
        </div>
      </div>
    </div>
  </section>

  <!-- SLIDE 4: TRUST -->
  <section class="slide" id="s-trust">
    <div class="tin">
      <div class="gsap-trust-left">
        <div class="seye">Trust System</div>
        <h2 class="stitle">SESSION<br><em>INTEGRITY</em><br>IN REAL-TIME</h2>
        <p class="sdesc">Every session starts at 100/100. As you encounter suspicious content, your Trust Score degrades.</p>
        <div class="tform">
          <div><span style="color:var(--cyan)">trust_score</span> <span class="op">-=</span> <span class="val">fake_prob</span> <span class="op">×</span> <span class="val">100</span></div>
          <div class="note">clamped 0–100 · per detection</div>
        </div>
      </div>
      <div class="hcard gsap-trust-right">
        <div class="hin">
          <div style="font-family:var(--mono);font-size:10px;color:var(--muted);letter-spacing:3px;text-transform:uppercase;margin-bottom:8px;position:relative;z-index:2;">// SESSION SCORE</div>
          <div class="hs">87</div>
          <div class="hsl">HIGH INTEGRITY</div>
          <div class="hbars"><div class="hb on"></div><div class="hb on"></div><div class="hb on"></div><div class="hb on"></div><div class="hb"></div></div>
          <div class="hlvs">
            <div class="hlv"><div class="hlvl"><div class="hd" style="background:#22c55e;"></div>90–100 · High</div></div>
            <div class="hlv"><div class="hlvl"><div class="hd" style="background:#eab308;"></div>70–89 · Moderate</div></div>
            <div class="hlv"><div class="hlvl"><div class="hd" style="background:#f97316;"></div>50–69 · Caution</div></div>
            <div class="hlv"><div class="hlvl"><div class="hd" style="background:#ef4444;"></div>0–49 · Critical</div></div>
          </div>
        </div>
      </div>
    </div>
  </section>

  <!-- SLIDE 5: HOW -->
  <section class="slide" id="s-how">
    <div class="gsap-how-head">
      <div class="seye">Process</div>
      <h2 class="stitle">HOW IT <em>WORKS</em></h2>
    </div>
    <div class="hwsteps">
      <div class="hwline"><div class="hwline-fill"></div></div>
      <div class="hws gsap-hw"><div class="hwn">01</div><div class="hwt">INSTALL</div><p class="hwd">Download the .exe installer. No Python. No API keys. Done in seconds.</p></div>
      <div class="hws gsap-hw"><div class="hwn">02</div><div class="hwt">BROWSE</div><p class="hwd">Use the built-in browser. The AI layer runs silently in the background.</p></div>
      <div class="hws gsap-hw"><div class="hwn">03</div><div class="hwt">DETECT</div><p class="hwd">Every media is analyzed by the 5-model ensemble instantly.</p></div>
      <div class="hws gsap-hw"><div class="hwn">04</div><div class="hwt">DEFEND</div><p class="hwd">Generate legal complaints, package evidence automatically.</p></div>
    </div>
  </section>

  <!-- SLIDE 6: DOWNLOAD -->
  <section class="slide" id="s-download">
    <div class="dlsec">
      <div class="seye gsap-dl" style="justify-content:center; margin-bottom:16px;">Free · Open Source · MIT License</div>
      <h2 class="dltit gsap-dl">PROTECT YOUR<br>DIGITAL <em>TRUTH</em></h2>
      <p class="dlsub gsap-dl">No Python · No API Keys · No Setup</p>
      <div class="gsap-dl">
        <a href="https://github.com/jayaprakash2207/ENTITY-X/releases/latest" class="dlbtn">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M12 16l-6-6h4V4h4v6h4l-6 6zM4 20h16v-2H4v2z"/></svg>
          <span>Download for Windows</span>
        </a>
      </div>
      <div class="dlmeta gsap-dl">
        <span class="dlmi">Free Forever</span><span class="dlmi">MIT License</span>
        <span class="dlmi">Live Cloud Backend</span>
      </div>
    </div>
    <footer>
      <div class="flogo">ENTITY <span>X</span></div>
      <ul class="flinks">
        <li><a href="https://github.com/jayaprakash2207/ENTITY-X" target="_blank">GitHub</a></li>
        <li><a href="https://github.com/jayaprakash2207/ENTITY-X/releases" target="_blank">Releases</a></li>
        <li><a href="https://github.com/jayaprakash2207/ENTITY-X/blob/main/LICENSE.txt" target="_blank">MIT License</a></li>
      </ul>
      <div class="fcopy">© 2026 Jayaprakash A R</div>
    </footer>
  </section>

</div>

<script>
/* ═══════════════════════════════════════════════════
   OPTIMIZED 3D SCENE — Three.js
   ═══════════════════════════════════════════════════ */
const canvas = document.getElementById('c');
const W = window.innerWidth, H = window.innerHeight;
const renderer = new THREE.WebGLRenderer({canvas, alpha:true, antialias:true});
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5)); // Lowered pixel ratio for perf
renderer.setSize(W, H);

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(55, W/H, 0.1, 1000); // Reduced far plane
camera.position.set(0, 0, 8);
let camTarget = new THREE.Vector3(0,0,0);

/* ── LIGHTS ── */
scene.add(new THREE.AmbientLight(0x001020, 2));
const pl1 = new THREE.PointLight(0x00d4ff, 2, 30); pl1.position.set(5,5,3); scene.add(pl1);
const pl2 = new THREE.PointLight(0xff0080, 1.5, 25); pl2.position.set(-5,-3,2); scene.add(pl2);

/* ── 1. GALAXY (Reduced Particle Count) ── */
const N = 2000; // 8000 -> 2000
const pgeo = new THREE.BufferGeometry();
const ppos = new Float32Array(N*3), pcol = new Float32Array(N*3);
const pal = [[0,.83,1],[1,0,.5],[0,1,.53],[1,.84,0]];
for(let i=0;i<N;i++){
  const rad = 4 + Math.random()*20;
  const angle = Math.random()*Math.PI*2;
  ppos[i*3]   = rad*Math.cos(angle) + (Math.random()-.5)*3;
  ppos[i*3+1] = (Math.random()-.5)*5;
  ppos[i*3+2] = rad*Math.sin(angle) - 10;
  const c = pal[Math.floor(Math.random()*pal.length)], d = .2+Math.random()*.4;
  pcol[i*3]=c[0]*d; pcol[i*3+1]=c[1]*d; pcol[i*3+2]=c[2]*d;
}
pgeo.setAttribute('position',new THREE.BufferAttribute(ppos,3));
pgeo.setAttribute('color',new THREE.BufferAttribute(pcol,3));
const galaxy = new THREE.Points(pgeo, new THREE.PointsMaterial({size:.06,vertexColors:true,transparent:true,opacity:.7}));
scene.add(galaxy);

/* ── 2. NEURAL NETWORK ── */
const neuralGroup = new THREE.Group();
const nodeMat = new THREE.MeshBasicMaterial({color:0x00d4ff,transparent:true,opacity:.8}); // Basic instead of Phong
const edgeMat = new THREE.LineBasicMaterial({color:0x00d4ff,transparent:true,opacity:.15});
const layers = [4,5,5,4]; // Reduced layers
const nPos = [];
layers.forEach((n,li)=>{
  const nodes = [];
  const xOff = (li - 1.5)*1.8;
  for(let ni=0;ni<n;ni++){
    const yOff = (ni-(n-1)/2)*1.2;
    const node = new THREE.Mesh(new THREE.SphereGeometry(.1,8,8), nodeMat); // Reduced geometry detail
    node.position.set(xOff, yOff, 0);
    neuralGroup.add(node);
    nodes.push(node.position.clone());
  }
  nPos.push(nodes);
});
for(let li=0;li<layers.length-1;li++){
  nPos[li].forEach(a=>{
    nPos[li+1].forEach(b=>{
      if(Math.random()>.5){
        neuralGroup.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints([a,b]), edgeMat));
      }
    });
  });
}
neuralGroup.position.set(12, 0, -2);
scene.add(neuralGroup);

/* ── 3. DNA HELIX ── */
const dnaGroup = new THREE.Group();
const strandMat = new THREE.MeshBasicMaterial({color:0xff0080}); // Basic
for(let i=0;i<30;i++){ // Reduced from 50 to 30
  const t = (i/30)*Math.PI*2*4;
  const y = (i/30)*16 - 8;
  const s1 = new THREE.Mesh(new THREE.SphereGeometry(.1,6,6), strandMat);
  s1.position.set(1.2*Math.cos(t), y, 1.2*Math.sin(t));
  dnaGroup.add(s1);
  const s2 = new THREE.Mesh(new THREE.SphereGeometry(.1,6,6), strandMat);
  s2.position.set(1.2*Math.cos(t+Math.PI), y, 1.2*Math.sin(t+Math.PI));
  dnaGroup.add(s2);
  if(i%2===0){ // Every 2 instead of 3 to compensate for fewer items
    const cyl = new THREE.Mesh(new THREE.CylinderGeometry(.03,.03,2.4,4), new THREE.MeshBasicMaterial({color:0x00ff88,transparent:true,opacity:.4}));
    cyl.position.set(0,y,0);
    cyl.rotation.z = Math.PI/2;
    cyl.rotation.y = -t;
    dnaGroup.add(cyl);
  }
}
dnaGroup.position.set(-12, 0, -2);
scene.add(dnaGroup);

/* ── 4. RINGS ── */
const ringGroup = new THREE.Group();
for(let i=0;i<3;i++){ // Reduced from 4 to 3
  const ring = new THREE.Mesh(new THREE.TorusGeometry(2+i*0.8, .02, 6, 48), new THREE.MeshBasicMaterial({color:0x00d4ff, transparent:true, opacity:.3-i*.05}));
  ring.rotation.x = Math.PI/2;
  ring.userData = {speed: 0.5-i*0.1};
  ringGroup.add(ring);
}
ringGroup.position.set(0, -12, -4);
scene.add(ringGroup);


/* ── ANIMATION LOOP ── */
const clock = new THREE.Clock();
let mx=0, my=0;
document.addEventListener('mousemove', e=>{ mx=(e.clientX/W-.5)*2; my=(e.clientY/H-.5)*2; });

function animate(){
  requestAnimationFrame(animate);
  const t = clock.getElapsedTime();

  galaxy.rotation.y = t*.02;
  neuralGroup.rotation.y = Math.sin(t*.2)*.4;
  dnaGroup.rotation.y = t*.3;
  dnaGroup.position.y = Math.sin(t)*.5;
  
  ringGroup.rotation.y = t*.2;
  ringGroup.children.forEach((r,i)=>{
    r.rotation.z = t*r.userData.speed;
    r.rotation.x = Math.PI/2 + Math.sin(t*.5+i)*.2;
  });

  // Camera smooth follow and parallax (reduced parallax effect)
  camera.position.x += (mx*0.2 - camera.position.x)*0.05; 
  camera.position.y += (-my*0.2 - camera.position.y)*0.05;
  camera.lookAt(camTarget);

  renderer.render(scene, camera);
}
animate();

window.addEventListener('resize',()=>{
  camera.aspect=window.innerWidth/window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});


/* ═══════════════════════════════════════════════════
   GSAP SCROLLTRIGGER & SLIDE LOGIC
   ═══════════════════════════════════════════════════ */
gsap.registerPlugin(ScrollTrigger, ScrollToPlugin);

const container = document.getElementById('scroll-container');
const slides = gsap.utils.toArray('.slide');
const navLinks = document.querySelectorAll('.nav-link');
const dots = document.querySelectorAll('.dot');

// 3D Camera States for each slide
const camStates = [
  { pos: { x:0, y:0, z:8 }, target: { x:0, y:0, z:0 } },          // 0: Hero
  { pos: { x:10, y:0, z:4 }, target: { x:12, y:0, z:-2 } },       // 1: Features
  { pos: { x:-10, y:0, z:4 }, target: { x:-12, y:0, z:-2 } },     // 2: Models
  { pos: { x:0, y:-10, z:4 }, target: { x:0, y:-12, z:-4 } },     // 3: Trust
  { pos: { x:0, y:0, z:6 }, target: { x:0, y:0, z:0 } },          // 4: How
  { pos: { x:0, y:0, z:12 }, target: { x:0, y:0, z:0 } },         // 5: DL
];

// Initialize scroll triggers only if on desktop. Mobile doesn't snap well with GSAP sometimes.
const isMobile = window.innerWidth <= 768;

if (!isMobile) {
  slides.forEach((slide, i) => {
    ScrollTrigger.create({
      trigger: slide,
      scroller: container,
      start: "top center",
      end: "bottom center",
      onEnter: () => activateSlide(i),
      onEnterBack: () => activateSlide(i)
    });

    // Staggered entry animations
    if(i === 0) {
      gsap.fromTo(slide.querySelectorAll('.gsap-title'), {y: 30, opacity: 0}, {y: 0, opacity: 1, duration: 0.8, stagger: 0.1, ease: "power2.out"});
      gsap.fromTo(slide.querySelectorAll('.gsap-sub, .heyebrow'), {y: 15, opacity: 0}, {y: 0, opacity: 1, duration: 0.6, delay: 0.3, stagger: 0.1, ease: "power2.out"});
    }
    if(i === 1) {
      gsap.fromTo(slide.querySelectorAll('.seye, .stitle, .sdesc'), {y: 20, opacity: 0}, {y: 0, opacity: 1, duration: 0.6, stagger: 0.1, scrollTrigger: {trigger: slide, scroller: container, start: "top 70%"}});
      gsap.fromTo(slide.querySelectorAll('.gsap-fcard'), {y: 30, opacity: 0}, {y: 0, opacity: 1, duration: 0.5, stagger: 0.05, scrollTrigger: {trigger: slide, scroller: container, start: "top 60%"}});
    }
    if(i === 2) {
      gsap.fromTo(slide.querySelector('.gsap-mod-left'), {x: -30, opacity: 0}, {x: 0, opacity: 1, duration: 0.8, scrollTrigger: {trigger: slide, scroller: container, start: "top 60%"}});
      gsap.fromTo(slide.querySelector('.gsap-mod-right'), {x: 30, opacity: 0}, {x: 0, opacity: 1, duration: 0.8, scrollTrigger: {trigger: slide, scroller: container, start: "top 60%"}});
      ScrollTrigger.create({
        trigger: slide, scroller: container, start: "top 60%",
        onEnter: () => slide.querySelectorAll('.mfill').forEach(b => gsap.to(b, {width: b.dataset.w, duration: 1.2, ease: "power2.out", delay:0.3}))
      });
    }
    if(i === 3) {
      gsap.fromTo(slide.querySelector('.gsap-trust-left'), {x: -30, opacity: 0}, {x: 0, opacity: 1, duration: 0.8, scrollTrigger: {trigger: slide, scroller: container, start: "top 60%"}});
      gsap.fromTo(slide.querySelector('.gsap-trust-right'), {scale: 0.95, opacity: 0}, {scale: 1, opacity: 1, duration: 0.8, ease: "back.out(1.2)", scrollTrigger: {trigger: slide, scroller: container, start: "top 60%"}});
    }
    if(i === 4) {
      gsap.fromTo(slide.querySelectorAll('.gsap-how-head > *'), {y: 20, opacity: 0}, {y: 0, opacity: 1, duration: 0.6, stagger: 0.1, scrollTrigger: {trigger: slide, scroller: container, start: "top 60%"}});
      gsap.fromTo(slide.querySelectorAll('.gsap-hw'), {y: 30, opacity: 0}, {y: 0, opacity: 1, duration: 0.5, stagger: 0.1, scrollTrigger: {trigger: slide, scroller: container, start: "top 60%"}});
      gsap.to('.hwline-fill', {width: '100%', duration: 1.2, ease: "power2.inOut", scrollTrigger: {trigger: slide, scroller: container, start: "top 60%"}});
    }
    if(i === 5) {
      gsap.fromTo(slide.querySelectorAll('.gsap-dl'), {y: 30, opacity: 0}, {y: 0, opacity: 1, duration: 0.6, stagger: 0.1, scrollTrigger: {trigger: slide, scroller: container, start: "top 60%"}});
    }
  });
} else {
  // Mobile simple activation based on scroll
  container.addEventListener('scroll', () => {
    let currentIdx = 0;
    let minDiff = Infinity;
    slides.forEach((slide, i) => {
      const rect = slide.getBoundingClientRect();
      const diff = Math.abs(rect.top);
      if (diff < minDiff) { minDiff = diff; currentIdx = i; }
    });
    activateSlide(currentIdx);
  });
}

function activateSlide(index) {
  navLinks.forEach(l => l.classList.remove('active'));
  dots.forEach(d => d.classList.remove('active'));
  if(navLinks[index]) navLinks[index].classList.add('active');
  if(dots[index]) dots[index].classList.add('active');

  const state = camStates[index];
  if(state) {
    gsap.to(camera.position, { x: state.pos.x, y: state.pos.y, z: state.pos.z, duration: 1.5, ease: "power2.inOut" });
    gsap.to(camTarget, { x: state.target.x, y: state.target.y, z: state.target.z, duration: 1.5, ease: "power2.inOut" });
  }
}

// Ensure first slide is active immediately
activateSlide(0);

// Click Navigation
document.querySelectorAll('a[href^="#s-"], .dot').forEach(btn => {
  btn.addEventListener('click', e => {
    e.preventDefault();
    const targetId = btn.dataset.target || btn.getAttribute('href');
    const targetEl = document.querySelector(targetId);
    if(targetEl) {
      gsap.to(container, {scrollTo: targetEl, duration: 0.8, ease: "power2.inOut"});
    }
  });
});

/* ═══════════════════════════════════════════════════
   CUSTOM CURSOR
   ═══════════════════════════════════════════════════ */
const cur=document.getElementById('cur'), ring=document.getElementById('cur-r');
let cx=0,cy=0,rx=0,ry=0;
document.addEventListener('mousemove',e=>{cx=e.clientX;cy=e.clientY;cur.style.left=cx+'px';cur.style.top=cy+'px';});
(function loop(){rx+=(cx-rx)*.2;ry+=(cy-ry)*.2;ring.style.left=rx+'px';ring.style.top=ry+'px';requestAnimationFrame(loop);})();
document.querySelectorAll('a, button, .fcard, .mc, .hws, .dot').forEach(el=>{
  el.addEventListener('mouseenter',()=>{ring.classList.add('h');cur.style.width='14px';cur.style.height='14px';cur.style.background='var(--magenta)';});
  el.addEventListener('mouseleave',()=>{ring.classList.remove('h');cur.style.width='8px';cur.style.height='8px';cur.style.background='var(--cyan)';});
});
</script>
</body>
</html>`;

fs.writeFileSync(indexPath, htmlContent, 'utf8');
console.log('Successfully applied performance fixes and layout corrections to index.html.');
