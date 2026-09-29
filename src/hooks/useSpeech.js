import { useCallback, useEffect, useRef, useState } from "react";
import { languageById } from "../data/languages.js";

/**
 * Web Speech API wrapper covering both directions.
 *
 * Voice selection matters more than it looks: browsers tag installed voices
 * inconsistently, and the naive pick lands on an English voice reading Kannada
 * text phonetically, which teaches the learner the wrong thing. We walk an
 * alias ladder and refuse to speak at all rather than speak in the wrong
 * language.
 *
 * v3.1: many devices (Linux lab machines especially) ship with no Indic
 * voices at all. When no local voice exists, speech falls back to an online
 * voice for the right language, fetched through the /tts rewrite in
 * vercel.json so it comes from the app's own domain. The rule above still
 * holds: it never reads Kannada with an English voice.
 */

const TTS_MAX = 180; // characters per online request

/** Splits text at sentence ends, then at spaces, into online-TTS sized pieces. */
function chunkText(text) {
  const sentences = String(text).split(/(?<=[.!?।॥])\s+/).filter(Boolean);
  const out = [];
  for (const sentence of sentences) {
    if (sentence.length <= TTS_MAX) {
      out.push(sentence);
      continue;
    }
    let piece = "";
    for (const word of sentence.split(/\s+/)) {
      if ((piece + " " + word).trim().length > TTS_MAX && piece) {
        out.push(piece.trim());
        piece = word;
      } else {
        piece = `${piece} ${word}`;
      }
    }
    if (piece.trim()) out.push(piece.trim());
  }
  return out;
}

function ttsUrls(text, langId) {
  const tl = languageById(langId).speech.split("-")[0];
  const query = `ie=UTF-8&client=tw-ob&tl=${encodeURIComponent(tl)}&q=${encodeURIComponent(text)}`;
  return [`/tts?${query}`, `https://translate.google.com/translate_tts?${query}`];
}

const onlineSupported = () => typeof window !== "undefined" && typeof window.Audio === "function";

export function useSpeech() {
  const [voices, setVoices] = useState([]);
  const [listening, setListening] = useState(false);
  const [speaking, setSpeaking] = useState(false);
  const [error, setError] = useState(null);
  const recognitionRef = useRef(null);
  const audioRef = useRef(null);
  const queueRef = useRef(0); // bumps on every new speak/stop so stale chunks stop

  const stopAudio = useCallback(() => {
    queueRef.current += 1;
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.src = "";
      audioRef.current = null;
    }
  }, []);

  useEffect(() => stopAudio, [stopAudio]);

  /** Plays text through the online voice, chunk by chunk. */
  const speakOnline = useCallback(
    (text, langId, rate) => {
      stopAudio();
      const run = queueRef.current;
      const chunks = chunkText(text);
      if (!chunks.length) return false;
      setSpeaking(true);
      setError(null);

      const playChunk = (i, urlIndex = 0) => {
        if (run !== queueRef.current) return;
        if (i >= chunks.length) {
          setSpeaking(false);
          return;
        }
        const urls = ttsUrls(chunks[i], langId);
        const audio = new window.Audio(urls[urlIndex]);
        audio.preservesPitch = true;
        audio.playbackRate = Math.min(1, Math.max(0.5, rate + 0.1));
        audioRef.current = audio;
        audio.onended = () => playChunk(i + 1);
        audio.onerror = () => {
          if (run !== queueRef.current) return;
          if (urlIndex + 1 < urls.length) playChunk(i, urlIndex + 1);
          else {
            setSpeaking(false);
            setError("noVoice");
          }
        };
        audio.play().catch(() => audio.onerror());
      };

      playChunk(0);
      return true;
    },
    [stopAudio]
  );

  useEffect(() => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return undefined;
    const refresh = () => setVoices(window.speechSynthesis.getVoices());
    refresh();
    window.speechSynthesis.addEventListener("voiceschanged", refresh);
    return () => window.speechSynthesis.removeEventListener("voiceschanged", refresh);
  }, []);

  const findVoice = useCallback(
    (langId) => {
      const lang = languageById(langId);
      const normalized = voices.map((v) => ({ voice: v, tag: (v.lang || "").toLowerCase().replace("_", "-") }));
      for (const alias of lang.voiceAliases) {
        const hit = normalized.find((v) => v.tag === alias.toLowerCase());
        if (hit) return hit.voice;
      }
      const base = lang.speech.split("-")[0].toLowerCase();
      return normalized.find((v) => v.tag === base || v.tag.startsWith(`${base}-`))?.voice || null;
    },
    [voices]
  );

  const speak = useCallback(
    (text, langId, { rate = 0.85 } = {}) => {
      const hasSynth = typeof window !== "undefined" && "speechSynthesis" in window;
      const voice = hasSynth ? findVoice(langId) : null;
      if (!voice) {
        if (onlineSupported()) return speakOnline(text, langId, rate);
        setError(hasSynth ? "noVoice" : "unsupported");
        return false;
      }
      stopAudio();
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(String(text));
      utterance.voice = voice;
      utterance.lang = voice.lang || languageById(langId).speech;
      utterance.rate = rate;
      utterance.onstart = () => setSpeaking(true);
      utterance.onend = () => setSpeaking(false);
      utterance.onerror = () => setSpeaking(false);
      setError(null);
      window.speechSynthesis.speak(utterance);
      return true;
    },
    [findVoice, speakOnline, stopAudio]
  );

  const stopSpeaking = useCallback(() => {
    stopAudio();
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }
    setSpeaking(false);
  }, [stopAudio]);

  const listen = useCallback((langId, onResult) => {
    const Recognition =
      typeof window !== "undefined" && (window.SpeechRecognition || window.webkitSpeechRecognition);
    if (!Recognition) {
      setError("unsupported");
      return false;
    }
    const recognition = new Recognition();
    recognition.lang = languageById(langId).speech;
    recognition.interimResults = false;
    recognition.maxAlternatives = 3;
    recognition.onstart = () => {
      setListening(true);
      setError(null);
    };
    recognition.onend = () => setListening(false);
    recognition.onerror = (event) => {
      setListening(false);
      setError(event.error === "not-allowed" ? "denied" : "recognition");
    };
    recognition.onresult = (event) => {
      const alternatives = Array.from(event.results[0]).map((alt) => alt.transcript);
      onResult(alternatives[0], alternatives);
    };
    recognitionRef.current = recognition;
    recognition.start();
    return true;
  }, []);

  const stopListening = useCallback(() => {
    recognitionRef.current?.stop();
    setListening(false);
  }, []);

  // True when the device has a voice, or the online voice can stand in for it.
  const hasVoiceFor = useCallback(
    (langId) => Boolean(findVoice(langId)) || onlineSupported(),
    [findVoice]
  );

  const recognitionSupported =
    typeof window !== "undefined" && Boolean(window.SpeechRecognition || window.webkitSpeechRecognition);

  return {
    speak,
    stopSpeaking,
    listen,
    stopListening,
    listening,
    speaking,
    error,
    clearError: () => setError(null),
    hasVoiceFor,
    recognitionSupported,
  };
}

