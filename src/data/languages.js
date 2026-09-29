/**
 * Script data. Each entry holds the starter letter set a learner works through
 * and the lines used for pronunciation practice.
 *
 * `speech` is the BCP-47 tag handed to the Web Speech API. `voiceAliases` is
 * the fallback ladder for browsers whose installed voices are tagged loosely.
 */

export const LANGUAGES = [
  {
    id: "hi",
    speech: "hi-IN",
    voiceAliases: ["hi-IN", "hi"],
    letters: [
      ["अ", "a"], ["आ", "aa"], ["इ", "i"], ["ई", "ii"], ["उ", "u"],
      ["क", "ka"], ["ख", "kha"], ["ग", "ga"], ["घ", "gha"], ["च", "cha"],
      ["ज", "ja"], ["त", "ta"], ["द", "da"], ["न", "na"], ["प", "pa"],
      ["ब", "ba"], ["म", "ma"], ["य", "ya"], ["र", "ra"], ["ल", "la"],
    ],
    lines: ["नमस्ते, आप कैसे हैं?", "मेरा नाम मीरा है।", "मैं हिंदी पढ़ना सीख रहा हूँ।"],
  },
  {
    id: "kn",
    speech: "kn-IN",
    voiceAliases: ["kn-IN", "kn"],
    letters: [
      ["ಅ", "a"], ["ಆ", "aa"], ["ಇ", "i"], ["ಈ", "ii"], ["ಉ", "u"],
      ["ಕ", "ka"], ["ಖ", "kha"], ["ಗ", "ga"], ["ಘ", "gha"], ["ಚ", "cha"],
      ["ಜ", "ja"], ["ತ", "ta"], ["ದ", "da"], ["ನ", "na"], ["ಪ", "pa"],
      ["ಬ", "ba"], ["ಮ", "ma"], ["ಯ", "ya"], ["ರ", "ra"], ["ಲ", "la"],
    ],
    lines: ["ನಮಸ್ಕಾರ, ಹೇಗಿದ್ದೀರಿ?", "ನನ್ನ ಹೆಸರು ಮೀರಾ.", "ನಾನು ಕನ್ನಡ ಓದಲು ಕಲಿಯುತ್ತಿದ್ದೇನೆ."],
  },
  {
    id: "ta",
    speech: "ta-IN",
    voiceAliases: ["ta-IN", "ta"],
    letters: [
      ["அ", "a"], ["ஆ", "aa"], ["இ", "i"], ["ஈ", "ii"], ["உ", "u"],
      ["க", "ka"], ["ங", "nga"], ["ச", "cha"], ["ஞ", "nya"], ["ட", "ta"],
      ["ண", "nna"], ["த", "tha"], ["ந", "na"], ["ப", "pa"], ["ம", "ma"],
      ["ய", "ya"], ["ர", "ra"], ["ல", "la"], ["வ", "va"], ["ழ", "zha"],
    ],
    lines: ["வணக்கம், எப்படி இருக்கிறீர்கள்?", "என் பெயர் மீரா.", "நான் தமிழ் படிக்கக் கற்கிறேன்."],
  },
  {
    id: "te",
    speech: "te-IN",
    voiceAliases: ["te-IN", "te"],
    letters: [
      ["అ", "a"], ["ఆ", "aa"], ["ఇ", "i"], ["ఈ", "ii"], ["ఉ", "u"],
      ["క", "ka"], ["ఖ", "kha"], ["గ", "ga"], ["ఘ", "gha"], ["చ", "cha"],
      ["జ", "ja"], ["త", "ta"], ["ద", "da"], ["న", "na"], ["ప", "pa"],
      ["బ", "ba"], ["మ", "ma"], ["య", "ya"], ["ర", "ra"], ["ల", "la"],
    ],
    lines: ["నమస్కారం, ఎలా ఉన్నారు?", "నా పేరు మీరా.", "నేను తెలుగు చదవడం నేర్చుకుంటున్నాను."],
  },
  {
    id: "bn",
    speech: "bn-IN",
    voiceAliases: ["bn-IN", "bn-BD", "bn"],
    letters: [
      ["অ", "a"], ["আ", "aa"], ["ই", "i"], ["ঈ", "ii"], ["উ", "u"],
      ["ক", "ka"], ["খ", "kha"], ["গ", "ga"], ["ঘ", "gha"], ["চ", "cha"],
      ["জ", "ja"], ["ত", "ta"], ["দ", "da"], ["ন", "na"], ["প", "pa"],
      ["ব", "ba"], ["ম", "ma"], ["য", "ya"], ["র", "ra"], ["ল", "la"],
    ],
    lines: ["নমস্কার, কেমন আছেন?", "আমার নাম মীরা।", "আমি বাংলা পড়তে শিখছি।"],
  },
  {
    id: "en",
    speech: "en-IN",
    voiceAliases: ["en-IN", "en-GB", "en-US", "en"],
    letters: "abcdefghijklmnopqrst".split("").map((ch) => [ch, ch]),
    lines: ["Hello, how are you?", "My name is Mira.", "I am learning to read English."],
  },
].map((l) => ({ ...l, letters: l.letters.map(([g, r]) => ({ g, r })) }));

export function languageById(id) {
  return LANGUAGES.find((l) => l.id === id) || LANGUAGES[0];
}

export const LEVELS = [
  { n: 1, key: "lvl.1", need: 0 },
  { n: 2, key: "lvl.2", need: 6 },
  { n: 3, key: "lvl.3", need: 12 },
  { n: 4, key: "lvl.4", need: 20 },
];

export function levelFor(lettersLearned) {
  let current = LEVELS[0];
  for (const l of LEVELS) if (lettersLearned >= l.need) current = l;
  return current;
}
