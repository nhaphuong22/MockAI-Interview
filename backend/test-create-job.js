import db from './src/db/knex.js';
import { createJob } from './src/services/jobService.js';

async function testSuccess() {
  console.log('--- TEST 1: THÀNH CÔNG ---');
  try {
    const result = await createJob({
      hrId: 1, // Dùng mock user ID 1
      title: 'Senior React Developer (Test)',
      description: 'Mô tả test cho công việc',
      requirements: 'Yêu cầu test cho công việc',
      status: 'OPEN',
      detailedRequirements: [
        { requirement_text: '3+ years of React experience', is_mandatory: true },
        { requirement_text: 'Good communication skills', is_mandatory: false }
      ]
    });

    console.log('Tạo Job thành công! Kết quả trả về:', JSON.stringify(result, null, 2));

    // Kiểm tra trong DB xem đã lưu thực tế chưa
    const jobInDb = await db('jobs').where({ id: result.id }).first();
    const requirementsInDb = await db('job_requirements').where({ job_id: result.id });

    console.log('Job trong DB:', jobInDb ? 'ĐÃ LƯU' : 'KHÔNG TÌM THẤY');
    console.log('Số lượng yêu cầu chi tiết trong DB:', requirementsInDb.length);

    if (jobInDb && requirementsInDb.length === 2) {
      console.log('✅ TEST 1 PASSED!');
    } else {
      console.error('❌ TEST 1 FAILED!');
    }
  } catch (err) {
    console.error('❌ Lỗi không mong muốn trong TEST 1:', err);
  }
}

async function testRollback() {
  console.log('\n--- TEST 2: KIỂM TRA ROLLBACK KHI LỖI ---');
  const title = 'Job Rollback Test ' + Date.now();
  try {
    // Chúng ta truyền vào 1 requirement không hợp lệ (thiếu requirement_text)
    // để Knex ném ra lỗi của cơ sở dữ liệu và kích hoạt rollback.
    await createJob({
      hrId: 1,
      title: title,
      description: 'Mô tả rollback test',
      requirements: 'Yêu cầu rollback test',
      status: 'OPEN',
      detailedRequirements: [
        { requirement_text: null, is_mandatory: true } // Lỗi do requirement_text không được null
      ]
    });
    console.error('❌ TEST 2 FAILED: Lẽ ra hàm phải ném lỗi nhưng lại thành công!');
  } catch (err) {
    console.log('Nhận lỗi mong đợi:', err.message);
    
    // Kiểm tra xem Job có bị tạo trong DB không
    const jobInDb = await db('jobs').where({ title }).first();
    if (!jobInDb) {
      console.log('✅ Hợp lệ: Không tìm thấy Job trong DB (Đã rollback thành công!)');
      console.log('✅ TEST 2 PASSED!');
    } else {
      console.error('❌ TEST 2 FAILED: Job vẫn được lưu mặc dù có lỗi trong transaction!');
    }
  }
}

async function run() {
  try {
    await testSuccess();
    await testRollback();
  } catch (err) {
    console.error(err);
  } finally {
    await db.destroy();
  }
}

run();
