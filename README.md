# Akshara

A literacy app for Hindi, Kannada, Tamil, Telugu, Bengali and English. Micro-stories
with comprehension questions, a letter trainer, pronunciation practice, assessments,
and a weekly plan that rebuilds itself from what the learner actually gets wrong.

Built with React 19, Vite, plain CSS3 and the Web Speech API. No backend required —
everything persists to `localStorage` behind an API layer that is shaped like REST,
so a Django backend can be dropped in without touching the UI.

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # -> dist/
npm run preview  # serve the production build locally
```

---

## What changed in v3

**Fixed: blank screen after sign-in and after "Open dashboard".**
The cause was one line in `src/context/AppContext.jsx`:

```js
useEffect(() => save(LEARNERS_KEY, learners), [learners]);   // v2 - broken
```

`save()` returns `true`, and an arrow function without braces returns that value.
React treats whatever an effect returns as its cleanup function, so on the next change
to learner data (signing in, finishing Mira's questions) it tried to call `true()`,
threw, and unmounted the whole app. A refresh appeared to fix it only because a fresh
load does not run cleanup until the data changes again. v3 wraps the body in braces.
It was the only effect with that shape. The full sign-up → onboarding → dashboard →
quiz → puzzles → logout → login flow now runs clean under React StrictMode with no
console errors.

**Languages are chosen on the login page, before anything else.**
Opening *Log in* now shows two questions first: which language the app should use, and
which language the learner wants to learn to read. Picking the app language switches the
interface immediately, so the sign-in form that follows is already in that language.
Both choices are saved to the learner's record on sign-up or sign-in and remembered on
the device, so a returning learner sees them pre-selected. Mira's popup no longer
repeats those two questions; it asks the remaining five.

**Quiz and puzzles in Assessment.**
The Assessment page now opens with a *Games* section above the three skill tests:

- **Quick quiz**: ten mixed questions (letter → sound, sound → letter, and questions
  from the stories) on a 15-second clock, with points for speed and a streak bonus.
  The score stored for the proficiency model is plain percentage correct, so a slow
  reader is not marked down as a weak one.
- **Puzzles**: a memory-match round (flip letter cards and sound cards to find pairs),
  then three word-builder rounds using vocabulary from the learner's own stories, split
  into syllables with `Intl.Segmenter` so tiles read as ग्रा | ह | क rather than broken
  vowel marks.

Both go through the same assessment API as the skill tests, count toward badges and XP,
appear in past results, and feed the skill model: quiz results inform reading and
comprehension, puzzle results inform writing and reading.

---

## The five changes (v2)

**1. Mira's questions pop up after login.**
`src/components/TeacherOnboarding.jsx` is a modal — a popup, not speech — fronted by
an inline-SVG cartoon teacher (`src/components/Teacher.jsx`). It asks seven questions:
interface language, language to learn, current knowledge, plan length in weeks, minutes
a day, reason for learning, and preferred way of learning. Picking the interface
language switches the UI **immediately**, so questions two through seven already appear
in the learner's own language.

Every answer feeds something real rather than sitting in a profile:

| Answer | What it drives |
|---|---|
| interface language | the whole UI |
| language to learn | letters, stories, speech voice |
| knowledge level | the prior in the proficiency model |
| weeks + minutes/day | the size and shape of the learning path |
| reason for learning | story and recommendation weighting |
| preferred style | ordering inside the generated lesson |

The popup reopens from Profile → "Answer Mira's questions again".

**2. Voice Studio is gone.**
There is no Voice Studio nav item and no route behind one. Speaking practice moved into
Learn and practise as the **Say it** tab, next to the material being practised, with the
same pronunciation scoring it had before.

**3. Learn and practise is built on micro-stories.**
`src/data/stories.js` holds 18 stories, three per script, graded easy/medium/hard. Each
one carries the story in its own script, a transliteration line per sentence, three
vocabulary words, and three comprehension questions.

The questions are written in the story's own language on purpose — answering a Kannada
question about a Kannada story is the reading practice, not an obstacle to it. A one-line
gist beside the title stays in the learner's interface language so nobody gets stranded.
Wrong answers are recorded with the question, and the lesson generator pulls them back in
later as revision.

**4. Languages always appear in their own script.**
`languageLabel("kn")` returns `ಕನ್ನಡ` — always, everywhere, in every interface language.
The function takes no locale argument, so there is no way to ask it for a translated name
and the old bug (`ಇಂಗ್ಲಿಷ್`, `ಬೆಂಗಾಲಿ`) cannot come back by accident. The only word in the
switcher that follows the interface is the label "Language" itself.

**5. Switching language translates everything else.**
`src/i18n/translations.js` is one table, 277 keys wide, with all six locales on every
row — greetings, buttons, badge names, recommendation reasons, report advice, error
messages. `npm run build` will warn in development about any key that is looked up and
missing. There is no English fallback chain quietly leaking into a Kannada screen.

---

## Weeks 3–4: adaptive learning

**Proficiency prediction** — `src/engine/proficiency.js`
A weighted posterior over five skills (reading, writing, listening, speaking,
comprehension). Each observation — a story answered, a letter learned, an assessment,
a spoken line — carries a weight and decays on a 14-day half-life, so a good week three
months ago does not hold up a stale estimate. The learner's self-reported knowledge is
the prior, worth about 1.2 observations, so it shapes the first session and then gets
outvoted by evidence. Confidence is reported alongside every estimate: a confident 40%
and a guessed 40% are different things and the dashboard says so.

**Recommendation engine** — `src/engine/recommender.js`
Every candidate activity is scored on the same five terms — skill gap, difficulty fit,
theme match, novelty, urgency — and the term that contributed most becomes the "Why this"
line the learner reads. Nothing is random and nothing is a fixed list.

**Personalized lesson generation** — `src/engine/lessonGenerator.js`
Assembles a four-step lesson from the learner's actual gaps: warm up on letters they have
not marked as learned, read a story at their level they have not read, check with a
question they previously got **wrong** where one exists, and close on the weakest skill.
Deterministic for a given seed, so reloading gets the same lesson back.

**Content recommendation** — `recommendContent()` in the same file, used to order the
story grid.

**Learning path management APIs** — `src/api/learningPathApi.js`
The service boundary over the engines, with the Django endpoint each call maps to written
above it: `getPath`, `createPath`, `rebuildPath`, `pathPosition`, `getProficiency`,
`getRecommendations`, `getContentRecommendations`, `getGeneratedLesson`, `getReport`.
The path itself (`src/engine/learningPath.js`) is sized from weeks × minutes-per-day and
shifts phase as the plan progresses: letters and sounds → words → stories → fluency.

## Weeks 5–6: voice and progress

**Speech recognition and synthesis** — `src/hooks/useSpeech.js`
Wraps both directions of the Web Speech API. Voice selection walks an alias ladder per
language and **refuses to speak rather than speak in the wrong voice** — the naive pick
lands on an English voice reading Kannada phonetically, which teaches the wrong thing.

**Pronunciation assessment** — `scorePronunciation()` in the same file.
Blends word-level agreement (65%) with character-level Levenshtein similarity (35%),
best-of across the recogniser's alternatives, since alternative two is often the better
transcription for Indian-language audio. Returns accuracy, matched words and a verdict.

**Progress dashboard** — `src/pages/Dashboard.jsx` and `src/pages/Progress.jsx`
Streak, letters, level, XP, daily minute goal against the learner's own target, per-skill
bars with confidence, and the recommendation list with its reasoning.

**Gamification** — `src/engine/gamification.js`
XP for finishing things rather than opening them, a streak that tolerates a late-night
session rolling past midnight, and nine badges with hints for the locked ones.

**Reports and improvement recommendations** — `src/engine/reports.js`
Seven-day activity counts, strongest and weakest skill, trend direction, and up to three
pieces of advice returned as translation keys so the report reads in the learner's own
language. A learner with almost no record is told to go and make some, rather than handed
a confident-sounding diagnosis.

---

## Layout

```
src/
  api/            storage, assessment API, learning path API  (the Django seam)
  components/     Navbar, LanguageSwitcher, Teacher, TeacherOnboarding,
                  StoryReader, SkillBar, QuickQuiz, Puzzles
  context/        AppContext - auth, learner record, activity logging
  data/           languages.js (letters, speech tags), stories.js (18 stories)
  engine/         proficiency, recommender, lessonGenerator, learningPath,
                  gamification, reports
  hooks/          useSpeech + pronunciation scoring
  i18n/           translations.js (277 keys x 6 locales), provider
  pages/          Home, Auth, Dashboard, Learn, Assessment, LearningPath,
                  Progress, Achievements, Profile
  App.jsx         hash router
  main.jsx        entry
  styles.css      all styling
```

Routing is React state mirrored into the URL hash rather than react-router: nine screens,
no extra dependency, and a hash route cannot 404 on a static host the way a path route can
when a refresh misses the rewrite rule. The back button still works.

## Connecting a backend

`src/api/assessmentApi.js` keeps the original function contract — `startAssessment`,
`fetchQuestions`, `submitAnswer`, `calculateResult`, `saveResult`,
`retrieveLearnerPerformance` — and each function has its REST endpoint written above it.
Swapping `localStorage` for `fetch()` inside those two API files is the whole migration;
no component imports storage directly.

## Deployment

See `DEPLOYMENT.md`.
