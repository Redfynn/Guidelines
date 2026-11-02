# Making RedFynn videos (team guide)

For organic social and ads aimed at experienced payments partners. Nothing publishes without Shane's approval. Carol posts.

Items marked **Proposed** are recommendations that Shane has not yet confirmed.

## Content types by priority

Four types, ranked. Lead with motion and people. Image-led content is the weakest and is capped.

| Priority | Type | Use it for | Made by | Cost |
|---|---|---|---|---|
| **Primary** | **Motion graphic: illustrated explainer** | The weekly worked-number post. A flat illustrated scene, then the numbers build as bars on screen, in the brand gradient and warm tints. | Claude, Remotion `FlatExplainer` | None |
| **Primary** | **People on camera** (real footage, or an AI avatar) | Trust. POS Desk, testimonials, walkthroughs. Use whenever Quinn's footage fits the topic. | Quinn shoots, or Carol sets up a HeyGen avatar. Claude adds captions, graphics and the end card. | Editing only, or the HeyGen plan |
| Secondary | **Cinematic story** | Brand and milestone stories in the partner's voice: footage cuts, a sentence built in lines, a Suno music bed. The approved Inc. 5000 video is the model. | Footage from Quinn or generated clips, music from Suno, assembled by Claude | About $0.60 per generated clip (estimate) |
| Secondary | **Character hook** (experiment) | A cartoon character reacting to one number. The stop-scroll hook. | Claude with the shared fal.ai account | About $2 to $6 per video (estimate) |
| Filler | **Motion graphic: quick graphics** (stat card, kinetic text, article-to-short) | A thin week, a news line, or a cut of the week's article. Cheap and fast. | Claude, Remotion `StatCard`, `KineticText`, `ArticleShort` | None |
| Capped | **Image-led** (static images, carousels, animated stills, mood clips with no story) | Only as a filler or as background inside another type. | Claude | Cents per image |

Examples of every type are in the marketing repo (`videos/examples/`, see its README). The Inc. 5000 character tests are `videos/inc5000-character-test.mp4` and `videos/inc5000-character-speaking-test.mp4` in that repo. Rendered MP4s live there, not here.

**Proposed weekly rule** (one post per social site per week, plus one blog post, agreed 9/23):
1. Every week gets one primary post. Default is the illustrated explainer. Make People on camera instead whenever footage fits.
2. A secondary post (cinematic story or character hook) runs at most once or twice a month, and only one per week.
3. Use a filler only when a primary cannot be made in time.
4. **Image-led content is no more than one post in four, and never two in a row.** The 9/30 process had each article cut into a carousel of about 10 slides plus a video. Under this rule the carousel becomes a filler or is dropped. Confirm.

## Rules for every video

