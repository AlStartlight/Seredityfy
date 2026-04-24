'use client';

import { useState } from 'react';
import Link from 'next/link';

const FILL = { fontVariationSettings: "'FILL' 1" };

/* ─── CSS keyframes injected once ─────────────────────────────────────────── */
const KEYFRAMES = `
@keyframes rotateMesh {
  from { transform: rotateX(22deg) rotateY(0deg); }
  to   { transform: rotateX(22deg) rotateY(360deg); }
}
@keyframes execPulse {
  0%,100% { opacity:0; } 40%,60% { opacity:0.9; }
}
@keyframes nodeActive {
  0%,100% { box-shadow:0 0 0px rgba(213,186,255,0); }
  50%      { box-shadow:0 0 18px rgba(213,186,255,0.5); }
}
`;

/* ─── 3-D Wireframe Viewport ───────────────────────────────────────────────── */

const CUBE_FACES = [
  'translateZ(52px)',
  'rotateY(180deg) translateZ(52px)',
  'rotateY(-90deg) translateZ(52px)',
  'rotateY(90deg)  translateZ(52px)',
  'rotateX(90deg)  translateZ(52px)',
  'rotateX(-90deg) translateZ(52px)',
];

function Viewport3D() {
  const [mode, setMode] = useState('wireframe');
  return (
    <div className="flex flex-col h-full bg-[#0d0a14] rounded-xl overflow-hidden border border-white/5">
      {/* toolbar */}
      <div className="flex items-center justify-between px-3 py-1.5 border-b border-white/5 shrink-0">
        <span className="text-[10px] font-label text-primary/70 uppercase tracking-widest">Perspective · Lit</span>
        <div className="flex items-center gap-1">
          {[['grid_on','Grid'],['view_in_ar','Wireframe'],['wb_sunny','Lit']].map(([icon, m]) => (
            <button key={m} onClick={() => setMode(m)}
              className={`px-2 py-0.5 rounded text-[9px] font-label uppercase tracking-widest transition-colors ${mode===m ? 'text-primary bg-primary/10' : 'text-on-surface-variant/40 hover:text-primary'}`}>
              {m}
            </button>
          ))}
        </div>
      </div>

      {/* scene */}
      <div className="flex-1 relative flex items-center justify-center overflow-hidden">
        {/* floor grid perspective */}
        <div className="absolute inset-0 pointer-events-none" style={{
          backgroundImage:'linear-gradient(rgba(213,186,255,0.06) 1px,transparent 1px),linear-gradient(90deg,rgba(213,186,255,0.06) 1px,transparent 1px)',
          backgroundSize:'28px 28px',
          transform:'perspective(350px) rotateX(55deg) translateY(55px)',
          transformOrigin:'center bottom',
        }}/>

        {/* ambient glow blob */}
        <div className="absolute w-52 h-52 rounded-full bg-primary/8 blur-3xl pointer-events-none"/>

        {/* CSS 3D cube */}
        <div style={{perspective:'520px'}}>
          <div style={{
            width:104, height:104,
            transformStyle:'preserve-3d',
            animation:'rotateMesh 11s linear infinite',
            position:'relative',
          }}>
            {CUBE_FACES.map((t,i) => (
              <div key={i} style={{
                position:'absolute', inset:0,
                border:'1.5px solid rgba(213,186,255,0.45)',
                transform:t,
                background:'rgba(213,186,255,0.02)',
              }}/>
            ))}
            {/* inner diagonal cross */}
            <div style={{
              position:'absolute', inset:0,
              border:'1px solid rgba(255,171,243,0.15)',
              transform:'translateZ(52px) rotate(45deg) scale(1.41)',
            }}/>
          </div>
        </div>

        {/* axis labels */}
        <div className="absolute bottom-2 left-3 flex gap-2.5">
          {[['X','text-red-400'],['Y','text-emerald-400'],['Z','text-sky-400']].map(([ax,c])=>(
            <span key={ax} className={`text-[9px] font-mono font-bold ${c}`}>{ax}</span>
          ))}
        </div>
        <div className="absolute bottom-2 right-3 text-right space-y-0.5">
          <div className="text-[9px] font-mono text-on-surface-variant/40">Verts 24</div>
          <div className="text-[9px] font-mono text-on-surface-variant/40">Tris  12</div>
        </div>
      </div>
    </div>
  );
}

