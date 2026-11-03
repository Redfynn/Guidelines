import {AbsoluteFill, Easing, Img, interpolate, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import {fontFamily} from './font';

// Flat-vector explainer (worked-number posts). Drawn in code, brand palette only: white, charcoal, slate,
// smoke, with red as the accent for the one number that matters. Words are set here, never generated.
const CH = '#1C1B1F';
const SLATE = '#4D4C4E';
const SMOKE = '#D2D1D2';
const SOFT = '#F2F2F2';
const RED = '#ED3E25';
// Warm tints from the brand gradient treatment (same values the Announcement panel uses).
const ORANGE = '#FF8A3D';
const PEACH = '#F7B58A';
const CREAM = '#FFE3CC';
const DEEP = '#C9201A';
const GRAIN =
  "url(\"data:image/svg+xml;utf8,%3Csvg xmlns='http://www.w3.org/2000/svg' width='220' height='220'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.9' numOctaves='2' stitchTiles='stitch'/%3E%3CfeColorMatrix values='0 0 0 0 1 0 0 0 0 1 0 0 0 0 1 0 0 0 .9 0'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")";
const gradBg = `radial-gradient(circle at 30% 25%, ${ORANGE} 0%, transparent 55%), radial-gradient(circle at 75% 70%, ${PEACH} 0%, transparent 50%), radial-gradient(circle at 50% 95%, ${DEEP} 0%, transparent 60%), ${RED}`;
const Grad = ({style}: {style: React.CSSProperties}) => (
  <div style={{position: 'absolute', overflow: 'hidden', background: gradBg, ...style}}>
    <div style={{position: 'absolute', inset: 0, backgroundImage: GRAIN, mixBlendMode: 'soft-light', opacity: 0.55}} />
  </div>
);
const CLAMP = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;
const ease = Easing.out(Easing.cubic);
const back = Easing.out(Easing.back(1.6));

export type FlatProps = {
  kicker: string;
  docs: string[];
  rows: {label: string; value: number}[];
  caption: string;
  tag: string;
};
export const flatDefaults: FlatProps = {
  kicker: 'Reconcile one merchant',
  docs: ['Merchant statement', 'Schedule A', 'Residual report'],
  rows: [
    {label: 'Expected', value: 186},
    {label: 'Reported', value: 156},
    {label: 'Gap', value: 30},
  ],
  caption: "A $30 gap at a 60% split points to $50 of cost inserted where you can't see it.",
  tag: 'Illustrative example',
};

const Doc = ({x, y, rot, p}: {x: number; y: number; rot: number; p: number}) => (
  <g transform={`translate(${x} ${y + (1 - p) * -260}) rotate(${rot})`} opacity={p}>
    <rect x={-120} y={-150} width={240} height={300} rx={18} fill="#fff" stroke={SMOKE} strokeWidth={6} />
    <rect x={-84} y={-108} width={110} height={14} rx={7} fill={RED} />
    {[-70, -38, -6, 26, 58].map((yy, i) => (
      <rect key={yy} x={-84} y={yy} width={i % 2 ? 150 : 168} height={11} rx={5.5} fill={i % 2 ? SMOKE : PEACH} />
    ))}
  </g>
);

