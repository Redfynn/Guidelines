import {AbsoluteFill, Easing, Img, interpolate, Sequence, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import {fontFamily} from './font';

// Short organic social formats, white and charcoal only (no red backgrounds).
// Text is always set here, never generated. The logo is static.
const CH = '#1C1B1F';
const SLATE = '#4D4C4E';
const CLAMP = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;
const ease = Easing.out(Easing.cubic);

const useRise = (start: number, dur = 0.7) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const a = interpolate(frame, [start * fps, (start + dur) * fps], [0, 1], {...CLAMP, easing: ease});
  return {opacity: a, transform: `translateY(${(1 - a) * 46}px)`};
};

const Foot = ({label}: {label?: string}) => (
  <>
    <div style={{position: 'absolute', left: 80, bottom: 150}}>
      <Img src={staticFile('logo.png')} style={{width: 420, height: 'auto'}} />
    </div>
    {label && (
      <div style={{position: 'absolute', right: 80, bottom: 170, fontWeight: 300, fontSize: 30, letterSpacing: '0.1em', textTransform: 'uppercase', color: SLATE}}>{label}</div>
    )}
  </>
);

// ---------- 1. Kinetic text ----------
export type KineticProps = {overline: string; headline: string[]; footer: string};
export const kineticDefaults: KineticProps = {overline: 'Recognized', headline: ['Two years', 'on the', 'Inc. 5000.'], footer: 'redfynn.com/partners'};
export const KineticText = (p: KineticProps) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const rule = interpolate(frame, [(0.9 + p.headline.length * 0.6) * fps, (1.8 + p.headline.length * 0.6) * fps], [0, 1], {...CLAMP, easing: ease});
  return (
    <AbsoluteFill style={{backgroundColor: '#fff', fontFamily, color: CH}}>
      <div style={{position: 'absolute', left: 80, right: 80, top: 360}}>
        <div style={{...useRise(0.2), fontWeight: 300, fontSize: 38, letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 40}}>{p.overline}</div>
        {p.headline.map((l, i) => (
          <HeadLine key={l} start={0.7 + i * 0.6}>{l}</HeadLine>
        ))}
        <div style={{height: 3, width: `${70 * rule}%`, background: CH, marginTop: 70}} />
        <div style={{...useRise(2.8), fontWeight: 300, fontSize: 52, color: SLATE, marginTop: 36}}>{p.footer}</div>
      </div>
      <Foot />
    </AbsoluteFill>
  );
};
const HeadLine = ({start, children}: {start: number; children: React.ReactNode}) => (
  <div style={{...useRise(start), fontWeight: 400, fontSize: 170, lineHeight: 1.04}}>{children}</div>
);

