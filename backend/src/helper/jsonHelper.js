/**
 * Dọn sạch các khối markdown bao quanh JSON và thực hiện parse an toàn
 * @param {string} str - Chuỗi JSON hoặc chuỗi bọc bởi Markdown (```json)
 * @returns {object} Đối tượng JSON đã parse
 */
export const safeParseJSON = (str) => {
  let clean = str.trim();
  if (clean.startsWith('```json')) {
    clean = clean.slice(7);
  } else if (clean.startsWith('```')) {
    clean = clean.slice(3);
  }
  if (clean.endsWith('```')) {
    clean = clean.slice(0, -3);
  }
  return JSON.parse(clean.trim());
};