- Audience is partners. Say "partner." Nothing merchant-facing.
- Every figure comes from the claims register in `redfynn-voice` or from the source you give Claude. Worked examples carry an "Illustrative example" tag.
- No em dashes. No "free" or "zero cost": say "no upfront hardware cost." Never tell the viewer they are underpaid.
- No competitor named critically without Shane's OK, and then Charles reviews.
- Call to action says what to do, what they get and how fast. Put the callout and the ask on the frame, because almost nobody reads the ad text (Quinn, 9/30).
- The logo is static and always sits on white. It never animates.
- Text is set in Remotion, never generated inside an AI image or video.
- Cut to graphics often. Do not hold a static talking face (Quinn's direction, 9/16).

## Illustrated explainer (primary)

The example is `videos/examples/10b-flat-explainer-color.mp4` (props in `10b-flat-explainer-color.props.json`). It is 10 seconds: a flat figure at a desk, three documents slide in, then three bars count up (expected $186.00, reported $156.00, gap $30.00) and a caption lands on a gradient panel.

**Look (stay inside the brand guide):**
- White background. The brand gradient appears only as contained panels, such as a disc behind the figure, a rounded caption block and a thin line along the bottom edge. Never a full-bleed red background.
- Colors are the brand red, charcoal, slate, smoke and white, plus the orange, peach and cream tints already used in the gradient treatment. Red marks the one number that matters. No other colors.
- Flat shapes only. No generic stock icons (megaphones, bullseyes, light bulbs). The scene shows the partner's actual situation, such as a statement and a residual report on a desk.
- All words are set in Remotion. No generated text. The logo is static on white.
- Use it for worked numbers, not for explaining basic terms. Experienced partners read a 101 explainer as a beginner's post.

**How to make one:** ask Claude "Make an illustrated explainer from this worked example," and give the figures, the three documents or things being compared, the caption and the source. Claude uses the `FlatExplainer` composition (props: kicker, document labels, three rows with values, caption, tag). The composition currently has one scene layout: a partner at a desk with three documents, then three bars. A new topic with a different picture, such as POS Desk matching, needs a new scene that Claude builds first. A designer should review the cream face and peach tints.

## People on camera

**Real footage (Quinn's restaurants and clients)**
- Raw footage and finished cuts live in the shared RedFynn Google Drive folder. Put anything Claude should edit in `assets/footage/`.
- **Proposed:** every identifiable client, owner or partner on camera needs a signed release before the clip is used. Keep a log in `assets/footage/RELEASES.md` (who, where, date, what they agreed to, who holds the form). No logged release means the clip is not approved. I could not find release forms or a release rule in the repo, so please confirm how Quinn's shoots were covered.
- Testimonials must be the real person's words. Check any number a client states against the claims register before posting.
- Footage from the 10/14 Food Hub POS shoot (Philadelphia) is the first source for the POS Desk video. Quinn's crew is editing six cut-downs.

**AI avatars**
- Built on HeyGen. Each avatar needs the real person's consent, and the original recording stays with the team. Quinn recorded a 2-minute video for his.
- Existing avatars are Shane, Christa Shook and the older Pearly and Griddle personas. Avatar ads started strong and tapered off, so refresh scripts and cut to graphics often.
- Never present an avatar as the real person speaking live. **Proposed:** add "AI avatar" to the caption or description for paid ads, after checking Meta's AI labeling rules.
- Avatars are not made in this repo, but the final edit can be: bring the HeyGen file to Claude to add captions, graphics and the end card.

## Cinematic story (secondary)

The model is the approved Inc. 5000 video (48 seconds, posted Oct 17): aerial footage, a pill reading "INC. 5000 · 2026", and a sentence that builds across cuts ("We've been in the game", "Our partners call their own shots", "Deal by deal,..."). A short sample built the same way is `videos/examples/9-cinematic-announcement.mp4`, with its props in `9-cinematic-announcement.props.json`.

Steps:
1. **Message.** One partner-centered idea told in three to six short lines. Facts come from the claims register or the source you give Claude. Claude drafts three options for the lead line and names a pick.
2. **Footage.** Real (Quinn's shoots, licensed stock, drone) or generated with fal.ai. One shot per line, three to five seconds each. Real footage with identifiable people needs a logged release. No readable signs, plates or logos.
3. **Music.** Make the track in Suno on a plan that allows commercial use, download the MP3 and save it in `assets/music/`, then log it in `assets/music/README.md`. Suno is not connected to Claude, so this step is manual. Keep one reusable track for the series, or make one per video.
4. **Build.** Ask Claude: "Make a cinematic announcement about X with these clips, these lines and this track." Claude uses the `CinematicAnnouncement` composition (props: pill, scenes with clip, start, seconds and lines, closing lines, URL, music file and volume) and renders the MP4.
5. **Review.** Listen with sound on (see Review and approval), check every figure, Shane approves, Carol posts.

Length: 20 to 48 seconds. The overline pill is a red-orange accent, never a background.

## Character hook (secondary, experiment)

1. Start a session in the shared **Default** environment. It holds the fal.ai key as a Network secret and allows the fal domains. Nobody sees or pastes the key. If a call fails, say "check the fal key."
2. Ask in plain words, for example "Make a 20-second character video about X." Claude writes the brief, generates a character sheet and stills, animates clips and builds the video with the `CharacterAnnouncement` composition.
3. `scripts/fal/fal_generate.py` shows an estimated cost and needs `--yes`. It stops at $10 per test, tracked in `assets/characters/spend-log.jsonl`. Estimates are placeholders in `scripts/fal/models.json`. The real limit is the budget set on the fal.ai account, so check that dashboard.
4. Every generated file is logged in `assets/characters/LICENSES.md`. Generated people are never presented as RedFynn staff or partners.
5. Brief and prompts for the first test: `content-packs/2026-11-01-inc5000-character-test/`.
6. It stays an experiment until a real post shows it earns its cost.

## Footage, photos and music

- **Stock:** licensed sources only (commercial license, not "editorial use"). Put files in `assets/stock/` and add a line to `assets/stock/LICENSES.md`. No license line means the clip is not approved.
- **Generated media** lives in `assets/characters/`. Large media files are tracked in git (about 72 MB so far). **Open decision:** keep them in git or move them to the shared Drive.
- **Music:** the built-in track is a generated placeholder, not a licensed one. Replace it with a licensed or original track before posting. Avoid popular songs.
- Do not commit API keys.

## Review and approval

1. Claude renders the MP4 into `videos/` (or `videos/examples/`), checks frames and sends the file.
2. **Listen with sound on.** On a phone, the Claude app's file preview may not play audio. Open the file from the GitHub link or download it and play it in the phone's video player or on a computer.
3. Check every number and quote against the source.
4. Shane approves. Carol posts. Check Meta's AI labeling rules before any paid run.

## Open decisions

1. **Priorities and the weekly rule** above, including the image-led cap of one in four.
2. **Carousels.** The 9/30 process cut each article into a carousel. Under the image-led cap it becomes a filler or is dropped.
3. **Red.** `redfynn-context.md` says no red backgrounds in creative (retired August 2026). The illustrated explainer and the cinematic pill use red and orange only in contained panels and accents. The `Celebration` sunset and the brand-gradient kinetic text are fully red and orange. Does the rule cover organic video, and do contained panels satisfy it?
4. **Music.** Suno tracks made on a commercial-use plan, saved in `assets/music/`. Confirm the Suno plan's terms.
5. **Large files.** Git or the shared Drive.
6. **Release forms and avatar labeling** (both proposed above).
7. **Designer review** of the cream face and peach tints in the illustrated explainer.

## Known gaps (ask the brand owner or designer)

- **Font:** TWK Everett is licensed and not in the repo. Videos use Hanken Grotesk as a stand-in.
- **Logo:** the files have white backgrounds, so the logo always sits on white. We need transparent or reversed logos for logo-on-gradient.
- **Logo animation:** the logo is always static. The retired 2015 guide forbade animating it and the 2024 guide is silent. Check with the brand owner before adding a reveal.
- **Gradient:** generated in code, not the real brand artwork. The gradient files in the brand skill are crops of the guide's type pages, not usable gradients.
- **Skin tones and sunset tints** in the cartoon scenes are outside the brand palette. A designer should review.
- **Old files:** the 2015 web guides and logo files were removed from this repo. If you find a copy elsewhere, do not use it for new work. Logos and the 2024 guide are in `brand/`.

## If something breaks

Tell Claude what you saw. The `redfynn-video` skill notes the usual environment problems (browser download blocked, fonts, first render slow).
