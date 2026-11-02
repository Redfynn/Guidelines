import {AbsoluteFill, Audio, Easing, Img, interpolate, OffthreadVideo, Sequence, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import {fontFamily} from './font';

// Character-style announcement: three generated clips (public/shot1.mp4 to shot3.mp4),
// text set in Remotion (never generated), then a white end card with the static logo.
export type CharacterProps = {
  clipSeconds: number;
  hook: string;
  overline: string;
  stat: string;
  statNote: string;
  closer: string;
  closing: string[];
  url: string;
  music: boolean;
  // Optional speaking final shot: public/speak.mp4 (with its own audio) replaces shot 3.
  speakSeconds: number;
  caption: string;
};

export const characterDefaults: CharacterProps = {
  clipSeconds: 5,
  hook: '135%?',
  overline: 'Inc. 5000, 2026',
  stat: '135% revenue growth.',
  statNote: '2022 to 2025.',
  closer: 'Two years running.',
  closing: ['Built with', 'our partners.'],
  url: 'redfynn.com/partners',
  music: true,
  speakSeconds: 0,
  caption: '',
};

const CH = '#1C1B1F';
const SLATE = '#4D4C4E';
const CLAMP = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;
const ease = Easing.out(Easing.cubic);

const Card = ({children, hold}: {children: React.ReactNode; hold: number}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const a = interpolate(frame, [0.3 * fps, 0.9 * fps], [0, 1], {...CLAMP, easing: ease});
  const b = interpolate(frame, [(hold - 0.4) * fps, hold * fps], [1, 0], CLAMP);
  return (
    <div style={{position: 'absolute', left: 60, right: 60, bottom: 150, display: 'flex', justifyContent: 'center', opacity: Math.min(a, b), transform: `translateY(${(1 - a) * 40}px)`}}>
      <div style={{background: 'rgba(255,255,255,0.9)', borderRadius: 48, padding: '40px 56px', textAlign: 'center', color: CH}}>{children}</div>
    </div>
  );
};

const Over = ({children}: {children: React.ReactNode}) => (
  <div style={{fontWeight: 300, fontSize: 34, letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 18, color: SLATE}}>{children}</div>
);

const Clip = ({src, muted = true}: {src: string; muted?: boolean}) => (
  <AbsoluteFill>
    <OffthreadVideo src={staticFile(src)} muted={muted} style={{width: '100%', height: '100%', objectFit: 'cover'}} />
  </AbsoluteFill>
);

export const CharacterAnnouncement = (p: CharacterProps) => {
  const frame = useCurrentFrame();
  const {fps, durationInFrames} = useVideoConfig();
  const c = Math.round(p.clipSeconds * fps);
  const speak = p.speakSeconds > 0;
  const d3 = speak ? Math.round(p.speakSeconds * fps) : c;
  const endStart = 2 * c + d3;
  const endIn = interpolate(frame, [endStart + 0.2 * fps, endStart + 1 * fps], [0, 1], {...CLAMP, easing: ease});
  const bed = interpolate(frame, [0, 0.5 * fps, durationInFrames - 1.5 * fps, durationInFrames], [0, 0.5, 0.5, 0], CLAMP);
  // Duck the music under the speaking shot so the voice leads.
  const duck = speak ? interpolate(frame, [2 * c - 0.3 * fps, 2 * c, endStart - 0.2 * fps, endStart + 0.4 * fps], [1, 0.25, 0.25, 1], CLAMP) : 1;
  const musicVol = bed * duck;

  return (
    <AbsoluteFill style={{backgroundColor: '#fff', fontFamily}}>
      {p.music && <Audio src={staticFile('celebration-music.m4a')} volume={musicVol} endAt={durationInFrames} />}

      <Sequence from={0} durationInFrames={c}>
        <Clip src="shot1.mp4" />
        <Card hold={p.clipSeconds - 0.2}>
          <div style={{fontWeight: 400, fontSize: 210, lineHeight: 1}}>{p.hook}</div>
        </Card>
      </Sequence>
      <Sequence from={c} durationInFrames={c}>
        <Clip src="shot2.mp4" />
        <Card hold={p.clipSeconds - 0.2}>
          <Over>{p.overline}</Over>
          <div style={{fontWeight: 400, fontSize: 78, lineHeight: 1.08}}>{p.stat}</div>
          <div style={{fontWeight: 300, fontSize: 52, marginTop: 12, color: SLATE}}>{p.statNote}</div>
        </Card>
      </Sequence>
      <Sequence from={2 * c} durationInFrames={d3}>
        <Clip src={speak ? 'speak.mp4' : 'shot3.mp4'} muted={!speak} />
        <Card hold={d3 / fps - 0.2}>
          {speak ? (
            <div style={{fontWeight: 400, fontSize: 64, lineHeight: 1.12}}>{p.caption}</div>
          ) : (
            <div style={{fontWeight: 400, fontSize: 104, lineHeight: 1.05}}>{p.closer}</div>
          )}
        </Card>
      </Sequence>

      {/* end card on white. The logo never animates. */}
      <Sequence from={endStart}>
        <AbsoluteFill style={{backgroundColor: '#fff'}}>
          <div style={{position: 'absolute', top: 430, left: 0, right: 0, display: 'flex', justifyContent: 'center'}}>
            <Img src={staticFile('logo.png')} style={{width: 760, height: 'auto'}} />
          </div>
          <div style={{position: 'absolute', left: 80, right: 80, top: 800, opacity: endIn, transform: `translateY(${(1 - endIn) * 40}px)`, color: CH}}>
            {p.closing.map((l) => (
              <div key={l} style={{fontWeight: 400, fontSize: 150, lineHeight: 1.04}}>{l}</div>
            ))}
            <div style={{height: 3, width: 700, background: CH, margin: '60px 0 36px'}} />
            <div style={{fontWeight: 300, fontSize: 52, color: SLATE}}>{p.url}</div>
          </div>
        </AbsoluteFill>
      </Sequence>
    </AbsoluteFill>
  );
};
