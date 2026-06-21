/**
 * Bad Words Detection Helper
 * Contains list of profanities and exact word matching logic to avoid false positives.
 */

const singleBadWords = [
  // Vietnamese with accents (exact word matching)
  "địt", "đéo", "đm", "vcl", "vl", "đụ", "cặc", "lồn", "buồi", "phò", "đĩ", "đmm", "dâm", "vú",
  // Vietnamese without accents (exact word matching)
  "dit", "deo", "c4c", "lon", "buoi", "du", "cac", "pho", "di", "dam", "vu",
  // English profanities
  "fuck", "fucking", "shit", "bitch", "asshole", "cunt", "motherfucker", "dick", "pussy", "fag", "bastard"
];

const phraseBadWords = [
  // Vietnamese phrase matching (since phrases are long, .includes is safe without false positives)
  "chó đẻ", "mẹ kiếp", "bú cu", "đút đít", "ngu lồn", "óc chó", "chó chết", "mất dạy", "bố láo",
  "cho de", "me kiep", "bu cu", "dut dit", "ngu lon", "oc cho", "cho chet", "mat day", "bo lao"
];

/**
 * Checks if a string contains any of the bad words.
 * Splits text into single words to prevent sub-string matching errors (e.g. matching "phòng" for "phò").
 * @param {string} text 
 * @returns {boolean}
 */
export const containsBadWords = (text) => {
  if (!text || typeof text !== 'string') return false;
  
  const normalizedText = text.toLowerCase();
  
  // 1. Check for exact phrase matches
  const hasPhrase = phraseBadWords.some(phrase => normalizedText.includes(phrase));
  if (hasPhrase) return true;
  
  // 2. Split text into individual words using punctuation and whitespace as delimiters
  const words = normalizedText.split(/[\s,.\-!?;:"'()\[\]{}_+=\/\\|]+/).filter(w => w);
  
  // 3. Check for exact matches on single bad words
  return words.some(word => singleBadWords.includes(word));
};

