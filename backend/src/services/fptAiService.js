
import dotenv from 'dotenv';

dotenv.config();

const FPT_AI_KEY = process.env.FPT_AI_KEY;
const FPT_IDR_ENDPOINT = 'https://api.fpt.ai/vision/idr/vnm';

/**
 * Gọi API FPT.AI để trích xuất thông tin từ ảnh CCCD
 * @param {string} imageUrl URL của ảnh trên Cloudinary
 * @returns {Promise<Object>} JSON kết quả từ FPT.AI
 */
export const scanIdCard = async (imageUrl) => {
  if (!FPT_AI_KEY) {
    throw new Error('FPT_AI_KEY is not configured');
  }

  try {
    // 1. Tải ảnh từ URL
    const imageResponse = await fetch(imageUrl);
    if (!imageResponse.ok) {
      throw new Error(`Failed to fetch image from URL: ${imageResponse.statusText}`);
    }
    const blob = await imageResponse.blob();

    // 2. Chuẩn bị FormData
    const formData = new FormData();
    formData.append('image', blob, 'id_card.jpg');

    // 3. Gửi lên FPT.AI
    const fptResponse = await fetch(FPT_IDR_ENDPOINT, {
      method: 'POST',
      headers: {
        'api-key': FPT_AI_KEY,
      },
      body: formData,
    });

    if (!fptResponse.ok) {
      const errorText = await fptResponse.text();
      throw new Error(`FPT.AI API error: ${fptResponse.status} ${fptResponse.statusText} - ${errorText}`);
    }

    const data = await fptResponse.json();
    return data;
  } catch (error) {
    console.error('fptAiService.scanIdCard Error:', error);
    throw error;
  }
};