/* ------------------------------------------------------------------------ */
/* Pronunciation assessment                                                  */
/* ------------------------------------------------------------------------ */

function normalize(text) {
  return String(text || "")
    .toLowerCase()
    .replace(/[.,!?;:"'`|]/g, "")
    // Devanagari danda and its Bengali counterpart, which recognisers drop.
    .replace(/[\u0964\u0965]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function levenshtein(a, b) {
  if (a === b) return 0;
  if (!a.length) return b.length;
  if (!b.length) return a.length;
  let previous = Array.from({ length: b.length + 1 }, (_, i) => i);
  for (let i = 1; i <= a.length; i++) {
    const current = [i];
    for (let j = 1; j <= b.length; j++) {
      current[j] = Math.min(
        previous[j] + 1,
        current[j - 1] + 1,
        previous[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1)
      );
    }
    previous = current;
  }
  return previous[b.length];
}

/**
 * Scores a spoken attempt against the target line.
 *
 * Word-level agreement and character-level similarity are blended, because
 * either alone misleads: character similarity alone rewards a learner who said
 * something different but orthographically close, while word matching alone is
 * brutal about a single dropped particle. Best-of across the recogniser's
 * alternatives, since alternative two is often the better transcription for
 * Indian-language audio.
 *
 * @returns { accuracy 0..1, matchedWords, totalWords, verdict }
 */
export function scorePronunciation(target, alternatives) {
  const candidates = (Array.isArray(alternatives) ? alternatives : [alternatives]).filter(Boolean);
  if (!candidates.length) return { accuracy: 0, matchedWords: 0, totalWords: 0, verdict: "poor" };

  const targetNorm = normalize(target);
  const targetWords = targetNorm.split(" ").filter(Boolean);

  let best = { accuracy: 0, matchedWords: 0, totalWords: targetWords.length };

  for (const candidate of candidates) {
    const saidNorm = normalize(candidate);
    const saidWords = saidNorm.split(" ").filter(Boolean);

    const pool = [...saidWords];
    let matched = 0;
    for (const word of targetWords) {
      // A word counts if some spoken word is within ~25% edit distance of it.
      const index = pool.findIndex(
        (w) => levenshtein(w, word) <= Math.max(1, Math.floor(word.length * 0.25))
      );
      if (index !== -1) {
        matched++;
        pool.splice(index, 1);
      }
    }
    const wordScore = targetWords.length ? matched / targetWords.length : 0;

    const distance = levenshtein(saidNorm, targetNorm);
    const charScore = 1 - distance / Math.max(targetNorm.length, saidNorm.length, 1);

    const accuracy = Math.max(0, Math.min(1, wordScore * 0.65 + charScore * 0.35));
    if (accuracy > best.accuracy) best = { accuracy, matchedWords: matched, totalWords: targetWords.length };
  }

  return {
    ...best,
    verdict: best.accuracy >= 0.8 ? "great" : best.accuracy >= 0.5 ? "ok" : "poor",
  };
}
