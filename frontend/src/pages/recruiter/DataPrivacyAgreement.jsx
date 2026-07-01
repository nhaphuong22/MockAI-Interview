import { Clock } from 'lucide-react';

export function DataPrivacyAgreement() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0a0f1c] py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto bg-white dark:bg-[#0f172a] rounded-2xl shadow-sm border border-slate-200 dark:border-white/10 p-8 sm:p-12">
        {/* Header Section */}
        <div className="border-b border-slate-200 dark:border-white/10 pb-8 mb-8 text-center">
          <h1 className="text-2xl sm:text-3xl font-black text-slate-800 dark:text-white leading-tight uppercase mb-6">
            THỎA THUẬN VỀ XỬ LÝ DỮ LIỆU CÁ NHÂN GIỮA MOCKAI VÀ NHÀ TUYỂN DỤNG
          </h1>
          <div className="inline-flex items-center gap-2 bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400 px-4 py-2 rounded-full text-sm font-medium">
            <Clock size={16} />
            <span>Có hiệu lực từ 17 tháng 06 năm 2026</span>
          </div>
        </div>

        {/* Content Section */}
        <div className="prose prose-slate dark:prose-invert max-w-none text-[15px] leading-relaxed text-slate-700 dark:text-slate-300">
          <p className="mb-4">
            Thỏa thuận về xử lý dữ liệu cá nhân này (Sau đây gọi tắt là "Thỏa Thuận") được thiết lập, giao kết giữa:
          </p>

          <p className="font-bold text-slate-900 dark:text-white mb-2">
            1. CÔNG TY CỔ PHẦN MOCKAI VIỆT NAM<br />
            <span className="font-normal">(Sau đây gọi tắt là "MockAI")</span>
          </p>
          <p className="mb-2">Và</p>
          <p className="font-bold text-slate-900 dark:text-white mb-6">
            2. ĐƠN VỊ TUYỂN DỤNG là tổ chức, doanh nghiệp hoặc cá nhân đăng ký, sử dụng tài khoản Nhà tuyển dụng trên nền tảng MockAI<br />
            <span className="font-normal">(Sau đây gọi tắt là "Đơn vị tuyển dụng")</span>
          </p>

          <p className="mb-6">
            MockAI và Đơn vị tuyển dụng sau đây được gọi chung là "Các Bên"/ "Hai Bên" và được gọi riêng là "Bên".
          </p>

          <p className="font-bold text-slate-900 dark:text-white mb-4">TRÊN CƠ SỞ:</p>
          <ul className="space-y-3 mb-6 list-none pl-0">
            <li className="flex gap-3">
              <span className="font-medium shrink-0">(i).</span>
              <span>Đơn vị tuyển dụng là một pháp nhân được thành lập và hoạt động hợp pháp theo pháp luật Việt Nam, có nhu cầu sử dụng các dịch vụ do MockAI cung cấp.</span>
            </li>
            <li className="flex gap-3">
              <span className="font-medium shrink-0">(ii).</span>
              <span>Trong quá trình thực hiện Điều khoản sử dụng dịch vụ và/ hoặc hợp đồng dịch vụ tuyển dụng giữa MockAI và Đơn vị tuyển dụng, nhằm thực hiện mục đích xử lý dữ liệu cá nhân phù hợp với quy định pháp luật, MockAI cung cấp và duy trì cho Đơn vị tuyển dụng một không gian làm việc kỹ thuật số biệt lập trên nền tảng của MockAI.</span>
            </li>
            <li className="flex gap-3">
              <span className="font-medium shrink-0">(iii).</span>
              <span>Nhằm bảo vệ quyền và lợi ích hợp pháp của mỗi Bên trong việc thực hiện các yêu cầu xử lý dữ liệu cá nhân cần thiết cho giao dịch, Các Bên thỏa thuận và cam kết về việc xử lý dữ liệu cá nhân theo quy định pháp luật Việt Nam hiện hành.</span>
            </li>
          </ul>

          <p className="font-bold text-slate-900 dark:text-white mb-8">
            DO ĐÓ, Các Bên thống nhất ký kết Thỏa thuận về xử lý dữ liệu cá nhân này ("Thỏa Thuận") với các điều khoản cụ thể như sau:
          </p>

          <h3 className="text-lg font-bold text-slate-900 dark:text-white mt-8 mb-4">ĐIỀU 1. GIẢI THÍCH THUẬT NGỮ</h3>
          <ul className="space-y-3 mb-8 list-none pl-0">
            <li className="flex gap-3">
              <span className="font-medium shrink-0">1.1.</span>
              <span>"Workplace" là không gian làm việc kỹ thuật số biệt lập được MockAI thiết lập và duy trì dành riêng cho Đơn vị tuyển dụng trên nền tảng của MockAI</span>
            </li>
            <li className="flex gap-3">
              <span className="font-medium shrink-0">1.2.</span>
              <span>"Dữ liệu cá nhân" là dữ liệu số hoặc thông tin dưới dạng khác xác định hoặc giúp xác định một con người cụ thể, bao gồm: dữ liệu cá nhân cơ bản và dữ liệu cá nhân nhạy cảm theo quy định của Pháp luật bảo vệ dữ liệu cá nhân. Trong phạm vi Thỏa thuận này, Dữ liệu cá nhân bao gồm (i) Các dữ liệu cá nhân được lưu trữ, hiển thị và xử lý trong phạm vi Workplace; (ii) Các dữ liệu được xử lý thông qua các phương thức tích hợp, kết nối kỹ thuật khác với Workspace thuộc phạm vi Dịch vụ do MockAI cung cấp cho Đơn vị tuyển dụng theo Hợp đồng; (iii) Các dữ liệu thuộc quyền sở hữu hợp pháp của Đơn vị tuyển dụng hoặc do Đơn vị tuyển dụng tự thu thập từ các nguồn khác phù hợp với quy định pháp luật và chuyển lên Workspace của MockAI để thực hiện các thao tác kỹ thuật, lưu trữ hoặc xử lý theo chỉ thị (Nếu có).</span>
            </li>
            <li className="flex gap-3">
              <span className="font-medium shrink-0">1.3.</span>
              <span>"Chủ thể dữ liệu" là các ứng viên ứng tuyển và đồng ý kết nối với Đơn vị tuyển dụng.</span>
            </li>
            <li className="flex gap-3">
              <span className="font-medium shrink-0">1.4.</span>
              <span>"Pháp luật bảo vệ dữ liệu cá nhân" là hệ thống các văn bản quy phạm pháp luật của Việt Nam điều chỉnh các hoạt động liên quan đến dữ liệu cá nhân, bao gồm nhưng không giới hạn ở Luật Bảo vệ dữ liệu cá nhân số 91/2025/QH15 (sau đây gọi là "Luật số 91/2025/QH15"); các Nghị định hướng dẫn thi hành; các quy định về an ninh mạng, an toàn thông tin mạng và các văn bản sửa đổi, bổ sung hoặc thay thế các văn bản nêu trên tại từng thời điểm. Trong phạm vi Thỏa thuận này, thuật ngữ này cũng bao gồm các tiêu chuẩn kỹ thuật và hướng dẫn chuyên môn của cơ quan Nhà nước có thẩm quyền về việc bảo vệ quyền và lợi ích hợp pháp của Chủ thể dữ liệu.</span>
            </li>
            <li className="flex gap-3">
              <span className="font-medium shrink-0">1.5.</span>
              <span>"Xử lý dữ liệu cá nhân" là hoạt động tác động đến dữ liệu cá nhân, bao gồm một hoặc nhiều hoạt động như sau: thu thập, phân tích, tổng hợp, mã hóa, giải mã, chỉnh sửa, xóa, hủy, khử nhận dạng, cung cấp, công khai, chuyển giao dữ liệu cá nhân và hoạt động khác tác động đến dữ liệu cá nhân.</span>
            </li>
            <li className="flex gap-3">
              <span className="font-medium shrink-0">1.6.</span>
              <span>"Bảo vệ dữ liệu cá nhân" là việc cơ quan, tổ chức, cá nhân sử dụng lực lượng, phương tiện, biện pháp để phòng, chống hoạt động xâm phạm dữ liệu cá nhân.</span>
            </li>
            <li className="flex gap-3">
              <span className="font-medium shrink-0">1.7.</span>
              <span>"Chủ thể dữ liệu" là người được dữ liệu cá nhân phản ánh.</span>
            </li>
            <li className="flex gap-3">
              <span className="font-medium shrink-0">1.8.</span>
              <span>"Bên Kiểm soát dữ liệu cá nhân" là cơ quan, tổ chức, cá nhân quyết định mục đích và phương tiện xử lý dữ liệu cá nhân.</span>
            </li>
            <li className="flex gap-3">
              <span className="font-medium shrink-0">1.9.</span>
              <span>"Bên Xử lý dữ liệu cá nhân" là cơ quan, tổ chức, cá nhân thực hiện việc xử lý dữ liệu cá nhân theo yêu cầu của bên kiểm soát dữ liệu cá nhân hoặc bên kiểm soát và xử lý dữ liệu cá nhân thông qua hợp đồng.</span>
            </li>
            <li className="flex gap-3">
              <span className="font-medium shrink-0">1.10.</span>
              <span>"Bên thứ ba" là tổ chức, cá nhân ngoài chủ thể dữ liệu cá nhân, bên kiểm soát dữ liệu cá nhân, bên kiểm soát và xử lý dữ liệu cá nhân, bên xử lý dữ liệu cá nhân tham gia vào việc xử lý dữ liệu cá nhân theo quy định của pháp luật.</span>
            </li>
            <li className="flex gap-3">
              <span className="font-medium shrink-0">1.11.</span>
              <span>"Hợp đồng" là các hợp đồng cung cấp dịch vụ, thỏa thuận hợp tác, hoặc Điều khoản sử dụng dịch vụ đang có hiệu lực mà Đơn vị tuyển dụng đã ký kết, xác nhận hoặc đồng ý giao kết với MockAI trước, trong, và sau thời điểm Thỏa thuận này có hiệu lực.</span>
            </li>
          </ul>

          <h3 className="text-lg font-bold text-slate-900 dark:text-white mt-8 mb-4">ĐIỀU 2. MỤC ĐÍCH XỬ LÝ DỮ LIỆU CÁ NHÂN</h3>
          <ul className="space-y-3 mb-8 list-none pl-0">
            <li className="flex gap-3">
              <span className="font-medium shrink-0">2.1.</span>
              <span>"Mục đích xử lý dữ liệu cá nhân": Các Bên ghi nhận và đồng ý rằng, để phục vụ mục đích thực hiện hỗ trợ quá trình tuyển dụng của Đơn vị tuyển dụng, mỗi Bên có quyền Kiểm soát và Xử lý dữ liệu cá nhân trong phạm vi quyền hạn, trách nhiệm riêng biệt của mình và có trách nhiệm thu thập sự đồng ý từ Chủ thể dữ liệu tương ứng với phạm vi dữ liệu mà mình kiểm soát.</span>
            </li>
            <li className="flex gap-3">
              <span className="font-medium shrink-0">2.2.</span>
              <span>Các Bên phải (i) tôn trọng quyền của Chủ thể dữ liệu theo Pháp luật bảo vệ dữ liệu cá nhân liên quan, (ii) chỉ thực hiện Xử lý dữ liệu cá nhân theo đúng mục đích, đối tượng Chủ thể dữ liệu, loại Dữ liệu cá nhân, phạm vi, trong thời hạn quy định tại Thỏa thuận này, (iii) chủ động phòng ngừa, ngăn chặn vi phạm về Dữ liệu cá nhân.</span>
            </li>
          </ul>

          <h3 className="text-lg font-bold text-slate-900 dark:text-white mt-8 mb-4">ĐIỀU 3. TRÁCH NHIỆM CỦA CÁC BÊN</h3>
          <ul className="space-y-3 mb-8 list-none pl-0">
            <li className="flex gap-3">
              <span className="font-medium shrink-0">3.1.</span>
              <div>
                <p className="font-bold text-slate-800 dark:text-slate-200 mb-2">Đối với Dữ liệu cá nhân thuộc nền tảng chung của MockAI (Ngoài phạm vi Workplace của Đơn vị tuyển dụng)</p>
                <p>Nhằm làm rõ và loại trừ trách nhiệm pháp lý cho Đơn vị tuyển dụng, Các Bên thống nhất rằng đối với toàn bộ hồ sơ, thông tin ứng viên và các Dữ liệu cá nhân khác thuộc hệ sinh thái nền tảng tuyển dụng chung của MockAI (nằm ngoài phạm vi Workplace của Đơn vị tuyển dụng), MockAI hoạt động độc lập với tư cách là Bên Kiểm soát và Xử lý dữ liệu cá nhân. MockAI tự chịu hoàn toàn trách nhiệm trong việc thu thập sự đồng ý hợp lệ của Chủ thể dữ liệu, đảm bảo an toàn thông tin và tuân thủ các quy định của Pháp luật bảo vệ dữ liệu cá nhân đối với tệp dữ liệu này mà không có bất kỳ sự liên đới trách nhiệm nào tới Đơn vị tuyển dụng.</p>
              </div>
            </li>
            <li className="flex gap-3">
              <span className="font-medium shrink-0">3.2.</span>
              <div>
                <p className="font-bold text-slate-800 dark:text-slate-200 mb-2">Trách nhiệm trong phạm vi Workplace</p>
                <p className="mb-4">Đối với phạm vi Dữ liệu cá nhân tại khoản 1.2, Đơn vị tuyển dụng đóng vai trò là Bên Kiểm soát dữ liệu cá nhân, chịu trách nhiệm quyết định mục đích và phương tiện xử lý dữ liệu phù hợp với quy định của pháp luật về bảo vệ dữ liệu cá nhân nhằm phục vụ cho hoạt động tuyển dụng của mình. MockAI giữ vai trò là Bên Xử lý dữ liệu cá nhân, thực hiện các hành vi xử lý dựa trên yêu cầu, chỉ thị kỹ thuật của Đơn vị tuyển dụng.</p>
                
                <p className="font-bold text-slate-800 dark:text-slate-200 mb-2">3.2.1 MockAI có trách nhiệm:</p>
                <ul className="space-y-2 mb-4 list-none pl-0">
                  <li className="flex gap-3"><span className="shrink-0">a)</span><span>Xử lý dữ liệu cá nhân theo đúng nguyên tắc bảo vệ dữ liệu cá nhân, quy định liên quan đến bảo vệ dữ liệu cá nhân áp dụng cho Bên Xử lý dữ liệu cá nhân theo Luật số 91/2025/QH15, Hợp đồng giữa hai bên và Thỏa thuận này.</span></li>
                  <li className="flex gap-3"><span className="shrink-0">b)</span><span>Hỗ trợ cung cấp công cụ kỹ thuật để Đơn vị tuyển dụng hiển thị thông báo xử lý dữ liệu cá nhân và/hoặc nội dung xin sự đồng ý của Chủ thể dữ liệu đối với các hoạt động xử lý nhằm mục đích tuyển dụng do Đơn vị tuyển dụng thực hiện sau khi Dữ liệu cá nhân được chuyển vào Workspace của Đơn vị tuyển dụng. Đồng thời, trong phạm vi khả năng kỹ thuật của hệ thống và khi có yêu cầu hợp lệ từ Đơn vị tuyển dụng, MockAI sẽ cung cấp thông tin, log hệ thống và/ hoặc bằng chứng ghi nhận sự chấp thuận của Chủ thể dữ liệu được lưu trữ trên hệ thống nhằm phục vụ việc giải trình hoặc xử lý yêu cầu theo quy định pháp luật.</span></li>
                  <li className="flex gap-3"><span className="shrink-0">c)</span><span>Thực hiện chỉnh sửa dữ liệu cá nhân của Chủ thể dữ liệu theo đúng yêu cầu/chấp thuận bằng văn bản của Bên Kiểm soát dữ liệu cá nhân và có quyền yêu cầu Bên Kiểm soát dữ liệu cá nhân cung cấp bằng chứng về việc Chủ thể dữ liệu đã đồng ý việc chỉnh sửa dữ liệu cá nhân.</span></li>
                  <li className="flex gap-3"><span className="shrink-0">d)</span><span>Trong phạm vi Workplace, MockAI có trách nhiệm thông báo ngay lập tức trong vòng 24 giờ cho Đơn vị tuyển dụng về mọi khiếu nại, yêu cầu hoặc thắc mắc nhận được từ Chủ thể dữ liệu. MockAI không được trực tiếp phản hồi hoặc thực hiện các thao tác xử lý theo yêu cầu của Chủ thể dữ liệu trừ khi có chỉ thị hoặc sự chấp thuận cụ thể từ Đơn vị tuyển dụng. Các Bên có nghĩa vụ phản hồi trong thời hạn quy định theo Pháp luật bảo vệ dữ liệu cá nhân và cam kết hỗ trợ, hợp tác chặt chẽ để giải quyết dứt điểm các khiếu nại, yêu cầu này.</span></li>
                  <li className="flex gap-3"><span className="shrink-0">e)</span><span>Xóa, trả lại toàn bộ Dữ liệu cá nhân cho Bên Kiểm soát dữ liệu cá nhân sau khi kết thúc xử lý dữ liệu hoặc có thông báo xóa, trả lại Dữ liệu cá nhân từ Bên Kiểm soát dữ liệu cá nhân, trừ trường hợp Chủ thể dữ liệu có đồng ý/chấp thuận khác với Bên xử lý dữ liệu cá nhân hoặc lưu giữ phục vụ cho mục đích giải trình với cơ quan nhà nước.</span></li>
                  <li className="flex gap-3"><span className="shrink-0">f)</span><span>Các Bên hiểu và thống nhất rằng MockAI có quyền chủ động lựa chọn và chỉ định các Bên thứ ba (bao gồm nhưng không giới hạn ở các nhà cung cấp hạ tầng điện toán đám mây, đơn vị lưu trữ dữ liệu, đơn vị cung cấp giải pháp kỹ thuật) để duy trì hoạt động của nền tảng và thực hiện các Dịch vụ theo Hợp đồng. MockAI cam kết chịu trách nhiệm hoàn toàn trước Đơn vị tuyển dụng về việc thực hiện nghĩa vụ bảo vệ dữ liệu của các Bên thứ ba; mọi hành vi vi phạm của các đơn vị này trong phạm vi dịch vụ cung cấp cho Đơn vị tuyển dụng sẽ được coi là lỗi của MockAI theo quy định tại Pháp luật bảo vệ dữ liệu cá nhân.</span></li>
                  <li className="flex gap-3"><span className="shrink-0">g)</span><span>Thông báo ngay cho Đơn vị tuyển dụng một cách nhanh nhất có thể và không chậm hơn 24 giờ trong các trường hợp: i) MockAI có lý do hợp lý để tin rằng không thể tiếp tục tuân thủ các nghĩa vụ theo Hợp đồng do các thay đổi hoặc yêu cầu mới từ pháp luật; ii) MockAI có căn cứ cho thấy bất kỳ chỉ dẫn hoặc hành vi nào của Đơn vị tuyển dụng liên quan đến việc xử lý Dữ liệu cá nhân có dấu hiệu vi phạm Pháp luật bảo vệ dữ liệu cá nhân; iii) MockAI nhận được yêu cầu, lệnh triệu tập hoặc yêu cầu kiểm tra từ cơ quan nhà nước có thẩm quyền liên quan đến việc xử lý dữ liệu; iv) MockAI phát hiện hoặc có nghi ngờ hợp lý về việc xảy ra sự cố bảo mật hoặc vi phạm dữ liệu cá nhân.</span></li>
                  <li className="flex gap-3"><span className="shrink-0">h)</span><span>Các trách nhiệm khác phù hợp với quy định của Pháp luật bảo vệ dữ liệu cá nhân.</span></li>
                </ul>

                <p className="font-bold text-slate-800 dark:text-slate-200 mb-2">3.2.2 Đơn vị tuyển dụng có trách nhiệm:</p>
                <ul className="space-y-2 list-none pl-0">
                  <li className="flex gap-3"><span className="shrink-0">a)</span><span>Cam kết việc thu thập dữ liệu đã đạt được sự đồng ý hợp lệ của Chủ thể dữ liệu về mục đích tuyển dụng và các hoạt động xử lý dữ liệu liên quan theo Pháp luật bảo vệ dữ liệu cá nhân.</span></li>
                  <li className="flex gap-3"><span className="shrink-0">b)</span><span>Chịu trách nhiệm thiết lập tiêu chí, mục đích tuyển dụng, thời hạn lưu trữ hồ sơ và các chỉ thị kỹ thuật xử lý hồ sơ ứng viên trên Workplace. Đơn vị tuyển dụng cam kết các hoạt động lọc, đánh giá và tương tác với Chủ thể dữ liệu cũng như các yêu cầu tới MockAI không vi phạm điều cấm của pháp luật hoặc các quy định về chống phân biệt đối xử trong lao động.</span></li>
                  <li className="flex gap-3"><span className="shrink-0">c)</span><span>Bảo đảm các quyền của Chủ thể dữ liệu và yêu cầu MockAI phối hợp để bảo đảm các quyền của Chủ thể dữ liệu theo quy định của pháp luật;</span></li>
                  <li className="flex gap-3"><span className="shrink-0">d)</span><span>Đảm bảo nhân sự, đại diện hoặc người được chỉ định thực hiện công việc của Đơn vị tuyển dụng tuân thủ các quy định về bảo vệ dữ liệu cá nhân theo Pháp luật bảo vệ dữ liệu cá nhân; không sao chép, trích xuất hoặc tiếp cận các dữ liệu nằm ngoài phạm vi Workplace của Đơn vị tuyển dụng.</span></li>
                  <li className="flex gap-3"><span className="shrink-0">e)</span><span>Tiếp nhận, phản hồi các yêu cầu, khiếu nại từ Chủ thể dữ liệu và thông báo cho MockAI để kịp thời xử lý yêu cầu hợp pháp của Chủ thể dữ liệu khi Chủ thể dữ liệu thực hiện quyền của họ theo quy định của pháp luật, trong mọi trường hợp không muộn hơn 24 tiếng từ thời điểm nhận được yêu cầu của Chủ thể dữ liệu.</span></li>
                  <li className="flex gap-3"><span className="shrink-0">f)</span><span>Tuân thủ nghiêm ngặt các quy định về bảo mật dữ liệu có liên quan đến Điều khoản sử dụng và Chính sách vận hành nền tảng của MockAI.</span></li>
                  <li className="flex gap-3"><span className="shrink-0">g)</span><span>Các trách nhiệm khác phù hợp với quy định tại Luật số 91/2025/QH15 và các văn bản hướng dẫn có liên quan tại từng thời kỳ.</span></li>
                </ul>
              </div>
            </li>
            <li className="flex gap-3">
              <span className="font-medium shrink-0">3.3.</span>
              <span>Ngoài các trách nhiệm nêu trên, khi bất kỳ bên nào giữ vai trò là Bên kiểm soát dữ liệu cá nhân, Bên xử lý dữ liệu cá nhân, Bên kiểm soát và xử lý dữ liệu cá nhân thì Bên đó có trách nhiệm về bảo vệ dữ liệu cá nhân theo quy định theo Pháp luật bảo vệ dữ liệu cá nhân.</span>
            </li>
          </ul>

          <h3 className="text-lg font-bold text-slate-900 dark:text-white mt-8 mb-4">ĐIỀU 4. LƯU TRỮ DỮ LIỆU CÁ NHÂN</h3>
          <ul className="space-y-3 mb-8 list-none pl-0">
            <li className="flex gap-3">
              <span className="font-medium shrink-0">4.1.</span>
              <span>Dữ liệu cá nhân sẽ được xử lý cho đến khi các mục đích xử lý dữ liệu đã được hoàn thành.</span>
            </li>
            <li className="flex gap-3">
              <span className="font-medium shrink-0">4.2.</span>
              <span>Nhằm thực hiện các nghĩa vụ đảm bảo tuân thủ quy định pháp luật và đáp ứng yêu cầu của cơ quan Nhà nước có thẩm quyền, các Bên có quyền tiếp tục lưu trữ Dữ liệu cá nhân ngay cả khi Hợp đồng và Văn bản thỏa thuận này đã chấm dứt hiệu lực pháp luật, hoặc khi Chủ thể dữ liệu thực hiện quyền rút lại sự đồng ý/quyền xóa dữ liệu.</span>
            </li>
            <li className="flex gap-3">
              <span className="font-medium shrink-0">4.3.</span>
              <span>Trường hợp một trong các Bên có thỏa thuận độc lập với Chủ thể dữ liệu về thời hạn, mục đích hoặc phương thức lưu trữ khác với quy định tại Thỏa thuận này, Bên đó có trách nhiệm độc lập trong việc thực hiện và lưu trữ dữ liệu theo đúng cam kết trực tiếp với Chủ thể dữ liệu, tuân thủ quy định tại Pháp luật bảo vệ dữ liệu cá nhân.</span>
            </li>
          </ul>

          <h3 className="text-lg font-bold text-slate-900 dark:text-white mt-8 mb-4">ĐIỀU 5. QUYỀN YÊU CẦU</h3>
          <ul className="space-y-3 mb-8 list-none pl-0">
            <li className="flex gap-3">
              <span className="font-medium shrink-0">5.1.</span>
              <span>Mỗi Bên (sau đây gọi là "Bên Yêu Cầu") có quyền gửi văn bản yêu cầu Bên còn lại (sau đây gọi là "Bên Đáp Ứng") cung cấp bằng chứng, tài liệu tường trình hoặc giải trình về các nội dung i) Việc Bên Đáp Ứng đã có được sự đồng ý hợp lệ của Chủ thể dữ liệu để xử lý dữ liệu cá nhân theo quy định; ii) Việc Bên Đáp Ứng tuân thủ nghĩa vụ liên quan đến bảo vệ dữ liệu cá nhân theo Pháp luật bảo vệ dữ liệu cá nhân; iii) Việc Bên Đáp Ứng đã áp dụng đầy đủ các biện pháp bảo mật và bảo vệ dữ liệu cá nhân theo quy định tại Thỏa thuận này và Pháp luật bảo vệ dữ liệu cá nhân.</span>
            </li>
            <li className="flex gap-3">
              <span className="font-medium shrink-0">5.2.</span>
              <span>Bên Đáp Ứng có trách nhiệm thực hiện các yêu cầu nêu tại Điều 5.1 khi thuộc một trong các trường hợp i) Bên Yêu Cầu cần đáp ứng, tuân thủ các yêu cầu hoặc mệnh lệnh bằng văn bản của cơ quan Nhà nước có thẩm quyền; ii) Phục vụ quá trình giải quyết tranh chấp, khiếu nại, khiếu kiện với Chủ thể dữ liệu hoặc các tổ chức, cá nhân có liên quan; iii) Khi cần thực hiện các hành động khẩn cấp nhằm ngăn chặn hoặc giảm thiểu thiệt hại, tổn thất cho Chủ thể dữ liệu hoặc cho các Bên; iv) Để đảm bảo tính tuân thủ đối với quy định theo Pháp luật bảo vệ dữ liệu cá nhân theo từng thời điểm.</span>
            </li>
            <li className="flex gap-3">
              <span className="font-medium shrink-0">5.3.</span>
              <span>Bên Yêu Cầu có trách nhiệm cung cấp các bằng chứng hoặc lý do xác đáng cho yêu cầu của mình.</span>
            </li>
            <li className="flex gap-3">
              <span className="font-medium shrink-0">5.4.</span>
              <span>Bên Đáp Ứng sẽ phản hồi và cung cấp tài liệu trong vòng 05 (năm) ngày làm việc kể từ ngày nhận được yêu cầu hợp lệ. Trường hợp yêu cầu có tính chất phức tạp, đòi hỏi thời gian trích xuất hệ thống hoặc khối lượng dữ liệu lớn, Bên Đáp Ứng có quyền thông báo gia hạn thêm thời gian cung cấp nhưng không quá 15 (mười lăm) ngày làm việc. Việc cung cấp thông tin này phải đảm bảo điều kiện không dẫn đến vi phạm quy định pháp luật, xâm phạm bí mật kinh doanh hoặc ảnh hưởng đến hoạt động kinh doanh, vận hành của Bên Đáp Ứng.</span>
            </li>
            <li className="flex gap-3">
              <span className="font-medium shrink-0">5.5.</span>
              <span>Trừ trường hợp phát sinh sự cố vi phạm dữ liệu cá nhân thực tế hoặc có mệnh lệnh/yêu cầu trực tiếp từ cơ quan Nhà nước có thẩm quyền, quyền yêu cầu cung cấp tài liệu, giải trình định kỳ quy định tại Điều này chỉ được thực hiện không quá 01 (một) lần trong mỗi chu kỳ 12 tháng. Đối với các yêu cầu đòi hỏi phát sinh nguồn lực kỹ thuật hoặc chi phí đáng kể, Bên Đáp Ứng có quyền đề nghị Bên Yêu Cầu thanh toán các chi phí hợp lý trước khi tiến hành thực hiện.</span>
            </li>
          </ul>

          <h3 className="text-lg font-bold text-slate-900 dark:text-white mt-8 mb-4">ĐIỀU 6. KIỂM TRA TUÂN THỦ</h3>
          <ul className="space-y-3 mb-8 list-none pl-0">
            <li className="flex gap-3">
              <span className="font-medium shrink-0">6.1.</span>
              <span>Mỗi Bên có quyền thực hiện việc kiểm tra, đánh giá với Bên còn lại nhằm xác nhận tính tuân thủ các cam kết về bảo vệ dữ liệu cá nhân tại Thỏa thuận này và quy định của Pháp luật bảo vệ dữ liệu cá nhân. Nhằm đảm bảo an toàn thông tin cho toàn bộ nền tảng, hoạt động kiểm tra tuân thủ của mỗi Bên sẽ được ưu tiên thực hiện thông qua việc cung cấp các Bảng câu hỏi đánh giá bảo mật, hoặc các Chứng chỉ kiểm toán độc lập (như ISO/IEC 27001 hoặc tương đương) còn hiệu lực.</span>
            </li>
            <li className="flex gap-3">
              <span className="font-medium shrink-0">6.2.</span>
              <div>
                <p className="mb-2">Trường hợp các tài liệu tại Khoản 6.1 không đủ để chứng minh tính tuân thủ, mỗi Bên có quyền tự mình hoặc chỉ định Bên Thứ Ba thực hiện việc đánh giá tuân thủ các nghĩa vụ bảo vệ dữ liệu cá nhân theo Thỏa thuận này. Hoạt động kiểm tra này phải tuân thủ phải đáp ứng các điều kiện sau:</p>
                <ul className="list-disc pl-5 space-y-1 mb-2">
                  <li>Bên yêu cầu kiểm tra phải thông báo bằng văn bản trước ít nhất 15 (mười lăm) ngày (trừ trường hợp khẩn cấp do sự cố vi phạm dữ liệu), nêu rõ nội dung, phạm vi, thời gian và nhân sự tham gia. Trong trường hợp thuê Bên thứ Ba cần thông báo lại thông tin chi tiết về danh tính, năng lực pháp lý và chuyên môn của Bên Thứ Ba và phạm vi nội dung đánh giá tuân thủ.</li>
                  <li>Bên được kiểm tra có trách nhiệm phối hợp, cung cấp các bằng chứng, tài liệu giải trình liên quan trong phạm vi hợp lý và không vi phạm các quy định pháp luật.</li>
                  <li>Bên thuê phải đảm bảo Bên Thứ Ba ký kết văn bản cam kết bảo mật (NDA) với các điều khoản không thấp hơn tiêu chuẩn bảo mật tại Thỏa thuận này. Bên Thứ Ba tuyệt đối không được sao chép, trích xuất hoặc tiếp cận các dữ liệu nằm ngoài phạm vi Workplace của Đơn vị tuyển dụng, đặc biệt là bí mật kinh doanh và dữ liệu của các Đơn vị tuyển dụng khác trên hệ thống của MockAI;</li>
                  <li>Mọi chi phí phát sinh liên quan đến việc thuê Bên Thứ Ba và thực hiện đánh giá sẽ do Bên thuê tự chi trả, trừ trường hợp các Bên có thỏa thuận khác bằng văn bản;</li>
                  <li>Bên thuê phải chịu trách nhiệm hoàn toàn đối với mọi hành vi của Bên Thứ Ba trong quá trình thực hiện đánh giá nếu hành vi đó gây ra vi phạm liên quan đến nghĩa vụ bảo vệ dữ liệu cá nhân.</li>
                </ul>
              </div>
            </li>
            <li className="flex gap-3">
              <span className="font-medium shrink-0">6.3.</span>
              <div>
                <p className="font-bold text-slate-800 dark:text-slate-200 mb-2">Xử lý vi phạm và Thông báo không tuân thủ</p>
                <p className="mb-2">Không ảnh hưởng đến quyền chấm dứt được quy định tại Hợp đồng chính, trường hợp một Bên không thể đáp ứng hoặc vi phạm các nghĩa vụ bảo vệ dữ liệu theo Thỏa thuận này, Bên còn lại có quyền tạm thời đình chỉ toàn bộ hoặc một phần hoạt động Xử lý dữ liệu liên quan cho đến khi hành vi vi phạm được khắc phục hoàn toàn.</p>
                <p className="mb-2">Hai Bên có trách nhiệm thỏa thuận về thời hạn khắc phục vi phạm. Trường hợp hành vi vi phạm không thể khắc phục hoặc Bên vi phạm không thực hiện các biện pháp khắc phục trong thời hạn đã được thỏa thuận, Bên bị vi phạm có quyền chấm dứt ngay lập tức phần dịch vụ liên quan đến hoạt động Xử lý dữ liệu đó.</p>
                <p>Nếu việc đình chỉ hoạt động Xử lý dữ liệu do lỗi của một Bên kéo dài quá 30 (ba mươi) ngày liên tục, Bên còn lại có quyền đơn phương chấm dứt Hợp đồng chính (Nếu có) và Thỏa thuận này ngay lập tức mà không phải chịu bất kỳ trách nhiệm bồi thường nào do việc chấm dứt trước hạn.</p>
              </div>
            </li>
          </ul>

          <h3 className="text-lg font-bold text-slate-900 dark:text-white mt-8 mb-4">ĐIỀU 7. NGUYÊN TẮC BỒI THƯỜNG</h3>
          <ul className="space-y-3 mb-8 list-none pl-0">
            <li className="flex gap-3">
              <span className="font-medium shrink-0">7.1.</span>
              <div>
                <p className="mb-2">Mỗi Bên ("Bên Vi Phạm") có trách nhiệm bồi thường và giữ cho Bên còn lại không bị thiệt hại trước mọi chi phí, tổn thất, tiền phạt vi phạm từ cơ quan Nhà nước, hoặc các khoản bồi thường cho Chủ thể dữ liệu phát sinh trực tiếp từ:</p>
                <ul className="list-disc pl-5 space-y-1">
                  <li>Hành vi vi phạm bất kỳ cam kết, nghĩa vụ bảo mật hoặc quy định về xử lý dữ liệu cá nhân nào tại Thỏa thuận này;</li>
                  <li>Hành vi xử lý dữ liệu vượt quá phạm vi chỉ thị hoặc mục đích đã thỏa thuận;</li>
                  <li>Hành vi vi phạm do lỗi vô ý hoặc cố ý của nhân sự, đại diện hoặc bên thứ ba được Bên Vi Phạm cấp quyền truy cập vào hệ thống.</li>
                </ul>
              </div>
            </li>
            <li className="flex gap-3">
              <span className="font-medium shrink-0">7.2.</span>
              <span>MockAI có trách nhiệm bồi thường và bảo vệ Đơn vị tuyển dụng khỏi các khiếu nại, thủ tục tố tụng từ cơ quan Nhà nước hoặc Chủ thể dữ liệu liên quan đến i) hoạt động xử lý dữ liệu của MockAI nếu các hoạt động này vi phạm nghĩa vụ bảo mật hoặc các quy định đã cam kết tại Thỏa thuận này; ii) hoạt động xử lý Dữ liệu cá nhân do MockAI thực hiện trên nền tảng chung của MockAI nằm ngoài phạm vi Workplace của Đơn vị tuyển dụng, bao gồm nhưng không giới hạn ở việc lưu trữ, sử dụng, truy cập, khai thác, tiết lộ hoặc quản lý dữ liệu của MockAI trên nền tảng chung; và iii) lỗi kỹ thuật của hệ thống hạ tầng hoặc nền tảng của MockAI.</span>
            </li>
            <li className="flex gap-3">
              <span className="font-medium shrink-0">7.3.</span>
              <span>Đơn vị tuyển dụng có trách nhiệm bồi thường và bảo vệ MockAI khỏi mọi khiếu nại, thiệt hại hoặc tổn thất phát sinh từ i) các chỉ thị xử lý dữ liệu của Đơn vị tuyển dụng vi phạm quy định pháp luật; ii) Dữ liệu cá nhân do Đơn vị tuyển dụng thu thập hoặc chuyển giao cho MockAI không đảm bảo tính pháp lý hoặc thiếu sự đồng ý của Chủ thể dữ liệu; iii) Việc Đơn vị tuyển dụng không tuân thủ Điều khoản sử dụng hoặc Chính sách vận hành nền tảng đã được MockAI công bố và cập nhật tại website chính thức của MockAI tại từng thời điểm.</span>
            </li>
          </ul>

          <h3 className="text-lg font-bold text-slate-900 dark:text-white mt-8 mb-4">ĐIỀU 8. CÁCH THỨC GIẢI QUYẾT TRANH CHẤP VÀ ĐẦU MỐI LIÊN HỆ</h3>
          <ul className="space-y-3 mb-8 list-none pl-0">
            <li className="flex gap-3">
              <span className="font-medium shrink-0">8.1.</span>
              <div>
                <p className="mb-4">Trong trường hợp một Bên phát hiện có bất kỳ sự cố vi phạm về bảo vệ dữ liệu cá nhân nào hoặc nhận được yêu cầu thực hiện quyền của Chủ thể dữ liệu, Bên phát hiện/ nhận được yêu cầu phải thực hiện thông báo bằng văn bản cho Bên còn lại một cách nhanh nhất và không chậm hơn 24 (hai mươi tư) giờ sau khi nhận thấy vi phạm hoặc tiếp nhận yêu cầu. Trong trường hợp thông báo sau 24 (hai mươi tư) giờ thì phải kèm theo lý do thông báo chậm.</p>
                <p className="font-bold text-slate-800 dark:text-slate-200 mb-2">Thông tin đầu mối liên hệ về các vấn đề liên quan đến dữ liệu cá nhân của MockAI:</p>
                <ul className="list-disc pl-5 space-y-1 mb-4">
                  <li><span className="font-medium">Người nhận:</span> Ban chịu trách nhiệm bảo vệ dữ liệu cá nhân (Ban DPO)</li>
                  <li><span className="font-medium">Địa chỉ:</span> Tầng 3, N01-HH1, Số 47 Nguyễn Tuân, Phường Thanh Xuân, Thành phố Hà Nội, Việt Nam</li>
                  <li><span className="font-medium">Điện thoại:</span> 1900 068 889 (Phím 1)</li>
                  <li><span className="font-medium">Email:</span> dpo@mockai.com</li>
                </ul>
                <p className="font-bold text-slate-800 dark:text-slate-200 mb-2">Thông tin đầu mối liên hệ về các vấn đề liên quan đến dữ liệu cá nhân của Đơn vị tuyển dụng:</p>
                <p>Các thông tin liên hệ (bao gồm nhưng không giới hạn ở các thông tin: Người nhận, Địa chỉ, Điện thoại, Email) sẽ được xác định theo thông tin định danh và thông tin liên hệ mà Đơn vị tuyển dụng đã đăng ký, cập nhật và quản lý trên tài khoản hệ thống (Tài khoản Nhà tuyển dụng) của MockAI tại từng thời điểm.</p>
              </div>
            </li>
            <li className="flex gap-3">
              <span className="font-medium shrink-0">8.2.</span>
              <span>Mọi tranh chấp pháp lý trước hết sẽ được các Bên giải quyết thông qua thương lượng, hòa giải trên tinh thần hợp tác. Trong trường hợp không đạt được sự thống nhất trong vòng ba mươi (30) ngày kể từ ngày phát sinh tranh chấp, mỗi Bên có quyền đưa vụ việc ra giải quyết tại Tòa án nhân dân có thẩm quyền tại Việt Nam.</span>
            </li>
          </ul>

          <h3 className="text-lg font-bold text-slate-900 dark:text-white mt-8 mb-4">ĐIỀU 9. HIỆU LỰC</h3>
          <ul className="space-y-3 mb-8 list-none pl-0">
            <li className="flex gap-3">
              <span className="font-medium shrink-0">9.1.</span>
              <span>Đơn vị tuyển dụng hiểu và đồng ý rằng Thỏa Thuận này được thiết lập và giao kết dưới hình thức hợp đồng điện tử. Giá trị pháp lý của Thỏa Thuận không thể bị phủ nhận chỉ vì lý do được thể hiện dưới dạng thông điệp dữ liệu theo quy định của Pháp luật về Giao dịch điện tử hiện hành. Bằng việc nhấn chọn ô (checkbox) hoặc nút biểu thị sự đồng ý trên hệ thống, Đơn vị tuyển dụng xác nhận đã đọc, hiểu rõ và hoàn toàn đồng ý với toàn bộ các điều khoản của Thỏa Thuận này. Trường hợp vi phạm bất kỳ quy định nào tại Thỏa Thuận này, Đơn vị tuyển dụng cam kết chịu hoàn toàn trách nhiệm độc lập và bồi thường toàn bộ thiệt hại phát sinh (nếu có) cho MockAI.</span>
            </li>
            <li className="flex gap-3">
              <span className="font-medium shrink-0">9.2.</span>
              <span>Cá nhân thực hiện thao tác trên hệ thống cam kết và bảo đảm rằng mình có đầy đủ năng lực hành vi dân sự, có đủ thẩm quyền đại diện hợp pháp cho Đơn vị tuyển dụng và đã hoàn tất mọi thủ tục phê duyệt nội bộ cần thiết theo quy định pháp luật cũng như quy chế của Đơn vị tuyển dụng.</span>
            </li>
            <li className="flex gap-3">
              <span className="font-medium shrink-0">9.3.</span>
              <span><span className="font-bold">Điều khoản ưu tiên áp dụng:</span> Trường hợp Đơn vị tuyển dụng là khách hàng có ký kết Thỏa thuận xử lý dữ liệu cá nhân bằng văn bản (ký giấy hoặc ký số) với MockAI. Nếu có bất kỳ sự mâu thuẫn hoặc khác biệt nào giữa Thỏa thuận điện tử này và Thỏa thuận bằng văn bản (ký giấy/ký số) đã giao kết, các quy định tại Thỏa thuận bằng văn bản sẽ được ưu tiên áp dụng.</span>
            </li>
            <li className="flex gap-3">
              <span className="font-medium shrink-0">9.4.</span>
              <span>Trường hợp bất kỳ điều khoản nào của Thoả Thuận này bị Toà án hoặc cơ quan có thẩm quyền tuyên bố là vô hiệu, bất hợp pháp hoặc không thể thi hành, thì điều khoản đó (hoặc phần bị ảnh hưởng) sẽ không còn hiệu lực trong phạm vi bị tuyên vô hiệu, mà không làm ảnh hưởng đến hiệu lực và khả năng thi hành của các điều khoản còn lại của Thoả Thuận.</span>
            </li>
            <li className="flex gap-3">
              <span className="font-medium shrink-0">9.5.</span>
              <span>Thỏa thuận này có hiệu lực kể từ thời điểm Đơn vị tuyển dụng xác nhận đồng ý trên hệ thống hay hệ thống ghi nhận thao tác xác nhận đồng ý của Đơn vị tuyển dụng và tiếp tục có hiệu lực trong suốt thời gian Đơn vị tuyển dụng sử dụng dịch vụ của MockAI bao gồm cả khoảng thời gian sau khi Hợp đồng chấm dứt hoặc khi Đơn vị tuyển dụng ngừng sử dụng dịch vụ trả phí (Nếu có) mà Đơn vị tuyển dụng vẫn được MockAI cho phép truy cập tài khoản Nhà tuyển dụng trên nền tảng Workplace để xử lý dữ liệu được tạo lập trước đó.</span>
            </li>
            <li className="flex gap-3">
              <span className="font-medium shrink-0">9.6.</span>
              <span>Thỏa thuận này sẽ chấm dứt khi Đơn vị tuyển dụng không còn quyền truy cập tài khoản Nhà tuyển dụng và dữ liệu cá nhân thuộc phạm vi Thỏa thuận đã được xóa, ẩn danh hóa, hoàn trả cho Đơn vị tuyển dụng hoặc được MockAI tiếp tục lưu trữ trong phạm vi cần thiết nhằm tuân thủ quy định pháp luật, giải quyết tranh chấp, khiếu nại hoặc thực hiện các nghĩa vụ pháp lý hợp pháp khác.</span>
            </li>
          </ul>

        </div>
      </div>
    </div>
  );
}