export const FlatExplainer = (p: FlatProps) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const t = frame / fps;

  const s1 = interpolate(t, [3.4, 4.0], [1, 0], CLAMP);
  const s2 = interpolate(t, [3.6, 4.3], [0, 1], CLAMP);
  const breathe = Math.sin(frame / 14) * 6;
  const head = Math.sin(frame / 20) * 3;
  const pop = (start: number) => interpolate(t, [start, start + 0.7], [0, 1], {...CLAMP, easing: back});
  const rise = (start: number, dur = 0.7) => interpolate(t, [start, start + dur], [0, 1], {...CLAMP, easing: ease});

  const max = p.rows[0].value;
  const barW = 880;

  return (
    <AbsoluteFill style={{backgroundColor: '#fff', fontFamily, color: CH}}>
      {/* kicker */}
      <div style={{position: 'absolute', left: 80, top: 190, fontWeight: 300, fontSize: 38, letterSpacing: '0.12em', textTransform: 'uppercase', opacity: rise(0.1), transform: `translateY(${(1 - rise(0.1)) * 30}px)`}}>{p.kicker}</div>

      {/* scene 1: partner at a desk, three documents arrive */}
      <Grad style={{left: 110, top: 330, width: 860, height: 860, borderRadius: 430, opacity: s1}} />
      <svg width={1080} height={1920} viewBox="0 0 1080 1920" style={{position: 'absolute', inset: 0, opacity: s1}}>
        <g transform="translate(0 -140)">
        {/* desk */}
        <rect x={110} y={1180} width={860} height={34} rx={12} fill={CH} />
        <circle cx={540} cy={1115} r={14} fill={ORANGE} />
        <rect x={150} y={1214} width={780} height={20} rx={10} fill={SMOKE} />
        {/* figure (monochrome flat style) */}
        <g transform={`translate(0 ${breathe * 0.4})`}>
          <rect x={420} y={880} width={240} height={310} rx={70} fill={CH} />
          <rect x={497} y={850} width={86} height={50} rx={20} fill={CREAM} />
          <path d="M 492 884 L 540 940 L 588 884 L 570 880 L 540 912 L 510 880 Z" fill="#fff" />
          <path d="M 530 920 L 550 920 L 556 990 L 540 1008 L 524 990 Z" fill={RED} />
          <g transform={`translate(540 ${770 + head})`}>
            <circle r={96} fill={CREAM} />
            <ellipse cx={-62} cy={34} rx={16} ry={10} fill={PEACH} opacity={0.8} />
            <ellipse cx={62} cy={34} rx={16} ry={10} fill={PEACH} opacity={0.8} />
            <path d="M -98 -10 A 98 98 0 0 1 98 -10 Q 60 -62 0 -58 Q -60 -62 -98 -10 Z" fill={CH} />
            <circle cx={-34} cy={6} r={9} fill={CH} />
            <circle cx={34} cy={6} r={9} fill={CH} />
            <path d="M -26 44 Q 0 62 26 44" stroke={CH} strokeWidth={8} fill="none" strokeLinecap="round" />
          </g>
        </g>
        {/* laptop */}
        <rect x={400} y={1050} width={280} height={130} rx={14} fill={SLATE} />
        <rect x={380} y={1168} width={320} height={16} rx={8} fill={CH} />
        {/* documents slide in */}
        <Doc x={250} y={1060} rot={-8} p={pop(0.7)} />
        <Doc x={830} y={1060} rot={8} p={pop(1.3)} />
        <Doc x={540} y={1420} rot={0} p={pop(1.9)} />
        </g>
      </svg>
      {/* document labels */}
      {p.docs.map((d, i) => {
        const pos = [{l: 90, t: 1130}, {l: 660, t: 1130}, {l: 375, t: 1470}][i];
        const a = pop(0.9 + i * 0.6) * s1;
        return (
          <div key={d} style={{position: 'absolute', left: pos.l, top: pos.t, width: 330, textAlign: 'center', fontWeight: 400, fontSize: 40, opacity: a}}>{d}</div>
        );
      })}
      {/* arrow and line */}
      <div style={{position: 'absolute', left: 0, right: 0, textAlign: 'center', top: 1560, fontWeight: 300, fontSize: 48, color: SLATE, opacity: rise(2.6) * s1}}>Put all three in front of you.</div>

      {/* scene 2: the numbers as flat bars */}
      <div style={{position: 'absolute', left: 100, top: 380, width: barW, opacity: s2}}>
        {p.rows.map((r, i) => {
          const start = 4.1 + i * 0.8;
          const g = rise(start, 0.9);
          const n = r.value * g;
          const gap = i === p.rows.length - 1;
          const fill = gap ? RED : i === 0 ? ORANGE : CH;
          const w = (n / max) * barW;
          return (
            <div key={r.label} style={{marginBottom: 52}}>
              <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 20}}>
                <span style={{fontWeight: 300, fontSize: 48, letterSpacing: '0.08em', textTransform: 'uppercase', color: SLATE}}>{r.label}</span>
                <span style={{fontWeight: 400, fontSize: 120, color: gap ? RED : CH}}>${n.toFixed(2)}</span>
              </div>
              <div style={{height: 54, width: barW, borderRadius: 27, background: SOFT}}>
                <div style={{height: 54, width: Math.max(w, 0), borderRadius: 27, background: fill}} />
              </div>
            </div>
          );
        })}
        <div style={{position: 'relative', borderRadius: 48, overflow: 'hidden', padding: '48px 52px', opacity: rise(6.8), transform: `translateY(${(1 - rise(6.8)) * 30}px)`}}>
          <Grad style={{inset: 0}} />
          <div style={{position: 'relative', fontWeight: 400, fontSize: 50, lineHeight: 1.25, color: '#000'}}>{p.caption}</div>
        </div>
        <div style={{fontWeight: 300, fontSize: 32, letterSpacing: '0.1em', textTransform: 'uppercase', color: SLATE, marginTop: 36, opacity: rise(7.3)}}>{p.tag}</div>
      </div>

      <Grad style={{left: 0, right: 0, bottom: 0, height: 14}} />
      {/* logo, static, on white */}
      <div style={{position: 'absolute', left: 80, bottom: 90}}>
        <Img src={staticFile('logo.png')} style={{width: 420, height: 'auto'}} />
      </div>
    </AbsoluteFill>
  );
};
