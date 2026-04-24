'use client';

import { useState, useRef, useCallback } from 'react';
import Link from 'next/link';

const FILL = { fontVariationSettings: "'FILL' 1" };

const KEYFRAMES = `
@keyframes rotateMesh {
  from { transform: rotateX(22deg) rotateY(0deg); }
  to   { transform: rotateX(22deg) rotateY(360deg); }
}
@keyframes execPulse {
  0%,100%{ opacity:0; } 40%,60%{ opacity:0.9; }
}
@keyframes scanline {
  from { top:-4px; } to { top:100%; }
}
@keyframes fadeIn {
  from{ opacity:0; transform:translateY(8px); }
  to  { opacity:1; transform:translateY(0); }
}
@keyframes meshAppear {
  0%  { opacity:0; transform:scale(0.7) rotateY(0deg); }
  60% { opacity:1; transform:scale(1.05) rotateY(180deg); }
  100%{ opacity:1; transform:scale(1) rotateY(360deg); }
}
`;

/* ─── Gallery images pool ──────────────────────────────────────────────────── */
const GALLERY_IMAGES = [
  { id:'bp1', name:'BP_RotatingMesh',   img:'/assets/card1.png',    tag:'Mesh',     nodes:6  },
  { id:'bp2', name:'BP_ProceduralTerrain', img:'/assets/image_12.png', tag:'Logic',  nodes:14 },
  { id:'bp3', name:'BP_MaterialSwapper',img:'/assets/card2.png',    tag:'Material', nodes:8  },
  { id:'bp4', name:'BP_AnimController', img:'/assets/card3.png',    tag:'Anim',     nodes:11 },
  { id:'bp5', name:'BP_ParticleSpawner',img:'/assets/image6.png',   tag:'Effect',   nodes:9  },
  { id:'bp6', name:'BP_DynamicLight',   img:'/assets/image2.png',   tag:'Light',    nodes:7  },
];

const DETAIL_OPTS  = ['Low Poly','Medium','High Res','Cinematic'];
const STYLE_OPTS   = ['Realistic','Stylized','Cel-Shaded','Wireframe Art'];

