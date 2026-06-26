/**
 * Chuyển đổi một mốc thời gian thành chuỗi thời gian tương đối dạng tiếng Việt.
 * Ví dụ: "Vừa xong", "10 phút trước", "2 giờ trước", "3 ngày trước".
 * 
 * @param {Date|string|number} dateInput - Thời gian cần chuyển đổi
 * @returns {string} Chuỗi hiển thị tương đối
 */
export function getRelativeTimeString(dateInput) {
  if (!dateInput) return 'Gần đây';
  const date = new Date(dateInput);
  if (isNaN(date.getTime())) return 'Gần đây';
  
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  
  // Tránh hiển thị thời gian tương lai/âm do sai lệch đồng hồ client-server
  const diffSec = Math.max(0, Math.floor(diffMs / 1000));
  
  if (diffSec < 60) {
    return 'Vừa xong';
  }
  
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) {
    return `${diffMin} phút trước`;
  }
  
  const diffHour = Math.floor(diffMin / 60);
  if (diffHour < 24) {
    return `${diffHour} giờ trước`;
  }
  
  const diffDay = Math.floor(diffHour / 24);
  if (diffDay < 30) {
    return `${diffDay} ngày trước`;
  }
  
  const diffMonth = Math.floor(diffDay / 30);
  if (diffMonth < 12) {
    return `${diffMonth} tháng trước`;
  }
  
  const diffYear = Math.floor(diffMonth / 12);
  return `${diffYear} năm trước`;
}
