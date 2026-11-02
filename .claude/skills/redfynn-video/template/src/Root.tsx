import {Composition} from 'remotion';
import {Announcement, defaultProps, Props} from './Announcement';
import {Celebration, celebrationDefaults} from './Celebration';
import {KineticText, kineticDefaults, StatCard, statDefaults, ArticleShort, articleDefaults, Parallax, parallaxDefaults} from './SocialExamples';
import {FlatExplainer, flatDefaults} from './FlatExplainer';
import {CinematicAnnouncement, cinematicDefaults, cinematicSeconds, CinematicProps} from './CinematicAnnouncement';
import {CharacterAnnouncement, characterDefaults, CharacterProps} from './CharacterAnnouncement';

const FPS = 30;

const make = (id: string, width: number, height: number) => (
  <Composition
    id={id}
    component={Announcement}
    width={width}
    height={height}
    fps={FPS}
    durationInFrames={FPS * defaultProps.durationSeconds}
    defaultProps={defaultProps}
    calculateMetadata={({props}: {props: Props}) => ({durationInFrames: Math.round(FPS * props.durationSeconds)})}
  />
);

export const Root = () => (
  <>
    {make('Vertical', 1080, 1920)}
    {make('Landscape', 1920, 1080)}
    {make('Square', 1080, 1080)}
    <Composition
      id="CharacterAnnouncement"
      component={CharacterAnnouncement}
      width={1080}
      height={1920}
      fps={FPS}
      durationInFrames={FPS * 20}
      defaultProps={characterDefaults}
      calculateMetadata={({props}: {props: CharacterProps}) => ({durationInFrames: Math.round(FPS * (props.clipSeconds * 3 + (props.speakSeconds > 0 ? props.speakSeconds : props.clipSeconds)))})}
    />
    <Composition
      id="CinematicAnnouncement"
      component={CinematicAnnouncement}
      width={1080}
      height={1920}
      fps={FPS}
      durationInFrames={FPS * 20}
      defaultProps={cinematicDefaults}
      calculateMetadata={({props}: {props: CinematicProps}) => ({durationInFrames: Math.round(FPS * cinematicSeconds(props))})}
    />
    <Composition id="FlatExplainer" component={FlatExplainer} width={1080} height={1920} fps={FPS} durationInFrames={FPS * 10} defaultProps={flatDefaults} />
    <Composition id="KineticText" component={KineticText} width={1080} height={1920} fps={FPS} durationInFrames={FPS * 6} defaultProps={kineticDefaults} />
    <Composition id="StatCard" component={StatCard} width={1080} height={1920} fps={FPS} durationInFrames={FPS * 8} defaultProps={statDefaults} />
    <Composition id="ArticleShort" component={ArticleShort} width={1080} height={1920} fps={FPS} durationInFrames={FPS * 8.4} defaultProps={articleDefaults} />
    <Composition id="Parallax" component={Parallax} width={1080} height={1920} fps={FPS} durationInFrames={FPS * 6} defaultProps={parallaxDefaults} />
    <Composition id="Celebration" component={Celebration} width={1080} height={1920} fps={FPS} durationInFrames={FPS * 28} defaultProps={celebrationDefaults} />
  </>
);
