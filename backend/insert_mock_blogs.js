import knex from 'knex';
import dotenv from 'dotenv';
dotenv.config();

const db = knex({
  client: 'pg',
  connection: process.env.DATABASE_URL
});

async function run() {
  try {
    const user = await db('users').first();
    if (!user) {
      console.log('No users found.');
      return;
    }
    const mockBlogs = [
      {
        title: "10 Mẹo Viết CV Chinh Phục Nhà Tuyển Dụng Tech",
        slug: "10-meo-viet-cv-chinh-phuc-nha-tuyen-dung-tech-" + Date.now(),
        content: "<p>Hướng dẫn chi tiết cách tối ưu CV để vượt qua ATS và gây ấn tượng với recruiter tại các công ty công nghệ hàng đầu...</p>",
        author_id: user.id,
        view_count: 245,
        tags: ["CV", "Tech", "Tips"],
        category: "cv",
        status: "PUBLISHED",
        published_at: new Date()
      },
      {
        title: "Cách Trả Lời Câu Hỏi 'Điểm Yếu Của Bạn Là Gì?'",
        slug: "cach-tra-loi-cau-hoi-diem-yeu-cua-ban-" + Date.now(),
        content: "<p>Đây là một trong những câu hỏi khó nhất trong phỏng vấn. Hãy cùng tìm hiểu cách trả lời thông minh...</p>",
        author_id: user.id,
        view_count: 189,
        tags: ["Phỏng vấn", "Mẹo"],
        category: "interview",
        status: "PUBLISHED",
        published_at: new Date()
      }
    ];
    await db('blogs').insert(mockBlogs);
    console.log('Mock PUBLISHED blogs inserted successfully!');
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await db.destroy();
  }
}

run();
