import cron from 'node-cron';
import db from '../db/knex.js';
import { sendRealtimeNotification } from '../socket.js';
import { deleteCachePattern } from '../config/redis.js';

/**
 * Job chạy định kỳ mỗi 30 phút để quét và hoàn tiền cho các lời mời PV AI quá 7 ngày
 */
export const startCreditCronJob = () => {
  cron.schedule('*/30 * * * *', async () => {
    console.log('[Cron Job] Bắt đầu quét lời mời phỏng vấn AI hết hạn...');
    await refundExpiredAIInvitations();
  });
};

const refundExpiredAIInvitations = async () => {
  try {
    // Lấy tối đa 100 ứng viên hết hạn 7 ngày
    const expiredApps = await db('applications')
      .join('jobs', 'applications.job_id', 'jobs.id')
      .join('users', 'applications.candidate_id', 'users.id')
      .select(
        'applications.id',
        'applications.credit_deducted',
        'jobs.hr_id',
        'jobs.title as job_title',
        'users.full_name as candidate_name'
      )
      .whereIn('applications.status', ['AI_INTERVIEW_INVITED', 'INTERVIEWING'])
      .andWhere('applications.is_refunded', false)
      .andWhereRaw("applications.invited_at <= NOW() - INTERVAL '7 days'")
      .limit(100);

    if (expiredApps.length === 0) {
      console.log('[Cron Job] Không có lời mời phỏng vấn AI nào hết hạn.');
      return;
    }

    console.log(`[Cron Job] Tìm thấy ${expiredApps.length} lời mời phỏng vấn AI hết hạn. Đang xử lý hoàn tiền...`);

    for (const app of expiredApps) {
      try {
        await db.transaction(async (trx) => {
          // 1. Cập nhật status
          await trx('applications')
            .where({ id: app.id })
            .update({
              status: 'INVITATION_EXPIRED',
              is_refunded: true,
              refund_reason: 'EXPIRED_7_DAYS',
              updated_at: new Date()
            });

          if (app.credit_deducted > 0) {
            const hrUser = await trx('users').where({ id: app.hr_id }).first();
            const walletCondition = hrUser?.company_id 
              ? { company_id: hrUser.company_id } 
              : { user_id: app.hr_id };

            const wallet = await trx('hr_wallets').where(walletCondition).forUpdate().first();
            
            if (wallet) {
              await trx('hr_wallets')
                .where({ id: wallet.id })
                .increment('total_credits', app.credit_deducted);

              await trx('credit_transactions').insert({
                wallet_id: wallet.id,
                user_id: app.hr_id,
                application_id: app.id,
                amount: app.credit_deducted,
                transaction_type: 'REFUND_EXPIRED',
                description: `Hoàn credit do lời mời phỏng vấn AI gửi đến ứng viên ${app.candidate_name} cho công việc ${app.job_title} đã hết hạn 7 ngày.`,
                created_at: new Date(),
                updated_at: new Date()
              });
            }
          }
        });

        // Xóa cache (tuỳ chọn)
        await deleteCachePattern(`applications:hr:${app.hr_id}:*`);

        // Gửi thông báo
        const [notification] = await db('notifications').insert({
          user_id: app.hr_id,
          type: 'INTERVIEW_INVITE',
          title: 'Lời mời phỏng vấn AI hết hạn',
          content: `Lời mời phỏng vấn AI gửi ứng viên ${app.candidate_name} (Vị trí: "${app.job_title}") đã hết hạn. ${app.credit_deducted} credit đã được hoàn lại ví.`,
          link: '/hr/dashboard/manage-applications',
          reference_id: app.id,
          reference_type: 'application',
          is_read: false,
          created_at: new Date(),
          updated_at: new Date()
        }).returning('*');

        sendRealtimeNotification(app.hr_id, {
          id: notification.id,
          type: 'interview_invite',
          title: notification.title,
          content: notification.content,
          time: 'Vừa xong',
          isRead: false
        });

        console.log(`[Cron Job] Đã hoàn tiền cho đơn ứng tuyển ID: ${app.id}`);
      } catch (innerError) {
        // Nếu lỗi do Unique constraint thì bỏ qua
        if (innerError.code === '23505') {
          console.log(`[Cron Job] Đơn ứng tuyển ID ${app.id} đã được hoàn tiền trước đó. Bỏ qua.`);
        } else {
          console.warn(`[Cron Job] Lỗi xử lý ứng viên ID ${app.id} (Có thể do Lock Contention). Sẽ thử lại lần sau. Lỗi: ${innerError.message}`);
        }
      }
    }
  } catch (error) {
    console.error('[Cron Job] Lỗi trong quá trình quét hết hạn:', error);
  }
};
