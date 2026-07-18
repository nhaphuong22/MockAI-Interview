import cron from 'node-cron';
import db from '../db/db.js';

const TZ = 'Asia/Ho_Chi_Minh';
const CRON_SCHEDULE = '0 1 * * *';

export const runCleanupProcess = async () => {
  console.log('[Cleanup Scheduler] Bắt đầu dọn dẹp dữ liệu hết hạn...');

  const trx = await db.transaction();
  try {
    const deletedSubs = await trx('user_subscriptions')
      .where('end_date', '<', db.fn.now())
      .del();
    console.log(`[Cleanup Scheduler] Đã xoá ${deletedSubs} gói thành viên hết hạn của Ứng viên.`);

    // Thu hồi credit từ các batch hết hạn (Unified Credits) đã bị loại bỏ vì Credit không còn thời hạn
    const deletedBatches = await trx('credit_batches')
      .where('amount_remaining', '<=', 0)
      .del();

    console.log(`[Cleanup Scheduler] Đã dọn dẹp ${deletedBatches} lô tín dụng HR đã sử dụng hết.`);

    await trx.commit();
    console.log('[Cleanup Scheduler] Hoàn tất quá trình dọn dẹp.');
  } catch (error) {
    await trx.rollback();
    console.error('[Cleanup Scheduler] Lỗi nghiêm trọng khi dọn dẹp:', error);
  }
};

export const initCleanupScheduler = () => {
  console.log('[Cleanup Scheduler] Khởi tạo Cronjob dọn dẹp định kỳ (01:00 AM)...');
  cron.schedule(CRON_SCHEDULE, async () => { await runCleanupProcess(); }, { timezone: TZ });
};