/* ─── Image → 3D Generator panel ──────────────────────────────────────────── */
function ImageTo3DGenerator({ onGenerate, connected, generating }) {
  const [src, setSrc]       = useState(null);
  const [prompt, setPrompt] = useState('');
  const [detail, setDetail] = useState('Medium');
  const [style, setStyle]   = useState('Realistic');
  const [rigging, setRigging] = useState(false);
  const fileRef = useRef(null);

  const handleFile = (file) => {
    if (!file || !file.type.startsWith('image/')) return;
    const url = URL.createObjectURL(file);
    setSrc({ id:'upload', name: file.name.replace(/\.[^.]+$/,''), img: url, tag:'Upload', nodes:0 });
  };

  const canGenerate = src && prompt.trim().length > 0 && !generating;

  return (
    <div className="col-span-12 bg-[#1E1028]/50 backdrop-blur-[24px] border border-white/5 rounded-3xl p-5 lg:p-7">
      {/* header */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-secondary/10 border border-secondary/20 flex items-center justify-center shrink-0">
            <span className="material-symbols-outlined text-secondary" style={FILL}>view_in_ar</span>
          </div>
          <div>
            <h2 className="text-base font-headline font-bold text-on-surface">Generate 3D from Image</h2>
            <p className="text-[10px] font-label uppercase tracking-widest text-on-surface-variant/50 mt-0.5">
              Convert generated images into interactive Blueprint meshes
            </p>
          </div>
        </div>
        {connected && (
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-900/40 border border-emerald-500/30"
            style={{animation:'fadeIn .4s ease'}}>
            <span className="material-symbols-outlined text-emerald-400 text-[15px]" style={FILL}>check_circle</span>
            <span className="text-[10px] font-label text-emerald-400 uppercase tracking-widest font-bold">
              Linked to Blueprint
            </span>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">

        {/* ── Image source ── col-span-4 */}
        <div className="lg:col-span-4 flex flex-col gap-3">
          <p className="text-[10px] font-label uppercase tracking-widest text-on-surface-variant/60">
            Source Image
          </p>

          {/* Selected preview */}
          <div
            className={`relative h-36 rounded-xl overflow-hidden border-2 transition-all ${src ? 'border-secondary/50' : 'border-dashed border-white/15'}`}
            onDragOver={e => e.preventDefault()}
            onDrop={e => { e.preventDefault(); handleFile(e.dataTransfer.files[0]); }}
          >
            {src
              ? <>
                  <img src={src.img} alt={src.name} className="w-full h-full object-cover"/>
                  <div className="absolute inset-0 bg-gradient-to-t from-[#1f0438]/80 via-transparent to-transparent"/>
                  <span className="absolute bottom-2 left-3 text-[10px] font-label text-white/80 font-bold truncate max-w-[90%]">{src.name}</span>
                  <button onClick={() => setSrc(null)}
                    className="absolute top-2 right-2 w-6 h-6 rounded-full bg-black/60 flex items-center justify-center text-white/70 hover:text-white">
                    <span className="material-symbols-outlined text-[13px]">close</span>
                  </button>
                </>
              : <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 cursor-pointer"
                  onClick={() => fileRef.current?.click()}>
                  <span className="material-symbols-outlined text-3xl text-on-surface-variant/25">add_photo_alternate</span>
                  <span className="text-[10px] font-label text-on-surface-variant/40">Drop image or click</span>
                </div>
            }
            <input ref={fileRef} type="file" accept="image/*" className="hidden"
              onChange={e => handleFile(e.target.files[0])}/>
          </div>

          {/* Gallery quick-pick */}
          <p className="text-[10px] font-label uppercase tracking-widest text-on-surface-variant/50">
            From Gallery
          </p>
          <div className="grid grid-cols-3 gap-2">
            {GALLERY_IMAGES.map(g => (
              <button key={g.id} onClick={() => setSrc(g)}
                className={`relative aspect-square rounded-lg overflow-hidden border-2 transition-all ${src?.id===g.id ? 'border-secondary scale-95' : 'border-transparent hover:border-white/20'}`}>
                <img src={g.img} alt={g.name} className="w-full h-full object-cover"/>
                <div className="absolute inset-0 bg-black/20"/>
              </button>
            ))}
          </div>
        </div>

        {/* ── Prompt + options ── col-span-8 */}
        <div className="lg:col-span-8 flex flex-col gap-4">
          <div>
            <label className="text-[10px] font-label uppercase tracking-widest text-on-surface-variant/60 block mb-2">
              3D Generation Prompt
            </label>
            <textarea
              rows={4}
              value={prompt}
              onChange={e => setPrompt(e.target.value)}
              placeholder="e.g. &quot;Convert to low-poly character mesh with skeleton rigging for run/idle animations. Apply original image as PBR diffuse texture. Add collision capsule.&quot;"
              className="w-full bg-[#110b1a] border border-white/10 rounded-xl px-4 py-3 text-sm text-on-surface placeholder:text-on-surface-variant/25 font-body resize-none focus:outline-none focus:border-primary/50 transition-colors"
            />
          </div>

          {/* Options row */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-[10px] font-label uppercase tracking-widest text-on-surface-variant/60 block mb-2">
                Detail Level
              </label>
              <div className="flex flex-wrap gap-1.5">
                {DETAIL_OPTS.map(d => (
                  <button key={d} onClick={() => setDetail(d)}
                    className={`px-2.5 py-1 rounded-lg text-[10px] font-label font-bold uppercase tracking-wide transition-all ${detail===d ? 'bg-primary/20 text-primary border border-primary/30' : 'bg-white/5 text-on-surface-variant/50 hover:text-primary'}`}>
                    {d}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="text-[10px] font-label uppercase tracking-widest text-on-surface-variant/60 block mb-2">
                Visual Style
              </label>
              <div className="flex flex-wrap gap-1.5">
                {STYLE_OPTS.map(s => (
                  <button key={s} onClick={() => setStyle(s)}
                    className={`px-2.5 py-1 rounded-lg text-[10px] font-label font-bold uppercase tracking-wide transition-all ${style===s ? 'bg-secondary/20 text-secondary border border-secondary/30' : 'bg-white/5 text-on-surface-variant/50 hover:text-secondary'}`}>
                    {s}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Toggles */}
          <div className="flex flex-wrap gap-4">
            {[
              { label:'Auto Rigging', key:'rigging', val:rigging, set:setRigging },
            ].map(({ label, val, set }) => (
              <label key={label} className="flex items-center gap-2 cursor-pointer">
                <div onClick={() => set(!val)}
                  className={`w-9 h-5 rounded-full relative transition-colors ${val ? 'bg-primary/60' : 'bg-white/10'}`}>
                  <div className={`absolute top-0.5 w-4 h-4 rounded-full shadow-md transition-all ${val ? 'left-4 bg-primary' : 'left-0.5 bg-white/40'}`}/>
                </div>
                <span className="text-xs font-label text-on-surface-variant/60">{label}</span>
              </label>
            ))}
            <label className="flex items-center gap-2 cursor-pointer">
              <div className="w-9 h-5 rounded-full bg-white/10 relative">
                <div className="absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white/40"/>
              </div>
              <span className="text-xs font-label text-on-surface-variant/60">LOD Auto-gen</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <div className="w-9 h-5 rounded-full bg-white/10 relative">
                <div className="absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white/40"/>
              </div>
              <span className="text-xs font-label text-on-surface-variant/60">Collision Mesh</span>
            </label>
          </div>

          {/* Generate CTA */}
          <div className="mt-auto flex flex-wrap items-center gap-3">
            <button
              disabled={!canGenerate}
              onClick={() => onGenerate({ ...src, prompt, detail, style, rigging })}
              className="flex items-center gap-2 bg-gradient-to-r from-secondary to-primary text-on-primary font-label font-bold px-6 py-3 rounded-xl shadow-lg shadow-secondary/20 active:scale-[0.97] transition-all disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {generating
                ? <><span className="material-symbols-outlined text-[18px] animate-spin">progress_activity</span> Generating…</>
                : <><span className="material-symbols-outlined text-[18px]" style={FILL}>view_in_ar</span> Generate 3D &amp; Link to Blueprint</>
              }
            </button>
            {!src && <span className="text-[11px] text-on-surface-variant/40 font-body">Select an image above to begin</span>}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── Interactive 3-D Viewport ─────────────────────────────────────────────── */
const CUBE_FACES = [
  'translateZ(52px)', 'rotateY(180deg) translateZ(52px)',
  'rotateY(-90deg) translateZ(52px)', 'rotateY(90deg) translateZ(52px)',
  'rotateX(90deg) translateZ(52px)', 'rotateX(-90deg) translateZ(52px)',
];

function Viewport3D({ connected, generating }) {
  const [mode, setMode]       = useState('Wireframe');
  const [rot, setRot]         = useState({ x: 22, y: 0 });
  const [dragging, setDragging] = useState(false);
  const lastPt = useRef(null);

  const onDown = useCallback((e) => {
    setDragging(true);
    lastPt.current = { x: e.clientX ?? e.touches?.[0]?.clientX, y: e.clientY ?? e.touches?.[0]?.clientY };
  }, []);

  const onMove = useCallback((e) => {
    if (!dragging || !lastPt.current) return;
    const cx = e.clientX ?? e.touches?.[0]?.clientX ?? 0;
    const cy = e.clientY ?? e.touches?.[0]?.clientY ?? 0;
    const dx = cx - lastPt.current.x;
    const dy = cy - lastPt.current.y;
    setRot(r => ({ x: Math.max(-60, Math.min(60, r.x - dy * 0.45)), y: r.y + dx * 0.55 }));
    lastPt.current = { x: cx, y: cy };
  }, [dragging]);

  const onUp = useCallback(() => { setDragging(false); lastPt.current = null; }, []);

  const cubeStyle = dragging
    ? { transform: `rotateX(${rot.x}deg) rotateY(${rot.y}deg)`, transition:'none' }
    : { animation: generating ? 'none' : 'rotateMesh 11s linear infinite' };

  const faceStyle = (t) => ({
    position:'absolute', inset:0, transform: t,
    border: `1.5px solid rgba(213,186,255,${connected ? 0.3 : 0.45})`,
    backgroundImage: connected && mode !== 'Wireframe' ? `url(${connected.img})` : 'none',
    backgroundSize:'cover', backgroundPosition:'center',
    background: connected && mode !== 'Wireframe'
      ? `url(${connected.img}) center/cover, rgba(213,186,255,0.03)`
      : 'rgba(213,186,255,0.02)',
    opacity: generating ? 0.3 : 1,
  });

  return (
    <div className="flex flex-col h-full bg-[#0d0a14] rounded-xl overflow-hidden border border-white/5">
      {/* toolbar */}
      <div className="flex items-center justify-between px-3 py-1.5 border-b border-white/5 shrink-0">
        <span className="text-[10px] font-label text-primary/70 uppercase tracking-widest">Perspective · {mode}</span>
        <div className="flex items-center gap-1">
          {['Grid','Wireframe','Lit'].map(m => (
            <button key={m} onClick={() => setMode(m)}
              className={`px-2 py-0.5 rounded text-[9px] font-label uppercase tracking-widest transition-colors ${mode===m ? 'text-primary bg-primary/10' : 'text-on-surface-variant/40 hover:text-primary'}`}>
              {m}
            </button>
          ))}
        </div>
      </div>

      {/* scene — draggable */}
      <div
        className="flex-1 relative flex items-center justify-center overflow-hidden select-none"
        style={{ cursor: dragging ? 'grabbing' : 'grab' }}
        onMouseDown={onDown} onMouseMove={onMove} onMouseUp={onUp} onMouseLeave={onUp}
        onTouchStart={onDown} onTouchMove={onMove} onTouchEnd={onUp}
      >
        {/* floor grid */}
        <div className="absolute inset-0 pointer-events-none" style={{
          backgroundImage:'linear-gradient(rgba(213,186,255,0.06) 1px,transparent 1px),linear-gradient(90deg,rgba(213,186,255,0.06) 1px,transparent 1px)',
          backgroundSize:'28px 28px',
          transform:'perspective(350px) rotateX(55deg) translateY(55px)',
          transformOrigin:'center bottom',
        }}/>

        {/* glow */}
        <div className="absolute w-52 h-52 rounded-full blur-3xl pointer-events-none"
          style={{ background: connected ? 'rgba(255,171,243,0.08)' : 'rgba(213,186,255,0.06)' }}/>

        {/* generating scanline */}
        {generating && (
          <div className="absolute left-0 right-0 h-px pointer-events-none z-20"
            style={{ background:'linear-gradient(90deg,transparent,#ffabf3,transparent)', boxShadow:'0 0 18px 4px rgba(255,171,243,0.5)', animation:'scanline 1.4s linear infinite' }}/>
        )}

        {/* 3-D mesh */}
        <div style={{ perspective: '520px' }}>
          <div style={{
            width:104, height:104, transformStyle:'preserve-3d',
            position:'relative',
            ...cubeStyle,
            ...(generating ? { animation:'meshAppear 2.8s ease forwards' } : {}),
          }}>
            {CUBE_FACES.map((t,i) => <div key={i} style={faceStyle(t)}/>)}
            {/* diagonal cross on front for wireframe detail */}
            <div style={{ position:'absolute', inset:0, border:'1px solid rgba(213,186,255,0.12)', transform:'translateZ(52px) rotate(45deg) scale(1.41)' }}/>
          </div>
        </div>

        {/* connected asset badge */}
        {connected && !generating && (
          <div className="absolute top-3 left-3 flex items-center gap-1.5 px-2 py-1 rounded-lg bg-black/50 backdrop-blur-sm border border-white/10"
            style={{animation:'fadeIn .4s ease'}}>
            <img src={connected.img} alt="" className="w-5 h-5 rounded object-cover"/>
            <span className="text-[9px] font-label text-white/70 truncate max-w-[80px]">{connected.name}</span>
          </div>
        )}

        {/* drag hint */}
        {!dragging && !connected && (
          <div className="absolute bottom-8 left-0 right-0 flex justify-center pointer-events-none">
            <span className="text-[9px] font-label text-on-surface-variant/20 uppercase tracking-widest">Drag to rotate</span>
          </div>
        )}

        {/* axis labels */}
        <div className="absolute bottom-2 left-3 flex gap-2.5">
          {[['X','text-red-400'],['Y','text-emerald-400'],['Z','text-sky-400']].map(([ax,c]) => (
            <span key={ax} className={`text-[9px] font-mono font-bold ${c}`}>{ax}</span>
          ))}
        </div>
        <div className="absolute bottom-2 right-3 text-right">
          <div className="text-[9px] font-mono text-on-surface-variant/35">Verts {connected ? '2.4k' : '24'}</div>
          <div className="text-[9px] font-mono text-on-surface-variant/35">Tris  {connected ? '4.8k' : '12'}</div>
        </div>
      </div>
    </div>
  );
}

/* ─── Blueprint Graph ──────────────────────────────────────────────────────── */
function Pin({ type='exec', label='', side='left' }) {
  const DOT = { exec:'w-2.5 h-2.5 rotate-45 border border-white bg-transparent', object:'w-2.5 h-2.5 rounded-full bg-[#1678C8]', float:'w-2.5 h-2.5 rounded-full bg-[#A5E44A]', transform:'w-2.5 h-2.5 rounded-full bg-[#E9CF57]', texture:'w-2.5 h-2.5 rounded-full bg-[#C45CFF]', material:'w-2.5 h-2.5 rounded-full bg-[#FF8C00]' };
  return (
    <div className={`flex items-center gap-1.5 py-[3px] ${side==='right'?'flex-row-reverse':''}`}>
      <div className={`shrink-0 ${DOT[type]??DOT.object}`}/>
      {label && <span className="text-[10px] font-label text-white/55 whitespace-nowrap">{label}</span>}
    </div>
  );
}
function BpNode({ type, title, icon, x, y, ins=[], outs=[], active=false, glow=false }) {
  const HDR = { event:'bg-[#7A1818]', function:'bg-[#0F3A6B]', pure:'bg-[#184A2E]', macro:'bg-[#3B1A56]' };
  const ICO = { event:'text-yellow-300', function:'text-blue-300', pure:'text-emerald-300', macro:'text-purple-300' };
  return (
    <div className="absolute rounded-md overflow-hidden border border-white/10 bg-[#1E1028]/95"
      style={{ left:x, top:y, minWidth:155, boxShadow: glow ? '0 0 20px rgba(255,171,243,0.45)' : active ? '0 0 18px rgba(213,186,255,0.35)' : 'none' }}>
      <div className={`${HDR[type]} px-2.5 py-1.5 flex items-center gap-1.5`}>
        <span className={`material-symbols-outlined text-[14px] ${ICO[type]}`} style={FILL}>{icon}</span>
        <span className="text-[11px] font-label font-bold text-white">{title}</span>
      </div>
      <div className="flex px-2 py-1.5 gap-6">
        <div className="flex flex-col">{ins.map((p,i)=><Pin key={i} {...p} side="left"/>)}</div>
        <div className="flex-1"/>
        <div className="flex flex-col items-end">{outs.map((p,i)=><Pin key={i} {...p} side="right"/>)}</div>
      </div>
    </div>
  );
}

function Wires({ connected }) {
  const base = [
    { d:'M 163,52 C 190,52 193,44 218,44', s:'#fff', w:1.8, pulse:true, delay:0 },
    { d:'M 163,161 C 195,161 195,84 218,84', s:'#1678C8', w:1.5 },
    { d:'M 154,248 C 190,248 192,238 218,238', s:'#fff', w:1.8, pulse:true, delay:0.9 },
    { d:'M 154,337 C 190,337 190,278 218,278', s:'#E9CF57', w:1.5 },
    { d:'M 393,44 C 425,44 440,44 460,44', s:'#fff', w:1.8 },
    { d:'M 393,238 C 425,238 440,238 460,238', s:'#fff', w:1.8 },
  ];
  const extra = connected ? [
    /* LoadTexture out → CreateDynMat in */
    { d:'M 163,415 C 210,415 210,398 218,394', s:'#C45CFF', w:1.5, pulse:true, delay:1.5 },
    /* CreateDynMat out → SetMaterial in */
    { d:'M 393,390 C 420,390 420,104 218,104', s:'#FF8C00', w:1.5, glowExtra:true },
  ] : [];
  const all = [...base, ...extra];
  return (
    <svg className="absolute inset-0 pointer-events-none overflow-visible" style={{width:'100%',height:'100%'}} viewBox="0 0 520 460" preserveAspectRatio="none">
      <defs>
        <filter id="wglow"><feGaussianBlur stdDeviation="2.5" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
      </defs>
      {all.map((w,i) => (
        <g key={i}>
          <path d={w.d} stroke={w.s} strokeWidth={w.w} fill="none" opacity={w.glowExtra ? 0.5 : 0.65}
            filter={w.glowExtra ? 'url(#wglow)' : undefined}/>
          {w.pulse && <path d={w.d} stroke="#ffabf3" strokeWidth="3" fill="none" filter="url(#wglow)"
            style={{animation:`execPulse 2.2s ease-in-out ${w.delay??0}s infinite`}}/>}
        </g>
      ))}
    </svg>
  );
}

function BlueprintGraph({ connected }) {
  const canvasH = connected ? 490 : 400;
  return (
    <div className="relative w-full bg-[#110b1a] rounded-xl overflow-hidden border border-white/5 flex flex-col" style={{minHeight: canvasH+42}}>
      <div className="flex items-center gap-3 px-3 py-1.5 border-b border-white/5 shrink-0 bg-[#0e0918]">
        {[['compile','Compile'],['play_arrow','Simulate'],['bug_report','Debug']].map(([ic,lb]) => (
          <button key={lb} className="flex items-center gap-1 px-2 py-1 rounded text-[10px] font-label text-on-surface-variant/50 hover:text-primary hover:bg-primary/10 transition-colors">
            <span className="material-symbols-outlined text-[14px]">{ic}</span>{lb}
          </button>
        ))}
        <div className="ml-auto flex items-center gap-1 px-2 py-0.5 rounded bg-emerald-900/40 border border-emerald-500/30">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"/>
          <span className="text-[9px] font-label text-emerald-400 uppercase tracking-widest">Compiled</span>
        </div>
      </div>

      <div className="relative overflow-auto" style={{height: canvasH}}>
        <div className="absolute inset-0 pointer-events-none" style={{backgroundImage:'linear-gradient(rgba(255,255,255,0.04) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.04) 1px,transparent 1px)',backgroundSize:'28px 28px'}}/>
        <Wires connected={connected}/>

        <BpNode type="event"    title="Event BeginPlay"     icon="bolt"           x={18}  y={20}  active ins={[]} outs={[{type:'exec'}]}/>
        <BpNode type="function" title="Set Static Mesh"     icon="deployed_code"  x={218} y={10}  ins={[{type:'exec'},{type:'object',label:'Target'},{type:'object',label:'New Mesh'},{type:'material',label:'Material'}]} outs={[{type:'exec'}]}/>
        <BpNode type="pure"     title="Get Mesh Component"  icon="view_in_ar"     x={18}  y={130} ins={[]} outs={[{type:'object',label:'Return Value'}]}/>
        <BpNode type="event"    title="Event Tick"          icon="timelapse"      x={18}  y={215} active ins={[]} outs={[{type:'exec'},{type:'float',label:'Delta Seconds'}]}/>
        <BpNode type="function" title="Add Actor Rotation"  icon="rotate_right"   x={218} y={205} ins={[{type:'exec'},{type:'object',label:'Target'},{type:'transform',label:'Delta Rotation'}]} outs={[{type:'exec'}]}/>
        <BpNode type="pure"     title="Make Rotator"        icon="3d_rotation"    x={18}  y={308} ins={[{type:'float',label:'Pitch'},{type:'float',label:'Yaw'}]} outs={[{type:'transform',label:'Return Value'}]}/>

        {/* Nodes added when an image is linked */}
        {connected && (
          <>
            <BpNode type="pure"     title="Load Texture Asset"    icon="image"         x={18}  y={390} glow ins={[]} outs={[{type:'texture',label:'Texture 2D'}]}
              style={{animation:'fadeIn .5s ease'}}/>
            <BpNode type="function" title="Create Dyn Material"   icon="palette"       x={218} y={378} glow ins={[{type:'texture',label:'Texture'},{type:'object',label:'Parent'}]} outs={[{type:'material',label:'Material Inst.'}]}/>
          </>
        )}

        {/* minimap */}
        <div className="absolute bottom-3 right-3 w-24 h-16 bg-[#0e0918]/80 border border-white/10 rounded-lg overflow-hidden pointer-events-none opacity-70">
          <div className="absolute inset-0 scale-[0.18] origin-top-left">
            {[{l:3,t:3,w:24,h:9,c:'#7A1818'},{l:36,t:2,w:28,h:14,c:'#0F3A6B'},{l:3,t:20,w:24,h:9,c:'#184A2E'},{l:3,t:33,w:24,h:9,c:'#7A1818'},{l:36,t:32,w:28,h:14,c:'#0F3A6B'},{l:3,t:48,w:22,h:12,c:'#184A2E'}].map((b,i) => (
              <div key={i} className="absolute rounded-sm opacity-60" style={{left:b.l,top:b.t,width:b.w,height:b.h,background:b.c}}/>
            ))}
          </div>
          <div className="absolute inset-1 border border-primary/30 rounded"/>
        </div>
      </div>
    </div>
  );
}

/* ─── Blueprint prompt bar ─────────────────────────────────────────────────── */
function BpPrompt() {
  const [val, setVal] = useState('');
  return (
    <div className="bg-[#1E1028]/70 rounded-2xl p-4 border border-white/5">
      <label className="text-[10px] font-label uppercase tracking-widest text-on-surface-variant/60 block mb-2">Blueprint Class Prompt</label>
      <div className="flex gap-3">
        <input type="text" value={val} onChange={e=>setVal(e.target.value)}
          placeholder='e.g. "Trigger-zone that swaps material on overlap and emits particles…"'
          className="flex-1 bg-[#110b1a] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-on-surface placeholder:text-on-surface-variant/25 font-body focus:outline-none focus:border-primary/50 transition-colors"/>
        <button className="shrink-0 flex items-center gap-2 bg-primary text-on-primary font-label font-bold px-5 py-2.5 rounded-xl shadow-lg shadow-primary/20 active:scale-[0.98] transition-transform">
          <span className="material-symbols-outlined text-[18px]" style={FILL}>bolt</span>Generate
        </button>
      </div>
    </div>
  );
}

/* ─── Blueprint Gallery ────────────────────────────────────────────────────── */
function MiniGraph() {
  return (
    <svg viewBox="0 0 120 70" className="w-full h-full opacity-60">
      <rect x="4"  y="8"  width="42" height="16" rx="3" fill="#7A1818" opacity=".8"/><rect x="4"  y="8"  width="42" height="7"  rx="3" fill="#9B2222"/>
      <rect x="66" y="4"  width="48" height="22" rx="3" fill="#0F3A6B" opacity=".8"/><rect x="66" y="4"  width="48" height="7"  rx="3" fill="#1A5080"/>
      <rect x="4"  y="38" width="42" height="16" rx="3" fill="#184A2E" opacity=".8"/><rect x="4"  y="38" width="42" height="7"  rx="3" fill="#1F6040"/>
      <rect x="66" y="34" width="48" height="22" rx="3" fill="#0F3A6B" opacity=".8"/><rect x="66" y="34" width="48" height="7"  rx="3" fill="#1A5080"/>
      <path d="M 46,16 C 56,16 56,15 66,15" stroke="white" strokeWidth="1.2" fill="none" opacity=".7"/>
      <path d="M 46,46 C 56,46 56,45 66,45" stroke="white" strokeWidth="1.2" fill="none" opacity=".7"/>
      <path d="M 46,52 C 56,52 56,26 66,26" stroke="#d5baff" strokeWidth="1" fill="none" opacity=".5"/>
      <circle cx="46" cy="52" r="2" fill="#d5baff" opacity=".8"/><circle cx="66" cy="26" r="2" fill="#d5baff" opacity=".8"/>
    </svg>
  );
}

const TAG_META = { Mesh:['text-primary','bg-primary/10'], Logic:['text-emerald-400','bg-emerald-400/10'], Material:['text-secondary','bg-secondary/10'], Anim:['text-yellow-400','bg-yellow-400/10'], Effect:['text-tertiary','bg-tertiary/10'], Light:['text-orange-400','bg-orange-400/10'] };
const ICONS = { Mesh:'rotate_right', Logic:'terrain', Material:'palette', Anim:'animation', Effect:'auto_awesome', Light:'wb_sunny' };
const TAGS = ['All','Mesh','Logic','Material','Anim','Effect','Light'];

function BlueprintGallery({ onSelect, selectedId }) {
  const [activeTag, setActiveTag] = useState('All');
  const list = activeTag==='All' ? GALLERY_IMAGES : GALLERY_IMAGES.filter(b=>b.tag===activeTag);
  return (
    <div className="col-span-12 bg-[#1E1028]/40 backdrop-blur-[24px] border border-white/5 rounded-3xl p-5 lg:p-7">
      <div className="flex flex-wrap items-center justify-between gap-4 mb-5">
        <div>
          <h2 className="text-lg font-headline font-bold text-on-surface">Generated Blueprints</h2>
          <p className="text-[11px] font-body text-on-surface-variant/60 mt-0.5">{GALLERY_IMAGES.length} Blueprint Classes · Click to use as 3D source</p>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {TAGS.map(t=>(
            <button key={t} onClick={()=>setActiveTag(t)}
              className={`px-3 py-1 rounded-full text-[10px] font-label uppercase tracking-widest font-bold transition-all ${activeTag===t?'bg-primary text-on-primary':'bg-white/5 text-on-surface-variant/60 hover:text-primary hover:bg-primary/10'}`}>{t}</button>
          ))}
        </div>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {list.map(bp => {
          const [tc,bc] = TAG_META[bp.tag]??['text-primary','bg-primary/10'];
          const isSelected = selectedId === bp.id;
          return (
            <button key={bp.id} onClick={() => onSelect(bp)}
              className={`group relative bg-[#1E1028]/60 border rounded-2xl overflow-hidden text-left transition-all duration-300 ${isSelected ? 'border-secondary ring-2 ring-secondary/40' : 'border-white/5 hover:border-primary/30'}`}>
              <div className="relative h-28 bg-[#110b1a]">
                <img src={bp.img} alt={bp.name} className="absolute inset-0 w-full h-full object-cover opacity-15"/>
                <div className="absolute inset-0 p-2"><MiniGraph/></div>
                <div className="absolute inset-0" style={{backgroundImage:'linear-gradient(rgba(255,255,255,0.03) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.03) 1px,transparent 1px)',backgroundSize:'14px 14px'}}/>
                <span className={`absolute top-1.5 right-1.5 text-[8px] font-label font-bold uppercase tracking-widest px-1.5 py-0.5 rounded-full ${bc} ${tc}`}>{bp.tag}</span>
                {isSelected && <div className="absolute inset-0 bg-secondary/10 flex items-center justify-center"><span className="material-symbols-outlined text-secondary text-2xl" style={FILL}>check_circle</span></div>}
              </div>
              <div className="p-3">
                <div className="flex items-center gap-1.5">
                  <span className={`material-symbols-outlined text-[14px] ${tc}`} style={FILL}>{ICONS[bp.tag]??'auto_awesome'}</span>
                  <h4 className="text-[11px] font-headline font-bold text-on-surface truncate">{bp.name}</h4>
                </div>
                <p className="text-[9px] font-label text-on-surface-variant/50 mt-1">{bp.nodes} nodes</p>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

/* ─── Page ─────────────────────────────────────────────────────────────────── */
export default function IntelligencePage() {
  const [connected, setConnected] = useState(null);   // { img, name, ... }
  const [generating, setGenerating] = useState(false);
  const [selectedGallery, setSelectedGallery] = useState(null);

  const handleGenerate3D = useCallback((data) => {
    setGenerating(true);
    setTimeout(() => { setGenerating(false); setConnected(data); }, 2900);
  }, []);

  const handleGallerySelect = useCallback((bp) => {
    setSelectedGallery(bp.id);
  }, []);

  return (
    <>
      <style>{KEYFRAMES}</style>
      <main className="p-4 sm:p-6 lg:p-8">
        {/* Header */}
        <header className="mb-7 max-w-5xl">
          <div className="flex flex-wrap items-center gap-3 mb-3">
            <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-secondary/10 border border-secondary/20">
              <span className="w-1.5 h-1.5 rounded-full bg-secondary animate-pulse"/>
              <span className="text-[10px] font-label uppercase tracking-widest text-secondary font-bold">Blueprint Editor Active</span>
            </div>
            {connected && (
              <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-900/40 border border-emerald-500/30" style={{animation:'fadeIn .4s ease'}}>
                <span className="material-symbols-outlined text-emerald-400 text-[14px]" style={FILL}>link</span>
                <span className="text-[10px] font-label text-emerald-400 uppercase tracking-widest font-bold">3D Asset Linked · {connected.name}</span>
              </div>
            )}
          </div>
          <h1 className="text-4xl sm:text-5xl font-headline font-extrabold text-on-surface tracking-tight">
            Intelligence <span className="text-secondary italic font-light">&</span> Hub
          </h1>
          <p className="mt-3 text-base text-on-surface-variant/80 font-body max-w-2xl leading-relaxed">
            Pilih gambar yang sudah dibuat, generate 3D mesh-nya, lalu hubungkan langsung ke Blueprint Class untuk animasi interaktif.
          </p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 lg:gap-8">

          {/* ── Image → 3D Generator ── */}
          <ImageTo3DGenerator
            onGenerate={handleGenerate3D}
            connected={connected}
            generating={generating}
          />

          {/* ── Blueprint IDE ── */}
          <div className="col-span-12 bg-[#1a0f2a]/60 backdrop-blur-[24px] border border-white/5 rounded-3xl p-4 lg:p-6 overflow-hidden">
            {/* IDE title bar */}
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-primary-container/40 border border-primary/15 flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-primary" style={FILL}>architecture</span>
              </div>
              <div className="flex-1 min-w-0">
                <h2 className="text-base font-headline font-bold text-on-surface">Design Generative · Blueprint Class</h2>
                <p className="text-[10px] font-label text-on-surface-variant/60 uppercase tracking-widest mt-0.5">
                  Unreal Engine · Blueprint Class Assets{connected ? ` · Linked: ${connected.name}` : ''}
                </p>
              </div>
              <div className="hidden sm:flex items-center gap-2">
                {['save','file_copy','settings'].map(ic => (
                  <button key={ic} className="w-8 h-8 flex items-center justify-center rounded-lg bg-white/5 text-on-surface-variant/50 hover:text-primary hover:bg-primary/10 transition-colors">
                    <span className="material-symbols-outlined text-[16px]">{ic}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Two-panel: viewport + graph */}
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 mb-4" style={{height:'clamp(360px,52vh,480px)'}}>
              <div className="lg:col-span-2 h-full"><Viewport3D connected={connected} generating={generating}/></div>
              <div className="lg:col-span-3 h-full"><BlueprintGraph connected={connected}/></div>
            </div>

            <BpPrompt/>
          </div>

          {/* ── Gallery ── */}
          <BlueprintGallery onSelect={handleGallerySelect} selectedId={selectedGallery}/>
        </div>
      </main>
    </>
  );
}
