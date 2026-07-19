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

    // Quét và hạ cấp trạng thái VIP của công ty nếu hết hạn
    const expiredVipCompanies = await trx('companies')
      .where('vip_expired_at', '<', db.fn.now())
      .andWhere('is_vip', true)
      .update({
        is_vip: false,
        vip_expired_at: null,
        updated_at: new Date()
      });
    if (expiredVipCompanies > 0) {
      console.log(`[Cleanup Scheduler] Đã hạ cấp VIP cho ${expiredVipCompanies} doanh nghiệp hết hạn.`);
    }

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
