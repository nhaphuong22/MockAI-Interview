import cron from 'node-cron';
import db from '../db/db.js'; // fixed import to use standard db.js instead of knex.js which might be wrong

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

    const expiredBatches = await trx('credit_batches')
      .where('expires_at', '<', db.fn.now())
      .andWhere('amount_remaining', '>', 0);

    let reclaimedJobCredits = 0;
    let reclaimedAiCredits = 0;

    for (const batch of expiredBatches) {
      const columnToDecrement = batch.credit_type === 'JOB_POST' ? 'total_job_credits' : 'total_ai_credits';
      await trx('hr_wallets')
        .where({ id: batch.wallet_id })
        .decrement(columnToDecrement, batch.amount_remaining);
        
      if (batch.credit_type === 'JOB_POST') reclaimedJobCredits += batch.amount_remaining;
      if (batch.credit_type === 'AI_INTERVIEW') reclaimedAiCredits += batch.amount_remaining;
    }

    const deletedBatches = await trx('credit_batches')
      .where('expires_at', '<', db.fn.now())
      .orWhere('amount_remaining', '<=', 0)
      .del();

    console.log(`[Cleanup Scheduler] Đã dọn dẹp ${deletedBatches} lô tín dụng HR cũ/hết hạn.`);
    if (reclaimedJobCredits > 0 || reclaimedAiCredits > 0) {
      console.log(`[Cleanup Scheduler] Thu hồi từ ví ảo: ${reclaimedJobCredits} Job Credits & ${reclaimedAiCredits} AI Credits.`);
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
