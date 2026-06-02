/**
 * voiceEngine.js
 * Shared utility for selecting and configuring SpeechSynthesis voices.
 * Solves the critical issue where Chrome ignores pitch property,
 * causing male and female Vietnamese voices to sound identical.
 *
 * Strategy: Use EXACT NAME MATCHING with cross-exclusion to guarantee
 * different physical voice objects are assigned to male vs female.
 *
 * Known Vietnamese voice names on Windows:
 * - "Microsoft HoaiMy Online (Natural) - Vietnamese (Vietnam)" → FEMALE
 * - "Microsoft NamMinh Online (Natural) - Vietnamese (Vietnam)" → MALE
 * - "Microsoft An Online (Natural) - Vietnamese (Vietnam)" → MALE
 * - "Microsoft An - Vietnamese (Vietnam)" → MALE (offline, lower quality)
 * - "Google Vietnamese" → NEUTRAL (single voice on Chrome)
 */

// Well-known female Vietnamese voice identifiers
const VI_FEMALE_NAMES = ["hoaimy", "hoai my"];

// Well-known male Vietnamese voice identifiers
const VI_MALE_NAMES = ["namminh", "nam minh"];

// Well-known English female voice identifiers
const EN_FEMALE_NAMES = ["zira", "jenny", "samantha", "hazel", "susan", "aria", "libby"];

// Well-known English male voice identifiers
const EN_MALE_NAMES = ["david", "mark", "guy", "alex", "george", "ryan", "roger"];

/**
 * Check if a voice name contains any of the given keywords.
 * @param {string} voiceName - The SpeechSynthesisVoice.name (lowercased)
 * @param {string[]} keywords - Array of keyword strings to match
 * @returns {boolean}
 */
function nameContainsAny(voiceName, keywords) {
  return keywords.some(kw => voiceName.includes(kw));
}

/**
 * Check if a voice is an online/natural/high-quality voice.
 * @param {string} voiceName - The SpeechSynthesisVoice.name (lowercased)
 * @returns {boolean}
 */
function isOnlineVoice(voiceName) {
  return voiceName.includes("online") || voiceName.includes("natural") || voiceName.includes("google");
}

/**
 * Select the best matching voice for a given voiceId configuration.
 *
 * @param {string} voiceId - One of: "vi-VN-female", "vi-VN-male", "en-US-female", "en-US-male"
 * @returns {SpeechSynthesisVoice|null} The best matching voice object, or null
 */
export function selectVoice(voiceId) {
  if (!('speechSynthesis' in window)) return null;

  const voices = window.speechSynthesis.getVoices();
  if (voices.length === 0) return null;

  const isEnglish = voiceId.startsWith("en-US");
  const isMale = voiceId.includes("-male");
  const langPrefix = isEnglish ? "en" : "vi";

  // Filter to the target language
  const langVoices = voices.filter(v =>
    v.lang.toLowerCase().startsWith(langPrefix)
  );

  if (langVoices.length === 0) return null;

  // If there is only 1 voice for this language, we must use it
  // Pitch/rate differentiation is the only option
  if (langVoices.length === 1) return langVoices[0];

  const femaleNames = isEnglish ? EN_FEMALE_NAMES : VI_FEMALE_NAMES;
  const maleNames = isEnglish ? EN_MALE_NAMES : VI_MALE_NAMES;

  // Classify each voice
  const classified = langVoices.map(v => {
    const n = v.name.toLowerCase();
    const online = isOnlineVoice(n);
    const isFemaleVoice = nameContainsAny(n, femaleNames);
    const isMaleVoice = nameContainsAny(n, maleNames);
    return { voice: v, name: n, online, isFemaleVoice, isMaleVoice };
  });

  // STRATEGY: Use cross-exclusion to guarantee different voices
  // For female: Pick a voice identified as female
  // For male: Pick a voice that is NOT identified as female (this is critical!)
  // This ensures even when keyword matching is imperfect, we get different voices.

  let match;

  if (isMale) {
    // Priority 1: Online voice explicitly identified as male
    match = classified.find(c => c.online && c.isMaleVoice);
    // Priority 2: Online voice that is NOT female (cross-exclusion)
    if (!match) match = classified.find(c => c.online && !c.isFemaleVoice);
    // Priority 3: Any voice explicitly identified as male
    if (!match) match = classified.find(c => c.isMaleVoice);
    // Priority 4: Any voice that is NOT female
    if (!match) match = classified.find(c => !c.isFemaleVoice);
    // Final fallback: last voice in list (female voices tend to be listed first)
    if (!match) match = classified[classified.length - 1];
  } else {
    // Priority 1: Online voice explicitly identified as female
    match = classified.find(c => c.online && c.isFemaleVoice);
    // Priority 2: Online voice that is NOT male (cross-exclusion)
    if (!match) match = classified.find(c => c.online && !c.isMaleVoice);
    // Priority 3: Any voice explicitly identified as female
    if (!match) match = classified.find(c => c.isFemaleVoice);
    // Priority 4: Any voice that is NOT male
    if (!match) match = classified.find(c => !c.isMaleVoice);
    // Final fallback: first voice in list
    if (!match) match = classified[0];
  }

  return match ? match.voice : langVoices[0];
}

/**
 * Configure utterance pitch and rate for the given gender.
 * 
 * CRITICAL: Google Chrome on Windows IGNORES the `pitch` property for
 * Google TTS voices entirely. Only `rate` creates audible difference.
 * Microsoft Edge respects both pitch AND rate with its Online Natural voices.
 *
 * Strategy: Use extreme rate differentiation as the PRIMARY differentiator,
 * with pitch as a SECONDARY boost (works on Edge, Safari, Firefox).
 *
 * @param {SpeechSynthesisUtterance} utterance
 * @param {boolean} isMale
 */
export function configureVoiceStyle(utterance, isMale) {
  if (isMale) {
    utterance.pitch = 0.4;   // Deep masculine (Edge/Firefox only)
    utterance.rate = 0.78;   // Noticeably slow, deliberate pace
  } else {
    utterance.pitch = 1.8;   // High bright feminine (Edge/Firefox only)
    utterance.rate = 1.12;   // Noticeably quicker, energetic pace
  }
}

/**
 * Force-load the browser's voice list.
 * Chrome loads voices asynchronously, so we must trigger getVoices()
 * and listen for the voiceschanged event.
 *
 * @param {Function} [onLoaded] - Optional callback when voices are ready
 * @returns {Function} Cleanup function to remove event listener
 */
export function initVoices(onLoaded) {
  if (!('speechSynthesis' in window)) return () => {};

  const synth = window.speechSynthesis;
  synth.getVoices(); // Trigger initial load

  const handler = () => {
    synth.getVoices();
    if (onLoaded) onLoaded();
  };

  synth.addEventListener('voiceschanged', handler);
  return () => synth.removeEventListener('voiceschanged', handler);
}
