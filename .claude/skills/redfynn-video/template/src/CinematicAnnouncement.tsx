import {AbsoluteFill, Audio, Easing, Img, interpolate, OffthreadVideo, Sequence, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import {fontFamily} from './font';

// Cinematic announcement: footage cuts every few seconds, one sentence builds in lines over each cut,
// an overline pill, a music bed, then a white end card with the static logo.
// Footage can be real or generated. Text is always set here, never generated.
export type Scene = {clip: string; startSeconds: number; seconds: number; lines: string[]};
export type CinematicProps = {
  pill: string;
  scenes: Scene[];
  closing: string[];
  url: string;
  endSeconds: number;
  fadeSeconds: number;
  music: string;
  musicVolume: number;
};

export const cinematicDefaults: CinematicProps = {
  pill: 'INC. 5000 · 2026',
  scenes: [
    {clip: 'scene1.mp4', startSeconds: 0, seconds: 5, lines: ['Two years', 'on the Inc. 5000.']},
    {clip: 'scene2.mp4', startSeconds: 0, seconds: 5, lines: ['135% revenue growth,', '2022 to 2025.']},
    {clip: 'scene3.mp4', startSeconds: 0, seconds: 5, lines: ['Built with', 'our partners.']},
  ],
  closing: ['Built with', 'our partners.'],
  url: 'redfynn.com/partners',
  endSeconds: 5,
  fadeSeconds: 0.5,
  music: 'celebration-music.m4a',
  musicVolume: 0.6,
};

export const cinematicSeconds = (p: CinematicProps) => p.scenes.reduce((s, x) => s + x.seconds, 0) + p.endSeconds;

const CH = '#1C1B1F';
const SLATE = '#4D4C4E';
const CLAMP = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;
const ease = Easing.out(Easing.cubic);

const SceneView = ({scene, index, fade}: {scene: Scene; index: number; fade: number}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const dissolve = index === 0 ? 1 : interpolate(frame, [0, fade * fps], [0, 1], CLAMP);
  const out = interpolate(frame, [(scene.seconds - 0.4) * fps, scene.seconds * fps], [1, 0], CLAMP);
  return (
    <AbsoluteFill style={{opacity: dissolve}}>
      <OffthreadVideo src={staticFile(scene.clip)} muted startFrom={Math.round(scene.startSeconds * fps)} style={{width: '100%', height: '100%', objectFit: 'cover'}} />
      <div style={{position: 'absolute', left: 0, right: 0, bottom: 0, height: 900, background: 'linear-gradient(to bottom, rgba(0,0,0,0), rgba(0,0,0,0.55))'}} />
      <div style={{position: 'absolute', left: 70, right: 70, bottom: 250, color: '#fff', opacity: out}}>
        {scene.lines.map((l, i) => {
          const a = interpolate(frame, [(0.3 + i * 0.55) * fps, (1.0 + i * 0.55) * fps], [0, 1], {...CLAMP, easing: ease});
          return (
            <div key={l} style={{fontWeight: 400, fontSize: 108, lineHeight: 1.08, opacity: a, transform: `translateY(${(1 - a) * 36}px)`}}>
              {l}
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};

export const CinematicAnnouncement = (p: CinematicProps) => {
  const frame = useCurrentFrame();
  const {fps, durationInFrames} = useVideoConfig();
  const fade = p.fadeSeconds;
  let at = 0;
  const starts = p.scenes.map((s) => {
    const from = at;
    at += s.seconds;
    return from;
  });
  const endStart = at;
  const endIn = interpolate(frame, [endStart * fps, (endStart + fade) * fps], [0, 1], CLAMP);
  const textIn = interpolate(frame, [(endStart + 0.3) * fps, (endStart + 1.1) * fps], [0, 1], {...CLAMP, easing: ease});
  const pillOut = interpolate(frame, [(endStart - 0.3) * fps, endStart * fps], [1, 0], CLAMP);
  const vol = p.musicVolume * interpolate(frame, [0, 0.6 * fps, durationInFrames - 1.5 * fps, durationInFrames], [0, 1, 1, 0], CLAMP);

  return (
    <AbsoluteFill style={{backgroundColor: '#000', fontFamily}}>
      {p.music && <Audio src={staticFile(p.music)} volume={vol} endAt={durationInFrames} />}
      {p.scenes.map((s, i) => (
        <Sequence key={i} from={Math.round(starts[i] * fps)} durationInFrames={Math.round((s.seconds + fade) * fps)}>
          <SceneView scene={s} index={i} fade={fade} />
        </Sequence>
      ))}
      {/* overline pill (a red-orange accent, never a background) */}
      <div style={{position: 'absolute', left: 70, top: 150, opacity: pillOut}}>
        <div style={{padding: '14px 36px', borderRadius: 999, background: 'linear-gradient(90deg, #ED3E25, #FF8A3D)', color: '#fff', fontWeight: 300, fontSize: 34, letterSpacing: '0.14em'}}>{p.pill}</div>
      </div>
      {/* end card on white. The logo never animates. */}
      <AbsoluteFill style={{backgroundColor: '#fff', opacity: endIn}}>
        <div style={{position: 'absolute', top: 430, left: 0, right: 0, display: 'flex', justifyContent: 'center'}}>
          <Img src={staticFile('logo.png')} style={{width: 760, height: 'auto'}} />
        </div>
        <div style={{position: 'absolute', left: 80, right: 80, top: 800, opacity: textIn, transform: `translateY(${(1 - textIn) * 40}px)`, color: CH}}>
          {p.closing.map((l) => (
            <div key={l} style={{fontWeight: 400, fontSize: 150, lineHeight: 1.04}}>{l}</div>
          ))}
          <div style={{height: 3, width: 700, background: CH, margin: '60px 0 36px'}} />
          <div style={{fontWeight: 300, fontSize: 52, color: SLATE}}>{p.url}</div>
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