// ---------- 2. Animated stat card ----------
export type StatProps = {title: string; rows: {label: string; value: number}[]; caption: string; tag: string};
export const statDefaults: StatProps = {
  title: 'Reconciliation, one merchant',
  rows: [
    {label: 'Expected residual', value: 186},
    {label: 'Reported residual', value: 156},
    {label: 'Unexplained gap', value: 30},
  ],
  caption: "A $30 gap at a 60% split points to $50 of cost inserted where you can't see it. On this one merchant, every month, uncaught.",
  tag: 'Illustrative example',
};
export const StatCard = (p: StatProps) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  return (
    <AbsoluteFill style={{backgroundColor: '#fff', fontFamily, color: CH}}>
      <div style={{position: 'absolute', left: 80, right: 80, top: 250}}>
        <div style={{...useRise(0.2), fontWeight: 300, fontSize: 40, letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 60}}>{p.title}</div>
        {p.rows.map((r, i) => {
          const start = 0.9 + i * 0.9;
          const n = interpolate(frame, [start * fps, (start + 0.9) * fps], [0, r.value], {...CLAMP, easing: ease});
          const last = i === p.rows.length - 1;
          return (
            <div key={r.label} style={{...useRise(start - 0.2), display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', padding: '34px 44px', marginBottom: 20, borderRadius: 36, background: last ? CH : '#F2F2F2', color: last ? '#fff' : CH}}>
              <span style={{fontWeight: 300, fontSize: 44}}>{r.label}</span>
              <span style={{fontWeight: 400, fontSize: 104}}>${n.toFixed(2)}</span>
            </div>
          );
        })}
        <div style={{...useRise(3.9), fontWeight: 400, fontSize: 46, lineHeight: 1.25, marginTop: 50}}>{p.caption}</div>
        <div style={{...useRise(4.4), fontWeight: 300, fontSize: 32, letterSpacing: '0.1em', textTransform: 'uppercase', color: SLATE, marginTop: 40}}>{p.tag}</div>
      </div>
      <Foot />
    </AbsoluteFill>
  );
};

// ---------- 3. Article to short ----------
export type ArticleProps = {kicker: string; steps: string[]; cta: string};
export const articleDefaults: ArticleProps = {
  kicker: 'Reconcile one merchant',
  steps: ['Put all three documents in front of you.', 'Pull your markup off the merchant statement.', 'Subtract your real Schedule A costs.', 'Tie the residual report back to the statement.'],
  cta: 'Full walkthrough on the RedFynn blog.',
};
export const ArticleShort = (p: ArticleProps) => {
  const {fps} = useVideoConfig();
  const per = Math.round(1.6 * fps);
  return (
    <AbsoluteFill style={{backgroundColor: '#fff', fontFamily, color: CH}}>
      {p.steps.map((s, i) => (
        <Sequence key={s} from={i * per} durationInFrames={per}>
          <Step n={i + 1} text={s} kicker={p.kicker} />
        </Sequence>
      ))}
      <Sequence from={p.steps.length * per}>
        <AbsoluteFill>
          <div style={{position: 'absolute', left: 80, right: 80, top: 640, ...useRise(0.1), fontWeight: 400, fontSize: 96, lineHeight: 1.1}}>{p.cta}</div>
          <Foot />
        </AbsoluteFill>
      </Sequence>
    </AbsoluteFill>
  );
};
const Step = ({n, text, kicker}: {n: number; text: string; kicker: string}) => (
  <AbsoluteFill>
    <div style={{position: 'absolute', left: 80, right: 80, top: 330}}>
      <div style={{...useRise(0, 0.4), fontWeight: 300, fontSize: 36, letterSpacing: '0.12em', textTransform: 'uppercase', color: SLATE}}>{kicker}</div>
      <div style={{...useRise(0.05, 0.5), fontWeight: 400, fontSize: 300, lineHeight: 1, marginTop: 30}}>{n}</div>
      <div style={{...useRise(0.15, 0.5), fontWeight: 400, fontSize: 84, lineHeight: 1.1, marginTop: 20}}>{text}</div>
    </div>
    <Foot label="Step by step" />
  </AbsoluteFill>
);

// ---------- 4. Animated still (slow push-in) ----------
export type ParallaxProps = {image: string; line: string};
export const parallaxDefaults: ParallaxProps = {image: 'mood-still.jpg', line: 'Built with our partners.'};
export const Parallax = (p: ParallaxProps) => {
  const frame = useCurrentFrame();
  const {durationInFrames} = useVideoConfig();
  const t = frame / durationInFrames;
  const scale = 1.04 + t * 0.14;
  const y = -t * 70;
  return (
    <AbsoluteFill style={{backgroundColor: '#fff', fontFamily}}>
      <AbsoluteFill style={{overflow: 'hidden'}}>
        <Img src={staticFile(p.image)} style={{width: '100%', height: '100%', objectFit: 'cover', transform: `scale(${scale}) translateY(${y}px)`}} />
      </AbsoluteFill>
      <div style={{position: 'absolute', left: 60, right: 60, bottom: 150, display: 'flex', justifyContent: 'center', ...useRise(0.8)}}>
        <div style={{background: 'rgba(255,255,255,0.92)', borderRadius: 48, padding: '40px 56px', textAlign: 'center', color: CH, fontWeight: 400, fontSize: 84, lineHeight: 1.08}}>{p.line}</div>
      </div>
    </AbsoluteFill>
  );
};
