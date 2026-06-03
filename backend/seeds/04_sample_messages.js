/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> } 
 */
export async function seed(knex) {
  // 1. Dọn dẹp dữ liệu cũ (Xóa messages trước, conversations sau để không lỗi khóa ngoại)
  await knex('messages').del();
  await knex('conversations').del();

  console.log('Tạo dữ liệu mẫu cho Chat Realtime (Conversations & Messages)...');

  // Lấy các user mẫu
  // Giả sử user_id = 1 (HR - recruiter@mockai.com) và user_id = 2 (Candidate - candidate@mockai.com)
  const hrId = 1;
  const candidateId = 2;

  // Sắp xếp ID để participant_one < participant_two theo chuẩn
  const p1 = Math.min(hrId, candidateId);
  const p2 = Math.max(hrId, candidateId);

  // 2. Tạo một Conversation mẫu
  const [conversationId] = await knex('conversations').insert({
    participant_one: p1,
    participant_two: p2,
    application_id: 1, // Liên kết với đơn ứng tuyển mẫu từ file seed trước
    last_message_at: new Date(),
  }).returning('id');

  const id = typeof conversationId === 'object' ? conversationId.id : conversationId;

  // 3. Tạo các Messages mẫu cho cuộc hội thoại này
  const messages = [
    {
      conversation_id: id,
      sender_id: candidateId,
      content: 'Chào anh/chị, em đã gửi CV ứng tuyển vị trí Frontend Developer. Em rất mong có cơ hội được phỏng vấn ạ.',
      type: 'TEXT',
      is_read: true,
      read_at: new Date(Date.now() - 3600000), // Cách đây 1 giờ
      created_at: new Date(Date.now() - 4000000),
    },
    {
      conversation_id: id,
      sender_id: hrId,
      content: 'Chào bạn, mình đã nhận được CV. Hệ thống AI đánh giá hồ sơ của bạn khá tốt (85%). Bạn vui lòng làm bài Test kiến thức nhé.',
      type: 'TEXT',
      is_read: true,
      read_at: new Date(Date.now() - 3000000),
      created_at: new Date(Date.now() - 3500000),
    },
    {
      conversation_id: id,
      sender_id: candidateId,
      content: 'Dạ vâng, em đã hoàn thành bài test rồi ạ. Anh/chị xem giúp em nhé!',
      type: 'TEXT',
      is_read: false, // Chưa đọc
      created_at: new Date(), // Vừa gửi
    }
  ];

  await knex('messages').insert(messages);

  console.log('✅ Seed dữ liệu tin nhắn hoàn tất!');
}