/* ─── Blueprint Graph ──────────────────────────────────────────────────────── */

/* Pin visual — exec=diamond, data=circle */
function Pin({ type = 'exec', label = '', side = 'left' }) {
  const DOT = {
    exec: 'w-2.5 h-2.5 rotate-45 border border-white bg-transparent',
    object: 'w-2.5 h-2.5 rounded-full bg-[#1678C8]',
    float: 'w-2.5 h-2.5 rounded-full bg-[#A5E44A]',
    transform: 'w-2.5 h-2.5 rounded-full bg-[#E9CF57]',
    bool: 'w-2.5 h-2.5 rounded-full bg-[#FF3D3D]',
  };
  const dot = <div className={`shrink-0 ${DOT[type] ?? DOT.object}`}/>;
  return (
    <div className={`flex items-center gap-1.5 py-[3px] ${side==='right'?'flex-row-reverse':''}`}>
      {dot}
      {label && <span className="text-[10px] font-label text-white/55 whitespace-nowrap">{label}</span>}
    </div>
  );
}

/* Single blueprint node */
function BpNode({ type, title, icon, x, y, ins=[], outs=[], active=false }) {
  const HDR = {
    event:    'bg-[#7A1818]',
    function: 'bg-[#0F3A6B]',
    pure:     'bg-[#184A2E]',
    macro:    'bg-[#3B1A56]',
  };
  const ICO = {
    event:'text-yellow-300', function:'text-blue-300',
    pure:'text-emerald-300', macro:'text-purple-300',
  };
  return (
    <div className="absolute rounded-md overflow-hidden border border-white/10 bg-[#1E1028]/95"
      style={{ left:x, top:y, minWidth:155,
        animation: active ? 'nodeActive 2s ease-in-out infinite' : 'none' }}>
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

/* Wires overlay (SVG) */
function Wires() {
  /* cubic bezier: start from right-pin of source, curve to left-pin of target */
  const wires = [
    /* exec: BeginPlay → SetStaticMesh */
    { d:'M 163,52 C 190,52 193,44 218,44', stroke:'#ffffff', w:1.8, pulse:true, delay:0 },
    /* object: GetMesh → SetStaticMesh NewMesh */
    { d:'M 163,161 C 195,161 195,84 218,84', stroke:'#1678C8', w:1.5, pulse:false },
    /* exec: Tick → AddRotation */
    { d:'M 154,248 C 190,248 192,238 218,238', stroke:'#ffffff', w:1.8, pulse:true, delay:0.9 },
    /* transform: MakeRotator → AddRotation DeltaRotation */
    { d:'M 154,337 C 190,337 190,278 218,278', stroke:'#E9CF57', w:1.5, pulse:false },
    /* exec: SetStaticMesh → (dangling out) */
    { d:'M 393,44 C 420,44 430,44 450,44', stroke:'#ffffff', w:1.8, pulse:false },
    /* exec: AddRotation out */
    { d:'M 393,238 C 420,238 430,238 450,238', stroke:'#ffffff', w:1.8, pulse:false },
  ];
  return (
    <svg className="absolute inset-0 pointer-events-none overflow-visible"
      style={{width:'100%',height:'100%'}} viewBox="0 0 520 400" preserveAspectRatio="none">
      <defs>
        <filter id="wglow">
          <feGaussianBlur stdDeviation="2.5" result="blur"/>
          <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
        </filter>
      </defs>
      {wires.map((w,i) => (
        <g key={i}>
          {/* base wire */}
          <path d={w.d} stroke={w.stroke} strokeWidth={w.w} fill="none" opacity="0.65"/>
          {/* animated exec pulse */}
          {w.pulse && (
            <path d={w.d} stroke="#ffabf3" strokeWidth="3" fill="none" filter="url(#wglow)"
              style={{animation:`execPulse 2.2s ease-in-out ${w.delay??0}s infinite`}}/>
          )}
        </g>
      ))}
    </svg>
  );
}

function BlueprintGraph() {
  return (
    <div className="relative w-full bg-[#110b1a] rounded-xl overflow-hidden border border-white/5 flex flex-col"
      style={{minHeight:420}}>
      {/* toolbar */}
      <div className="flex items-center gap-3 px-3 py-1.5 border-b border-white/5 shrink-0 bg-[#0e0918]">
        {[['compile','Compile'],['play_arrow','Simulate'],['bug_report','Debug']].map(([ic,lb])=>(
          <button key={lb} className="flex items-center gap-1 px-2 py-1 rounded text-[10px] font-label text-on-surface-variant/50 hover:text-primary hover:bg-primary/10 transition-colors">
            <span className="material-symbols-outlined text-[14px]">{ic}</span>{lb}
          </button>
        ))}
        <div className="ml-auto flex items-center gap-1 px-2 py-0.5 rounded bg-emerald-900/40 border border-emerald-500/30">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"/>
          <span className="text-[9px] font-label text-emerald-400 uppercase tracking-widest">Compiled</span>
        </div>
      </div>

      {/* canvas */}
      <div className="relative flex-1 overflow-auto" style={{height:400}}>
        {/* grid */}
        <div className="absolute inset-0 pointer-events-none" style={{
          backgroundImage:'linear-gradient(rgba(255,255,255,0.04) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.04) 1px,transparent 1px)',
          backgroundSize:'28px 28px',
        }}/>

        {/* wires behind nodes */}
        <Wires/>

        {/* === Nodes === */}
        <BpNode type="event" title="Event BeginPlay" icon="bolt"
          x={18} y={20}
          ins={[]}
          outs={[{type:'exec'}]}
          active />

        <BpNode type="function" title="Set Static Mesh" icon="deployed_code"
          x={218} y={10}
          ins={[{type:'exec'},{type:'object',label:'Target'},{type:'object',label:'New Mesh'}]}
          outs={[{type:'exec'}]} />

        <BpNode type="pure" title="Get Mesh Component" icon="view_in_ar"
          x={18} y={130}
          ins={[]}
          outs={[{type:'object',label:'Return Value'}]} />

        <BpNode type="event" title="Event Tick" icon="timelapse"
          x={18} y={215}
          ins={[]}
          outs={[{type:'exec'},{type:'float',label:'Delta Seconds'}]}
          active />

        <BpNode type="function" title="Add Actor Rotation" icon="rotate_right"
          x={218} y={205}
          ins={[{type:'exec'},{type:'object',label:'Target'},{type:'transform',label:'Delta Rotation'}]}
          outs={[{type:'exec'}]} />

        <BpNode type="pure" title="Make Rotator" icon="3d_rotation"
          x={18} y={308}
          ins={[{type:'float',label:'Pitch'},{type:'float',label:'Yaw'}]}
          outs={[{type:'transform',label:'Return Value'}]} />
      </div>

      {/* minimap */}
      <div className="absolute bottom-3 right-3 w-24 h-16 bg-[#0e0918]/80 border border-white/10 rounded-lg overflow-hidden pointer-events-none">
        <div className="absolute inset-0 scale-[0.22] origin-top-left opacity-60">
          <div className="absolute w-24 h-9 left-3 top-3 bg-[#7A1818]/60 rounded-sm"/>
          <div className="absolute w-28 h-14 left-36 top-2 bg-[#0F3A6B]/60 rounded-sm"/>
          <div className="absolute w-24 h-9 left-3 top-20 bg-[#184A2E]/60 rounded-sm"/>
          <div className="absolute w-24 h-9 left-3 top-33 bg-[#7A1818]/60 rounded-sm"/>
          <div className="absolute w-28 h-14 left-36 top-32 bg-[#0F3A6B]/60 rounded-sm"/>
          <div className="absolute w-22 h-12 left-3 top-48 bg-[#184A2E]/60 rounded-sm"/>
        </div>
        <div className="absolute inset-1 border border-primary/30 rounded pointer-events-none"/>
      </div>
    </div>
  );
}

/* ─── Prompt + Generate ────────────────────────────────────────────────────── */
function BlueprintPrompt({ onGenerate }) {
  const [val, setVal] = useState('');
  return (
    <div className="bg-[#1E1028]/70 rounded-2xl p-4 border border-white/5">
      <label className="text-[10px] font-label uppercase tracking-widest text-on-surface-variant/60 block mb-2">
        Blueprint Class Prompt
      </label>
      <div className="flex gap-3">
        <input
          type="text"
          value={val}
          onChange={e=>setVal(e.target.value)}
          placeholder='e.g. "Rotating platform with trigger-zone and material swap on overlap…"'
          className="flex-1 bg-[#110b1a] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-on-surface placeholder:text-on-surface-variant/30 font-body focus:outline-none focus:border-primary/50 transition-colors"
        />
        <button
          onClick={() => onGenerate(val)}
          className="shrink-0 flex items-center gap-2 bg-primary text-on-primary font-label font-bold px-5 py-2.5 rounded-xl shadow-lg shadow-primary/20 active:scale-[0.98] transition-transform"
        >
          <span className="material-symbols-outlined text-[18px]" style={FILL}>bolt</span>
          Generate
        </button>
      </div>
    </div>
  );
}

/* ─── Blueprint Gallery ────────────────────────────────────────────────────── */

const MOCK_BPS = [
  { name:'BP_RotatingMesh',  type:'Blueprint Class', tag:'Mesh',     nodes:6,  icon:'rotate_right',   color:'text-primary',   bg:'bg-primary/10',   updated:'2 min ago',  img:'/assets/card1.png' },
  { name:'BP_ProceduralTerrain', type:'Blueprint Class', tag:'Logic', nodes:14, icon:'terrain',      color:'text-emerald-400',bg:'bg-emerald-400/10',updated:'18 min ago', img:'/assets/image_12.png' },
  { name:'BP_MaterialSwapper',   type:'Blueprint Class', tag:'Material',nodes:8,icon:'palette',      color:'text-secondary', bg:'bg-secondary/10', updated:'1 hr ago',   img:'/assets/card2.png' },
  { name:'BP_AnimController',    type:'Blueprint Class', tag:'Anim',   nodes:11, icon:'animation',   color:'text-yellow-400',bg:'bg-yellow-400/10', updated:'3 hr ago',   img:'/assets/card3.png' },
  { name:'BP_ParticleSpawner',   type:'Blueprint Class', tag:'Effect', nodes:9,  icon:'auto_awesome', color:'text-tertiary',  bg:'bg-tertiary/10',  updated:'5 hr ago',   img:'/assets/image6.png' },
  { name:'BP_DynamicLight',      type:'Blueprint Class', tag:'Light',  nodes:7,  icon:'wb_sunny',    color:'text-orange-400',bg:'bg-orange-400/10',updated:'Yesterday',  img:'/assets/image2.png' },
];

const TAGS = ['All','Mesh','Logic','Material','Anim','Effect','Light'];

/* Mini blueprint node SVG for card thumbnails */
function MiniGraph({ color = '#d5baff' }) {
  return (
    <svg viewBox="0 0 120 70" className="w-full h-full opacity-70">
      <rect x="4"  y="8"  width="42" height="16" rx="3" fill="#7A1818" opacity="0.8"/>
      <rect x="4"  y="8"  width="42" height="7"  rx="3" fill="#9B2222"/>
      <rect x="66" y="4"  width="48" height="22" rx="3" fill="#0F3A6B" opacity="0.8"/>
      <rect x="66" y="4"  width="48" height="7"  rx="3" fill="#1A5080"/>
      <rect x="4"  y="38" width="42" height="16" rx="3" fill="#184A2E" opacity="0.8"/>
      <rect x="4"  y="38" width="42" height="7"  rx="3" fill="#1F6040"/>
      <rect x="66" y="34" width="48" height="22" rx="3" fill="#0F3A6B" opacity="0.8"/>
      <rect x="66" y="34" width="48" height="7"  rx="3" fill="#1A5080"/>
      <path d="M 46,16 C 56,16 56,15 66,15" stroke="white"       strokeWidth="1.2" fill="none" opacity="0.7"/>
      <path d="M 46,46 C 56,46 56,45 66,45" stroke="white"       strokeWidth="1.2" fill="none" opacity="0.7"/>
      <path d="M 46,52 C 56,52 56,28 66,26" stroke={color}       strokeWidth="1"   fill="none" opacity="0.6"/>
      <circle cx="46" cy="52" r="2.5" fill={color} opacity="0.8"/>
      <circle cx="66" cy="26" r="2.5" fill={color} opacity="0.8"/>
    </svg>
  );
}

function BlueprintCard({ bp }) {
  return (
    <div className="group relative bg-[#1E1028]/60 border border-white/5 rounded-2xl overflow-hidden hover:border-primary/30 transition-all duration-300">
      {/* Preview area */}
      <div className="relative h-36 bg-[#110b1a] overflow-hidden">
        {/* Actual image behind */}
        <img src={bp.img} alt={bp.name} className="absolute inset-0 w-full h-full object-cover opacity-15"/>
        {/* Blueprint graph overlay */}
        <div className="absolute inset-0 p-3">
          <MiniGraph color={bp.color.replace('text-','').includes('primary') ? '#d5baff' : '#ffabf3'} />
        </div>
        {/* Grid overlay */}
        <div className="absolute inset-0 pointer-events-none" style={{
          backgroundImage:'linear-gradient(rgba(255,255,255,0.03) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.03) 1px,transparent 1px)',
          backgroundSize:'16px 16px',
        }}/>
        {/* Tag badge */}
        <span className={`absolute top-2 right-2 text-[9px] font-label font-bold uppercase tracking-widest px-2 py-0.5 rounded-full ${bp.bg} ${bp.color}`}>
          {bp.tag}
        </span>
      </div>

      {/* Info */}
      <div className="p-4">
        <div className="flex items-start justify-between gap-2">
          <div>
            <h4 className="text-sm font-headline font-bold text-on-surface leading-tight">{bp.name}</h4>
            <p className="text-[10px] font-label text-on-surface-variant/60 mt-0.5">{bp.type}</p>
          </div>
          <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${bp.bg}`}>
            <span className={`material-symbols-outlined text-[16px] ${bp.color}`} style={FILL}>{bp.icon}</span>
          </div>
        </div>

        <div className="flex items-center justify-between mt-3 pt-3 border-t border-white/5">
          <div className="flex items-center gap-1.5 text-[10px] font-label text-on-surface-variant/50">
            <span className="material-symbols-outlined text-[12px]">account_tree</span>
            {bp.nodes} nodes
          </div>
          <span className="text-[10px] font-label text-on-surface-variant/40">{bp.updated}</span>
        </div>
      </div>

      {/* Hover actions */}
      <div className="absolute inset-0 bg-gradient-to-t from-[#1f0438]/90 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-4 gap-2">
        <button className="flex-1 py-2 bg-primary/90 text-on-primary text-[11px] font-label font-bold rounded-xl">
          Open Blueprint
        </button>
        <button className="w-9 h-9 bg-white/10 rounded-xl flex items-center justify-center text-white">
          <span className="material-symbols-outlined text-[16px]">more_vert</span>
        </button>
      </div>
    </div>
  );
}

function BlueprintGallery() {
  const [activeTag, setActiveTag] = useState('All');
  const filtered = activeTag === 'All' ? MOCK_BPS : MOCK_BPS.filter(b => b.tag === activeTag);

  return (
    <div className="col-span-12 bg-[#1E1028]/40 backdrop-blur-[24px] border border-white/5 rounded-3xl p-6 lg:p-8">
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="text-xl lg:text-2xl font-headline font-bold text-on-surface">
            Generated Blueprints
          </h2>
          <p className="text-sm text-on-surface-variant/70 font-body mt-1">
            {MOCK_BPS.length} Blueprint Classes created
          </p>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {TAGS.map(t => (
            <button key={t} onClick={() => setActiveTag(t)}
              className={`px-3 py-1 rounded-full text-[10px] font-label uppercase tracking-widest font-bold transition-all ${
                activeTag===t ? 'bg-primary text-on-primary' : 'bg-white/5 text-on-surface-variant/60 hover:text-primary hover:bg-primary/10'
              }`}>
              {t}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {filtered.map(bp => <BlueprintCard key={bp.name} bp={bp}/>)}
      </div>

      <div className="mt-6 flex justify-center">
        <button className="flex items-center gap-2 px-6 py-2.5 rounded-xl border border-white/10 text-on-surface-variant/60 text-sm font-label hover:border-primary/40 hover:text-primary transition-all">
          <span className="material-symbols-outlined text-[18px]">add</span>
          Load More Blueprints
        </button>
      </div>
    </div>
  );
}

/* ─── Page ─────────────────────────────────────────────────────────────────── */

export default function IntelligencePage() {
  const [generated, setGenerated] = useState(false);

  return (
    <>
      <style>{KEYFRAMES}</style>
      <main className="p-4 sm:p-6 lg:p-8">
        {/* Header */}
        <header className="mb-8 max-w-5xl">
          <div className="flex items-center gap-3 mb-3">
            <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-secondary/10 border border-secondary/20">
              <span className="w-1.5 h-1.5 rounded-full bg-secondary animate-pulse"/>
              <span className="text-[10px] font-label uppercase tracking-widest text-secondary font-bold">Blueprint Editor Active</span>
            </div>
            <span className="text-[10px] font-label text-on-surface-variant/40 uppercase tracking-widest">Powered by Gemini Flash 2.5</span>
          </div>
          <h1 className="text-4xl sm:text-5xl font-headline font-extrabold text-on-surface tracking-tight">
            Intelligence <span className="text-secondary italic font-light">&</span> Hub
          </h1>
          <p className="mt-3 text-base text-on-surface-variant/80 font-body max-w-2xl leading-relaxed">
            Design, generate, and animate Blueprint Classes — visual scripting nodes, 3D viewport, and execution graph in one workspace.
          </p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 lg:gap-8">

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
                  Unreal Engine · Blueprint Class Assets
                </p>
              </div>
              <div className="hidden sm:flex items-center gap-2">
                {['save','file_copy','settings'].map(ic=>(
                  <button key={ic} className="w-8 h-8 flex items-center justify-center rounded-lg bg-white/5 text-on-surface-variant/50 hover:text-primary hover:bg-primary/10 transition-colors">
                    <span className="material-symbols-outlined text-[16px]">{ic}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Two-panel: viewport + graph */}
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 mb-4" style={{height:'clamp(360px,50vh,460px)'}}>
              <div className="lg:col-span-2 h-full"><Viewport3D/></div>
              <div className="lg:col-span-3 h-full"><BlueprintGraph/></div>
            </div>

            {/* Prompt */}
            <BlueprintPrompt onGenerate={() => setGenerated(true)}/>
          </div>

          {/* ── All Generated Blueprints ── */}
          <BlueprintGallery/>
        </div>
      </main>
    </>
  );
}
