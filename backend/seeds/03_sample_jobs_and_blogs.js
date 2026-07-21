/**
 * Seed: Enrichment seed for Jobs, Job Requirements, Blogs, Comments, and Reactions.
 * Provides 5 jobs per company (25 total jobs) with detailed descriptions,
 * 15 community blogs, and active user interactions (comments & reactions).
 * 
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> } 
 */
export async function seed(knex) {
  // Clear dependent tables first in correct order
  await knex('blog_reactions').del();
  await knex('blog_comments').del();
  await knex('blogs').del();
  await knex('job_requirements').del();
  await knex('applications').del();
  await knex('interviews').del();
  await knex('cvs').del();
  await knex('jobs').del();
  await knex('job_types').del();
  await knex('locations').del();
  await knex('categories').del();

  // 1. Seed Locations
  await knex('locations').insert([
    { id: 1, name: 'Hà Nội', slug: 'ha-noi', region: 'Miền Bắc', is_active: true, created_at: new Date(), updated_at: new Date() },
    { id: 2, name: 'TP. Hồ Chí Minh', slug: 'tp-ho-chi-minh', region: 'Miền Nam', is_active: true, created_at: new Date(), updated_at: new Date() },
    { id: 3, name: 'Đà Nẵng', slug: 'da-nang', region: 'Miền Trung', is_active: true, created_at: new Date(), updated_at: new Date() },
    { id: 4, name: 'Remote', slug: 'remote', region: 'Toàn Quốc', is_active: true, created_at: new Date(), updated_at: new Date() }
  ]);

  // 2. Seed Job Types
  await knex('job_types').insert([
    { id: 1, name: 'Full-time', slug: 'full-time', is_active: true, created_at: new Date(), updated_at: new Date() },
    { id: 2, name: 'Part-time', slug: 'part-time', is_active: true, created_at: new Date(), updated_at: new Date() },
    { id: 3, name: 'Remote', slug: 'remote', is_active: true, created_at: new Date(), updated_at: new Date() },
    { id: 4, name: 'Internship', slug: 'internship', is_active: true, created_at: new Date(), updated_at: new Date() }
  ]);

  // 3. Seed Categories
  await knex('categories').insert([
    { id: 1, name: 'Công nghệ thông tin', slug: 'cong-nghe-thong-tin', is_active: true, created_at: new Date(), updated_at: new Date() },
    { id: 2, name: 'Đa ngành', slug: 'da-nganh', is_active: true, created_at: new Date(), updated_at: new Date() },
    { id: 3, name: 'Năng lượng sạch', slug: 'nang-luong-sach', is_active: true, created_at: new Date(), updated_at: new Date() },
    { id: 4, name: 'Tài chính / Ngân hàng', slug: 'tai-chinh-ngan-hang', is_active: true, created_at: new Date(), updated_at: new Date() },
    { id: 5, name: 'Giáo dục / EdTech', slug: 'giao-duc-edtech', is_active: true, created_at: new Date(), updated_at: new Date() }
  ]);

  // 4. Seed Jobs (5 jobs per company x 5 companies = 25 jobs)
  const now = new Date();
  const futureDeadline = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

  const jobsData = [
    // --- COMPANY 1: TechCorp Vietnam (company_id: 1, hr_id: 3) ---
    {
      id: 1,
      hr_id: 3,
      company_id: 1,
      category_id: 1,
      location_id: 1,
      job_type_id: 1,
      title: 'Senior React Developer',
      description: 'Phát triển và duy trì các ứng dụng web chất lượng cao sử dụng React 19, Next.js và Tailwind CSS v4. Tối ưu hiệu năng rendering, quản lý state với Zustand và đồng bộ dữ liệu với TanStack Query. Làm việc trực tiếp với đội ngũ AI để tích hợp giao diện phỏng vấn ảo 3D.',
      experience_level: 'SENIOR',
      salary_min: 35000000,
      salary_max: 45000000,
      salary_currency: 'VND',
      is_salary_visible: true,
      vacancy_count: 3,
      deadline: futureDeadline,
      approval_status: 'APPROVED',
      approved_by: 1,
      approved_at: now,
      view_count: 320,
      status: 'OPEN',
      created_at: now,
      updated_at: now
    },
    {
      id: 2,
      hr_id: 3,
      company_id: 1,
      category_id: 1,
      location_id: 1,
      job_type_id: 1,
      title: 'AI/ML Research Engineer',
      description: 'Nghiên cứu, huấn luyện và tối ưu hóa các mô hình LLM, RAG và Speech-to-Text / Text-to-Speech thế hệ mới. Xây dựng AI agents thực hiện chấm điểm CV tự động và tạo câu hỏi phỏng vấn theo ngữ cảnh JD.',
      experience_level: 'SENIOR',
      salary_min: 40000000,
      salary_max: 60000000,
      salary_currency: 'VND',
      is_salary_visible: true,
      vacancy_count: 2,
      deadline: futureDeadline,
      approval_status: 'APPROVED',
      approved_by: 1,
      approved_at: now,
      view_count: 450,
      status: 'OPEN',
      created_at: now,
      updated_at: now
    },
    {
      id: 3,
      hr_id: 3,
      company_id: 1,
      category_id: 1,
      location_id: 4,
      job_type_id: 3,
      title: 'Cloud & DevOps Infrastructure Lead',
      description: 'Quản lý hạ tầng đám mây đám mây đa hạ tầng (AWS/GCP), thiết lập tự động hóa CI/CD pipeline cho Monorepo pnpm. Giám sát hệ thống thời gian thực với Prometheus, Grafana và Docker/Kubernetes container orchestration.',
      experience_level: 'LEAD',
      salary_min: 38000000,
      salary_max: 50000000,
      salary_currency: 'VND',
      is_salary_visible: true,
      vacancy_count: 1,
      deadline: futureDeadline,
      approval_status: 'APPROVED',
      approved_by: 1,
      approved_at: now,
      view_count: 210,
      status: 'OPEN',
      created_at: now,
      updated_at: now
    },
    {
      id: 4,
      hr_id: 3,
      company_id: 1,
      category_id: 1,
      location_id: 2,
      job_type_id: 1,
      title: 'Fullstack Node.js & React Developer',
      description: 'Xây dựng dịch vụ RESTful API hiệu năng cao với Express.js, Knex.js và PostgreSQL. Đồng thời làm việc với frontend React 19 để triển khai các tính năng tuyển dụng, thanh toán ví credit và Socket.io realtime chat.',
      experience_level: 'MID',
      salary_min: 25000000,
      salary_max: 35000000,
      salary_currency: 'VND',
      is_salary_visible: true,
      vacancy_count: 4,
      deadline: futureDeadline,
      approval_status: 'APPROVED',
      approved_by: 1,
      approved_at: now,
      view_count: 180,
      status: 'OPEN',
      created_at: now,
      updated_at: now
    },
    {
      id: 5,
      hr_id: 3,
      company_id: 1,
      category_id: 1,
      location_id: 1,
      job_type_id: 1,
      title: 'UI/UX Designer & Product Specialist',
      description: 'Nghiên cứu trải nghiệm người dùng, thiết kế wireframe, prototype tương tác cao trên Figma. Xây dựng Design System đồng nhất theo phong cách Ocean Blue, áp dụng Glassmorphism và micro-animations nâng cao.',
      experience_level: 'MID',
      salary_min: 20000000,
      salary_max: 30000000,
      salary_currency: 'VND',
      is_salary_visible: true,
      vacancy_count: 2,
      deadline: futureDeadline,
      approval_status: 'APPROVED',
      approved_by: 1,
      approved_at: now,
      view_count: 195,
      status: 'OPEN',
      created_at: now,
      updated_at: now
    },

    // --- COMPANY 2: VinaGroup (company_id: 2, hr_id: 4) ---
    {
      id: 6,
      hr_id: 4,
      company_id: 2,
      category_id: 2,
      location_id: 2,
      job_type_id: 1,
      title: 'Chuyên viên Marketing Online & Branding',
      description: 'Lên kế hoạch và thực thi chiến dịch truyền thông đa kênh (Facebook, TikTok, Google Ads, SEO). Quản lý thương hiệu tập đoàn, sản xuất nội dung bài viết và theo dõi đo lường chỉ số ROI chiến dịch.',
      experience_level: 'MID',
      salary_min: 18000000,
      salary_max: 25000000,
      salary_currency: 'VND',
      is_salary_visible: true,
      vacancy_count: 5,
      deadline: futureDeadline,
      approval_status: 'APPROVED',
      approved_by: 1,
      approved_at: now,
      view_count: 275,
      status: 'OPEN',
      created_at: now,
      updated_at: now
    },
    {
      id: 7,
      hr_id: 4,
      company_id: 2,
      category_id: 2,
      location_id: 2,
      job_type_id: 1,
      title: 'Quản lý Chuỗi Cung ứng & Logistics',
      description: 'Điều phối vận hành chuỗi cung ứng toàn quốc, quản lý quy trình kho vận, làm việc với đối tác vận chuyển lớn và tối ưu hóa chi phí hàng hóa luân chuyển.',
      experience_level: 'SENIOR',
      salary_min: 30000000,
      salary_max: 42000000,
      salary_currency: 'VND',
      is_salary_visible: true,
      vacancy_count: 2,
      deadline: futureDeadline,
      approval_status: 'APPROVED',
      approved_by: 1,
      approved_at: now,
      view_count: 140,
      status: 'OPEN',
      created_at: now,
      updated_at: now
    },
    {
      id: 8,
      hr_id: 4,
      company_id: 2,
      category_id: 2,
      location_id: 1,
      job_type_id: 1,
      title: 'Trưởng phòng Phân tích Dữ liệu Kinh doanh (Data Analyst Lead)',
      description: 'Phân tích dữ liệu doanh thu, xu hướng thị trường và hành vi người tiêu dùng. Xây dựng hệ thống Dashboard báo cáo trực quan với PowerBI/Tableau hỗ trợ Ban Giám đốc ra quyết định chiến lược.',
      experience_level: 'LEAD',
      salary_min: 35000000,
      salary_max: 50000000,
      salary_currency: 'VND',
      is_salary_visible: true,
      vacancy_count: 1,
      deadline: futureDeadline,
      approval_status: 'APPROVED',
      approved_by: 1,
      approved_at: now,
      view_count: 310,
      status: 'OPEN',
      created_at: now,
      updated_at: now
    },
    {
      id: 9,
      hr_id: 4,
      company_id: 2,
      category_id: 2,
      location_id: 2,
      job_type_id: 1,
      title: 'Chuyên viên Tuyển dụng Cao cấp (Senior HR Recruiter)',
      description: 'Chủ động tìm kiếm, săn đón nhân tài (Headhunting) cho các vị trí nhân sự cấp cao và khối công nghệ. Phỏng vấn, đánh giá năng lực ứng viên và thương lượng gói đãi ngộ hấp dẫn.',
      experience_level: 'SENIOR',
      salary_min: 20000000,
      salary_max: 28000000,
      salary_currency: 'VND',
      is_salary_visible: true,
      vacancy_count: 3,
      deadline: futureDeadline,
      approval_status: 'APPROVED',
      approved_by: 1,
      approved_at: now,
      view_count: 220,
      status: 'OPEN',
      created_at: now,
      updated_at: now
    },
    {
      id: 10,
      hr_id: 4,
      company_id: 2,
      category_id: 2,
      location_id: 3,
      job_type_id: 1,
      title: 'Giám sát Kỹ thuật & Dự án Bất động sản',
      description: 'Giám sát tiến độ, tiêu chuẩn kỹ thuật thi công tại các dự án bất động sản nghỉ dưỡng và thương mại. Kiểm soát chất lượng vật tư và tuân thủ các quy định an toàn công trình.',
      experience_level: 'MID',
      salary_min: 25000000,
      salary_max: 38000000,
      salary_currency: 'VND',
      is_salary_visible: true,
      vacancy_count: 2,
      deadline: futureDeadline,
      approval_status: 'APPROVED',
      approved_by: 1,
      approved_at: now,
      view_count: 165,
      status: 'OPEN',
      created_at: now,
      updated_at: now
    },

    // --- COMPANY 3: GreenEnergy (company_id: 3, hr_id: 5) ---
    {
      id: 11,
      hr_id: 5,
      company_id: 3,
      category_id: 3,
      location_id: 3,
      job_type_id: 1,
      title: 'Kỹ sư Năng lượng Mặt trời & Điện gió',
      description: 'Khảo sát địa hình, thiết kế bản vẽ kỹ thuật và triển khai lắp đặt hệ thống điện mặt trời áp mái công nghiệp cùng các trang trại điện gió khu vực Duyên hải Miền Trung.',
      experience_level: 'MID',
      salary_min: 25000000,
      salary_max: 35000000,
      salary_currency: 'VND',
      is_salary_visible: true,
      vacancy_count: 3,
      deadline: futureDeadline,
      approval_status: 'APPROVED',
      approved_by: 1,
      approved_at: now,
      view_count: 290,
      status: 'OPEN',
      created_at: now,
      updated_at: now
    },
    {
      id: 12,
      hr_id: 5,
      company_id: 3,
      category_id: 3,
      location_id: 3,
      job_type_id: 1,
      title: 'Kỹ sư An toàn Môi trường (HSE Engineer)',
      description: 'Xây dựng và thực thi các quy trình bảo hộ lao động, đánh giá tác động môi trường (ĐTM) và giám sát việc tuân thủ quy định môi trường tại toàn bộ nhà máy năng lượng sạch.',
      experience_level: 'JUNIOR',
      salary_min: 18000000,
      salary_max: 26000000,
      salary_currency: 'VND',
      is_salary_visible: true,
      vacancy_count: 2,
      deadline: futureDeadline,
      approval_status: 'APPROVED',
      approved_by: 1,
      approved_at: now,
      view_count: 135,
      status: 'OPEN',
      created_at: now,
      updated_at: now
    },
    {
      id: 13,
      hr_id: 5,
      company_id: 3,
      category_id: 3,
      location_id: 1,
      job_type_id: 1,
      title: 'Chuyên viên R&D Năng lượng Tái tạo',
      description: 'Nghiên cứu áp dụng công nghệ lưu trữ năng lượng thế hệ mới (Lithium-ion / Green Hydrogen), tối ưu hiệu suất hòa lưới điện thông minh và hợp tác nghiên cứu cùng các viện quốc tế.',
      experience_level: 'SENIOR',
      salary_min: 30000000,
      salary_max: 45000000,
      salary_currency: 'VND',
      is_salary_visible: true,
      vacancy_count: 1,
      deadline: futureDeadline,
      approval_status: 'APPROVED',
      approved_by: 1,
      approved_at: now,
      view_count: 175,
      status: 'OPEN',
      created_at: now,
      updated_at: now
    },
    {
      id: 14,
      hr_id: 5,
      company_id: 3,
      category_id: 3,
      location_id: 2,
      job_type_id: 1,
      title: 'Quản lý Dự án Công trình Năng lượng (Project Manager)',
      description: 'Chịu trách nhiệm tổng thể về tiến độ, chất lượng và ngân sách các dự án điện mặt trời / điện gió quy mô lớn. Làm việc với chính quyền địa phương và các nhà thầu EPC.',
      experience_level: 'LEAD',
      salary_min: 40000000,
      salary_max: 55000000,
      salary_currency: 'VND',
      is_salary_visible: true,
      vacancy_count: 1,
      deadline: futureDeadline,
      approval_status: 'APPROVED',
      approved_by: 1,
      approved_at: now,
      view_count: 240,
      status: 'OPEN',
      created_at: now,
      updated_at: now
    },
    {
      id: 15,
      hr_id: 5,
      company_id: 3,
      category_id: 3,
      location_id: 4,
      job_type_id: 3,
      title: 'Chuyên viên Phát triển Thị trường Năng lượng Xanh',
      description: 'Tìm kiếm khách hàng doanh nghiệp, các khu công nghiệp có nhu cầu ký hợp đồng mua bán điện trực tiếp (DPPA) và chuyển đổi sang mô hình năng lượng xanh đạt chứng chỉ ESG.',
      experience_level: 'MID',
      salary_min: 22000000,
      salary_max: 32000000,
      salary_currency: 'VND',
      is_salary_visible: true,
      vacancy_count: 3,
      deadline: futureDeadline,
      approval_status: 'APPROVED',
      approved_by: 1,
      approved_at: now,
      view_count: 160,
      status: 'OPEN',
      created_at: now,
      updated_at: now
    },

    // --- COMPANY 4: FastFinance (company_id: 4, hr_id: 6) ---
    {
      id: 16,
      hr_id: 6,
      company_id: 4,
      category_id: 4,
      location_id: 4,
      job_type_id: 3,
      title: 'Node.js Backend Developer (Fintech)',
      description: 'Phát triển hệ thống API giao dịch tài chính tốc độ cao, xử lý thanh toán thời gian thực với Node.js, Express, PostgreSQL và Redis. Đảm bảo tính nhất quán dữ liệu giao dịch tài chính.',
      experience_level: 'MID',
      salary_min: 25000000,
      salary_max: 38000000,
      salary_currency: 'VND',
      is_salary_visible: true,
      vacancy_count: 3,
      deadline: futureDeadline,
      approval_status: 'APPROVED',
      approved_by: 1,
      approved_at: now,
      view_count: 260,
      status: 'OPEN',
      created_at: now,
      updated_at: now
    },
    {
      id: 17,
      hr_id: 6,
      company_id: 4,
      category_id: 4,
      location_id: 1,
      job_type_id: 1,
      title: 'Chuyên viên Quản trị Rủi ro & Chống gian lận (Risk & Fraud Analyst)',
      description: 'Phân tích các mẫu hình giao dịch bất thường, xây dựng bộ quy tắc cảnh báo gian lận và đánh giá điểm rủi ro tín dụng cá nhân ứng dụng Machine Learning.',
      experience_level: 'MID',
      salary_min: 22000000,
      salary_max: 32000000,
      salary_currency: 'VND',
      is_salary_visible: true,
      vacancy_count: 2,
      deadline: futureDeadline,
      approval_status: 'APPROVED',
      approved_by: 1,
      approved_at: now,
      view_count: 215,
      status: 'OPEN',
      created_at: now,
      updated_at: now
    },
    {
      id: 18,
      hr_id: 6,
      company_id: 4,
      category_id: 4,
      location_id: 2,
      job_type_id: 1,
      title: 'Senior Java Spring Boot Engineer (Fintech Core)',
      description: 'Thiết kế và duy trì kiến trúc Microservices ngân hàng số nền tảng Java Spring Boot, Kafka messaging queue và cơ sở dữ liệu phân tán chịu tải cao.',
      experience_level: 'SENIOR',
      salary_min: 35000000,
      salary_max: 52000000,
      salary_currency: 'VND',
      is_salary_visible: true,
      vacancy_count: 2,
      deadline: futureDeadline,
      approval_status: 'APPROVED',
      approved_by: 1,
      approved_at: now,
      view_count: 340,
      status: 'OPEN',
      created_at: now,
      updated_at: now
    },
    {
      id: 19,
      hr_id: 6,
      company_id: 4,
      category_id: 4,
      location_id: 1,
      job_type_id: 1,
      title: 'Chuyên viên Phân tích Đầu tư & Tài chính Doanh nghiệp',
      description: 'Thẩm định hồ sơ tài chính các phương án kinh doanh, lập mô hình dự phóng dòng tiền và tư vấn chiến lược tối ưu hóa cấu trúc vốn cho doanh nghiệp.',
      experience_level: 'SENIOR',
      salary_min: 28000000,
      salary_max: 40000000,
      salary_currency: 'VND',
      is_salary_visible: true,
      vacancy_count: 1,
      deadline: futureDeadline,
      approval_status: 'APPROVED',
      approved_by: 1,
      approved_at: now,
      view_count: 190,
      status: 'OPEN',
      created_at: now,
      updated_at: now
    },
    {
      id: 20,
      hr_id: 6,
      company_id: 4,
      category_id: 4,
      location_id: 2,
      job_type_id: 1,
      title: 'Kỹ sư Security & Compliance Ngân hàng',
      description: 'Thực hiện pentest hệ thống, mã hóa dữ liệu nhạy cảm, xây dựng chính sách an toàn thông tin theo tiêu chuẩn quốc tế ISO 27001 và PCI-DSS.',
      experience_level: 'SENIOR',
      salary_min: 32000000,
      salary_max: 48000000,
      salary_currency: 'VND',
      is_salary_visible: true,
      vacancy_count: 2,
      deadline: futureDeadline,
      approval_status: 'APPROVED',
      approved_by: 1,
      approved_at: now,
      view_count: 280,
      status: 'OPEN',
      created_at: now,
      updated_at: now
    },

    // --- COMPANY 5: SmartEdu (company_id: 5, hr_id: 7) ---
    {
      id: 21,
      hr_id: 7,
      company_id: 5,
      category_id: 5,
      location_id: 2,
      job_type_id: 1,
      title: 'Project Manager (EdTech Platform)',
      description: 'Điều phối tiến độ và lộ trình phát triển sản phẩm công nghệ giáo dục. Làm việc trực tiếp với đội ngũ AI phỏng vấn giọng nói 3D và ngân hàng câu hỏi định hướng sự nghiệp.',
      experience_level: 'LEAD',
      salary_min: 30000000,
      salary_max: 42000000,
      salary_currency: 'VND',
      is_salary_visible: true,
      vacancy_count: 1,
      deadline: futureDeadline,
      approval_status: 'APPROVED',
      approved_by: 1,
      approved_at: now,
      view_count: 205,
      status: 'OPEN',
      created_at: now,
      updated_at: now
    },
    {
      id: 22,
      hr_id: 7,
      company_id: 5,
      category_id: 5,
      location_id: 1,
      job_type_id: 1,
      title: 'Chuyên viên Thẩm định & Thiết kế Nội dung Học',
      description: 'Xây dựng khung chương trình bài giảng lập trình, kỹ năng mềm phỏng vấn và phát triển nghề nghiệp. Đảm bảo chất lượng sư phạm và tính ứng dụng cao.',
      experience_level: 'JUNIOR',
      salary_min: 16000000,
      salary_max: 24000000,
      salary_currency: 'VND',
      is_salary_visible: true,
      vacancy_count: 3,
      deadline: futureDeadline,
      approval_status: 'APPROVED',
      approved_by: 1,
      approved_at: now,
      view_count: 150,
      status: 'OPEN',
      created_at: now,
      updated_at: now
    },
    {
      id: 23,
      hr_id: 7,
      company_id: 5,
      category_id: 5,
      location_id: 2,
      job_type_id: 1,
      title: 'Flutter Mobile Developer (Android & iOS)',
      description: 'Lập trình ứng dụng di động EdTech bằng Flutter/Dart. Tích hợp tính năng gọi video phỏng vấn trực tuyến, thông báo nhắc nhở lịch học và đồng bộ bài học offline.',
      experience_level: 'MID',
      salary_min: 22000000,
      salary_max: 34000000,
      salary_currency: 'VND',
      is_salary_visible: true,
      vacancy_count: 2,
      deadline: futureDeadline,
      approval_status: 'APPROVED',
      approved_by: 1,
      approved_at: now,
      view_count: 230,
      status: 'OPEN',
      created_at: now,
      updated_at: now
    },
    {
      id: 24,
      hr_id: 7,
      company_id: 5,
      category_id: 5,
      location_id: 1,
      job_type_id: 1,
      title: 'Chuyên viên Tư vấn Tuyển sinh & Hướng nghiệp',
      description: 'Tư vấn lộ trình học tập phát triển kỹ năng phù hợp cho sinh viên và ứng viên mới ra trường, hỗ trợ định hướng nghề nghiệp và kết nối với các doanh nghiệp đối tác.',
      experience_level: 'JUNIOR',
      salary_min: 14000000,
      salary_max: 22000000,
      salary_currency: 'VND',
      is_salary_visible: true,
      vacancy_count: 4,
      deadline: futureDeadline,
      approval_status: 'APPROVED',
      approved_by: 1,
      approved_at: now,
      view_count: 170,
      status: 'OPEN',
      created_at: now,
      updated_at: now
    },
    {
      id: 25,
      hr_id: 7,
      company_id: 5,
      category_id: 5,
      location_id: 4,
      job_type_id: 3,
      title: 'AI Prompt Engineer & Content Specialist',
      description: 'Thiết kế kịch bản và tối ưu câu lệnh (Prompt engineering) cho AI Interviewer. Kiểm thử phản ứng của AI trong các tình huống phỏng vấn áp lực và cải thiện độ chính xác.',
      experience_level: 'MID',
      salary_min: 20000000,
      salary_max: 30000000,
      salary_currency: 'VND',
      is_salary_visible: true,
      vacancy_count: 2,
      deadline: futureDeadline,
      approval_status: 'APPROVED',
      approved_by: 1,
      approved_at: now,
      view_count: 310,
      status: 'OPEN',
      created_at: now,
      updated_at: now
    }
  ];

  await knex('jobs').insert(jobsData);

  // 5. Seed Job Requirements
  const requirementsData = [
    // Job 1
    { job_id: 1, requirement_text: 'Có từ 3 năm kinh nghiệm lập trình ReactJS / Next.js', is_mandatory: true, created_at: now, updated_at: now },
    { job_id: 1, requirement_text: 'Thành thạo Tailwind CSS, Zustand, TanStack Query', is_mandatory: true, created_at: now, updated_at: now },
    { job_id: 1, requirement_text: 'Hiểu biết về Three.js / WebGL là một lợi thế lớn', is_mandatory: false, created_at: now, updated_at: now },

    // Job 2
    { job_id: 2, requirement_text: 'Thành thạo Python, PyTorch/TensorFlow và kinh nghiệm Fine-tune LLM', is_mandatory: true, created_at: now, updated_at: now },
    { job_id: 2, requirement_text: 'Hiểu sâu về kiến trúc Transformer, RAG và Vector DB (Pinecone/Qdrant)', is_mandatory: true, created_at: now, updated_at: now },

    // Job 3
    { job_id: 3, requirement_text: 'Có ít nhất 4 năm kinh nghiệm làm DevOps/SRE trên AWS hoặc GCP', is_mandatory: true, created_at: now, updated_at: now },
    { job_id: 3, requirement_text: 'Thành thạo Docker, Kubernetes, Terraform và CI/CD Pipelines', is_mandatory: true, created_at: now, updated_at: now },

    // Job 4
    { job_id: 4, requirement_text: 'Tối thiểu 2 năm kinh nghiệm Node.js (Express) và ReactJS', is_mandatory: true, created_at: now, updated_at: now },
    { job_id: 4, requirement_text: 'Thành thạo SQL với PostgreSQL và Knex.js ORM', is_mandatory: true, created_at: now, updated_at: now },

    // Job 5
    { job_id: 5, requirement_text: 'Sử dụng thành thạo Figma, Adobe XD và có Portfolio sản phẩm thực tế', is_mandatory: true, created_at: now, updated_at: now },
    { job_id: 5, requirement_text: 'Am hiểu Design System, Accessibility (a11y) và Micro-interactions', is_mandatory: false, created_at: now, updated_at: now },

    // Job 6
    { job_id: 6, requirement_text: 'Kinh nghiệm 2+ năm chạy các chiến dịch Digital Marketing thành công', is_mandatory: true, created_at: now, updated_at: now },
    { job_id: 6, requirement_text: 'Thành thạo công cụ đo lường Google Analytics, Facebook Pixel, TikTok Ads', is_mandatory: true, created_at: now, updated_at: now },

    // Job 7
    { job_id: 7, requirement_text: 'Trên 4 năm kinh nghiệm quản lý kho vận và đối tác vận chuyển', is_mandatory: true, created_at: now, updated_at: now },
    { job_id: 7, requirement_text: 'Kỹ năng giải quyết vấn đề và thương lượng hợp đồng xuất sắc', is_mandatory: true, created_at: now, updated_at: now },

    // Job 8
    { job_id: 8, requirement_text: 'Tốt nghiệp chuyên ngành CNTT, Thống kê hoặc Kinh tế định lượng', is_mandatory: true, created_at: now, updated_at: now },
    { job_id: 8, requirement_text: 'Thành thạo SQL, Python (Pandas/NumPy) và PowerBI / Tableau', is_mandatory: true, created_at: now, updated_at: now },

    // Job 9
    { job_id: 9, requirement_text: 'Có mạng lưới ứng viên IT & Cấp cao rộng lớn', is_mandatory: true, created_at: now, updated_at: now },
    { job_id: 9, requirement_text: 'Kỹ năng giao tiếp, phỏng vấn và chốt offer xuất sắc', is_mandatory: true, created_at: now, updated_at: now },

    // Job 10
    { job_id: 10, requirement_text: 'Tốt nghiệp Đại học chuyên ngành Xây dựng / Kỹ thuật', is_mandatory: true, created_at: now, updated_at: now },
    { job_id: 10, requirement_text: 'Có chứng chỉ hành nghề giám sát công trình cấp I hoặc cấp II', is_mandatory: true, created_at: now, updated_at: now },

    // Job 11
    { job_id: 11, requirement_text: 'Tốt nghiệp ngành Điện, Năng lượng tái tạo hoặc Tự động hóa', is_mandatory: true, created_at: now, updated_at: now },
    { job_id: 11, requirement_text: 'Thành thạo phần mềm thiết kế PVSyst, AutoCAD và AutoCAD 3D', is_mandatory: true, created_at: now, updated_at: now },

    // Job 12
    { job_id: 12, requirement_text: 'Có chứng chỉ an toàn lao động nhóm 2/3 theo quy định nhà nước', is_mandatory: true, created_at: now, updated_at: now },
    { job_id: 12, requirement_text: 'Có kinh nghiệm đánh giá rủi ro an toàn tại công trường', is_mandatory: true, created_at: now, updated_at: now },

    // Job 13
    { job_id: 13, requirement_text: 'Trình độ Thạc sĩ / Tiến sĩ chuyên ngành Năng lượng hoặc Hóa kỹ thuật', is_mandatory: true, created_at: now, updated_at: now },
    { job_id: 13, requirement_text: 'Có công trình nghiên cứu về Pin / Hydrogen được công bố', is_mandatory: false, created_at: now, updated_at: now },

    // Job 14
    { job_id: 14, requirement_text: 'Tối thiểu 5 năm làm Project Manager trong ngành Năng lượng', is_mandatory: true, created_at: now, updated_at: now },
    { job_id: 14, requirement_text: 'Có chứng chỉ PMP và kinh nghiệm làm việc với các nhà thầu EPC', is_mandatory: true, created_at: now, updated_at: now },

    // Job 15
    { job_id: 15, requirement_text: 'Có kinh nghiệm B2B Sales trong mảng công nghiệp hoặc năng lượng', is_mandatory: true, created_at: now, updated_at: now },
    { job_id: 15, requirement_text: 'Tiếng Anh thương mại lưu khoát', is_mandatory: true, created_at: now, updated_at: now },

    // Job 16
    { job_id: 16, requirement_text: '3+ năm kinh nghiệm Node.js, Express, Microservices', is_mandatory: true, created_at: now, updated_at: now },
    { job_id: 16, requirement_text: 'Hiểu biết sâu về ACID transactions, Redis caching và Message Queue (RabbitMQ/Kafka)', is_mandatory: true, created_at: now, updated_at: now },

    // Job 17
    { job_id: 17, requirement_text: 'Kinh nghiệm phân tích dữ liệu giao dịch tài chính chống rửa tiền (AML)', is_mandatory: true, created_at: now, updated_at: now },
    { job_id: 17, requirement_text: 'Sử dụng thành thạo SQL và Python phân tích hành vi gian lận', is_mandatory: true, created_at: now, updated_at: now },

    // Job 18
    { job_id: 18, requirement_text: 'Trên 4 năm làm việc với Java Core, Spring Boot, Spring Cloud', is_mandatory: true, created_at: now, updated_at: now },
    { job_id: 18, requirement_text: 'Kinh nghiệm tích hợp các cổng thanh toán (VNPay, Momo, Visa/Master)', is_mandatory: true, created_at: now, updated_at: now },

    // Job 19
    { job_id: 19, requirement_text: 'Có chứng chỉ CFA hoặc CPA là lợi thế cạnh tranh lớn', is_mandatory: false, created_at: now, updated_at: now },
    { job_id: 19, requirement_text: 'Thành thạo lập mô hình tài chính dDcf, LBO, M&A', is_mandatory: true, created_at: now, updated_at: now },

    // Job 20
    { job_id: 20, requirement_text: 'Có một trong các chứng chỉ: CISSP, CEH, CISA, OSCP', is_mandatory: true, created_at: now, updated_at: now },
    { job_id: 20, requirement_text: 'Kinh nghiệm kiểm thử an ninh ứng dụng web và API Fintech', is_mandatory: true, created_at: now, updated_at: now },

    // Job 21
    { job_id: 21, requirement_text: 'Kinh nghiệm 3+ năm làm Product/Project Manager cho các sản phẩm EdTech', is_mandatory: true, created_at: now, updated_at: now },
    { job_id: 21, requirement_text: 'Thành thạo Agile/Scrum, Jira/Confluence', is_mandatory: true, created_at: now, updated_at: now },

    // Job 22
    { job_id: 22, requirement_text: 'Tốt nghiệp các ngành Sư phạm, Ngôn ngữ hoặc Công nghệ', is_mandatory: true, created_at: now, updated_at: now },
    { job_id: 22, requirement_text: 'Kỹ năng viết lách, biên soạn tài liệu học tập mạch lạc', is_mandatory: true, created_at: now, updated_at: now },

    // Job 23
    { job_id: 23, requirement_text: 'Thành thạo Flutter, Dart, BLoC pattern hoặc Provider', is_mandatory: true, created_at: now, updated_at: now },
    { job_id: 23, requirement_text: 'Kinh nghiệm publish ứng dụng lên Google Play và App Store', is_mandatory: true, created_at: now, updated_at: now },

    // Job 24
    { job_id: 24, requirement_text: 'Yêu thích lĩnh vực giáo dục, tư vấn và định hướng con người', is_mandatory: true, created_at: now, updated_at: now },
    { job_id: 24, requirement_text: 'Kỹ năng lắng nghe, thấu hiểu và tư vấn giải pháp hiệu quả', is_mandatory: true, created_at: now, updated_at: now },

    // Job 25
    { job_id: 25, requirement_text: 'Am hiểu cơ chế làm việc của LLMs (OpenAI, Claude, Llama 3)', is_mandatory: true, created_at: now, updated_at: now },
    { job_id: 25, requirement_text: 'Có khả năng viết Prompt tối ưu và thiết kế bộ kịch bản phỏng vấn chuyên sâu', is_mandatory: true, created_at: now, updated_at: now }
  ];

  await knex('job_requirements').insert(requirementsData);

  // 6. Seed Community Blogs (15 detailed blog posts)
  const blogsData = [
    {
      id: 1,
      author_id: 2, // Candidate
      title: 'Bí quyết vàng để viết CV chinh phục mọi nhà tuyển dụng công nghệ',
      slug: 'bi-quyet-vang-de-viet-cv-chinh-phuc-nha-tuyen-dung-1',
      content: `Viết CV là bước đệm đầu tiên cực kỳ quan trọng trong hành trình tìm việc của bạn. Để ấn tượng ngay từ 6 giây đầu tiên:

1. **Định dạng chuẩn ATS**: Sử dụng phông chữ rõ ràng như Inter hoặc Roboto, tránh chèn bảng biểu quá phức tạp khiến công cụ quét tự động bị lỗi.
2. **Liệt kê thành tựu kèm con số**: Thay vì ghi "Phát triển tính năng chat", hãy ghi "Xây dựng tính năng chat thời gian thực hỗ trợ 5.000 người dùng đồng thời, giảm 40% latency".
3. **Từ khóa chuyên môn**: Đưa chính xác các kỹ năng trong JD vào CV như React 19, Tailwind CSS, Zustand, PostgreSQL.

Chúc các bạn sớm nhận được lời mời phỏng vấn!`,
      cover_image_url: 'https://images.unsplash.com/photo-1586281380349-632531db7ed4?w=800',
      category: 'Cẩm nang CV',
      tags: ['cv', 'tips', 'frontend', 'ats'],
      status: 'PUBLISHED',
      approved_by: 1,
      published_at: now,
      view_count: 1240,
      created_at: now,
      updated_at: now
    },
    {
      id: 2,
      author_id: 2,
      title: '10 câu hỏi phỏng vấn hành vi và phương pháp STAR để trả lời',
      slug: '10-cau-hoi-phong-van-hanh-vi-va-phuong-phap-star-2',
      content: `Phỏng vấn hành vi (Behavioral Interview) là cơ hội để bạn chứng minh cách xử lý tình huống thực tế của mình. Hãy áp dụng công thức STAR:

- **S (Situation)**: Bối cảnh dự án hoặc thử thách gặp phải.
- **T (Task)**: Nhiệm vụ cụ thể bạn cần hoàn thành.
- **A (Action)**: Các bước hành động bạn đã thực hiện.
- **R (Result)**: Kết quả đạt được (kèm số liệu thực tế).

Ví dụ: Khi được hỏi về xung đột ý kiến trong team, hãy bình tĩnh giải thích cách bạn lắng nghe phản biện và dùng dữ liệu benchmark để đi đến thống nhất.`,
      cover_image_url: 'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=800',
      category: 'Kinh nghiệm phỏng vấn',
      tags: ['phongvan', 'star', 'behavioral', 'interview'],
      status: 'PUBLISHED',
      approved_by: 1,
      published_at: now,
      view_count: 3105,
      created_at: now,
      updated_at: now
    },
    {
      id: 3,
      author_id: 3, // HR TechCorp
      title: 'Kinh nghiệm phỏng vấn trực tiếp với AI 3D Avatar trên MockAI',
      slug: 'kinh-nghiem-phong-van-truc-tiep-voi-ai-3d-avatar-3',
      content: `Luyện tập phỏng vấn với AI ảo giúp phản xạ của bạn trở nên tự nhiên hơn gấp 3 lần trước khi bước vào buổi gặp gỡ chính thức với HR.

Một số mẹo quan trọng:
- Đeo tai nghe có micro rõ ràng để AI nhận diện giọng nói chính xác.
- Nói rành mạch, không ngập ngừng quá lâu.
- Quan sát biểu cảm của Avatar 3D để giữ ánh mắt trực diện (eye contact) tự nhiên.

Hệ thống MockAI sẽ chấm điểm chi tiết giọng nói, từ vựng kỹ thuật và sự tự tin của bạn ngay sau khi hoàn thành.`,
      cover_image_url: 'https://images.unsplash.com/photo-1677442136019-21780efad99a?w=800',
      category: 'Luyện tập AI',
      tags: ['ai', 'mockinterview', 'practice', 'voice'],
      status: 'PUBLISHED',
      approved_by: 1,
      published_at: now,
      view_count: 2450,
      created_at: now,
      updated_at: now
    },
    {
      id: 4,
      author_id: 2,
      title: 'Xu hướng thị trường việc làm IT nửa đầu năm 2026 có gì nổi bật?',
      slug: 'xu-huong-thi-truong-viec-lam-it-nua-dau-nam-2026-4',
      content: `Thị trường CNTT năm 2026 ưu tiên rõ rệt các kỹ sư có năng lực làm việc đa nhiệm và biết ứng dụng AI trợ lý vào quy trình coding hàng ngày.

Top kỹ năng săn đón nhất:
1. Fullstack (Node.js + React / Next.js)
2. AI Engineering & Prompt Design
3. Cloud Security & DevOps
4. Kỹ năng giao tiếp tiếng Anh phản xạ tốt.`,
      cover_image_url: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800',
      category: 'Thị trường lao động',
      tags: ['jobs', 'trend', '2026', 'it'],
      status: 'PUBLISHED',
      approved_by: 1,
      published_at: now,
      view_count: 1890,
      created_at: now,
      updated_at: now
    },
    {
      id: 5,
      author_id: 4, // HR VinaGroup
      title: 'Cách trả lời câu hỏi: Hãy giới thiệu về bản thân sao cho cuốn hút',
      slug: 'cach-tra-loi-cau-hoi-gioi-thieu-ban-than-5',
      content: `Câu hỏi mở đầu phỏng vấn thường quyết định 50% thiện cảm của Nhà tuyển dụng. Đừng đọc lại toàn bộ CV!

Hãy áp dụng công thức 2 phút:
- **Quá khứ (30s)**: Tóm tắt ngắn gọn học vấn và nền tảng kinh nghiệm cốt lõi.
- **Hiện tại (60s)**: Nhấn mạnh thành tựu gần nhất khớp với vị trí đang ứng tuyển.
- **Tương lai (30s)**: Nêu rõ mục tiêu đóng góp cho công ty nếu được nhận.`,
      cover_image_url: 'https://images.unsplash.com/photo-1521737711867-e3b97375f902?w=800',
      category: 'Kinh nghiệm phỏng vấn',
      tags: ['interview', 'introduction', 'hr', 'tips'],
      status: 'PUBLISHED',
      approved_by: 1,
      published_at: now,
      view_count: 2980,
      created_at: now,
      updated_at: now
    },
    {
      id: 6,
      author_id: 6, // HR FastFinance
      title: 'Nghệ thuật đàm phán lương hiệu quả và giữ vững thế chủ động',
      slug: 'nghe-thuat-dam-phan-luong-hieu-qua-6',
      content: `Khi nhận offer, thương lượng lương là bước vô cùng bình thường thể hiện sự tự tin vào giá trị bản thân.

Nguyên tắc vàng:
1. Tra cứu mức lương trung bình của vị trí trên thị trường trước buổi trao đổi.
2. Đưa ra khoảng lương (Salary Range) thay vì một con số cố định.
3. Cân nhắc tổng gói thu nhập (Gross/Net, Thưởng Performance, Chăm sóc sức khỏe, Đào tạo).`,
      cover_image_url: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=800',
      category: 'Mẹo phát triển sự nghiệp',
      tags: ['salary', 'negotiation', 'career', 'offer'],
      status: 'PUBLISHED',
      approved_by: 1,
      published_at: now,
      view_count: 1760,
      created_at: now,
      updated_at: now
    },
    {
      id: 7,
      author_id: 5, // HR GreenEnergy
      title: 'Ngành Năng lượng sạch 2026: Cơ hội việc làm bùng nổ cho giới trẻ',
      slug: 'nganh-nang-luong-sach-2026-co-hoi-viec-lam-7',
      content: `Năng lượng tái tạo không chỉ là xu hướng toàn cầu mà đang trở thành ngành kinh tế mũi nhọn tại Việt Nam.

Các vị trí khát nhân sự:
- Kỹ sư thiết kế hệ thống Điện mặt trời & Điện gió
- Kỹ sư An toàn Môi trường (HSE)
- Chuyên viên ESG & Phát triển bền vững doanh nghiệp.`,
      cover_image_url: 'https://images.unsplash.com/photo-1466611653911-95081537e5b7?w=800',
      category: 'Xu hướng ngành nghề',
      tags: ['greenenergy', 'jobs', 'sustainability'],
      status: 'PUBLISHED',
      approved_by: 1,
      published_at: now,
      view_count: 1420,
      created_at: now,
      updated_at: now
    },
    {
      id: 8,
      author_id: 7, // HR SmartEdu
      title: 'Ứng dụng AI trong giáo dục trực tuyến và học tập cá nhân hóa',
      slug: 'ung-dung-ai-trong-giao-duc-truc-tuyen-8',
      content: `Công nghệ AI đang cách mạng hóa phương pháp học tập. Thay vì các bài giảng rập khuôn, các nền tảng EdTech hiện đại điều chỉnh lộ trình học theo điểm mạnh/yếu của từng cá nhân.

Tại SmartEdu, học viên được luyện phỏng vấn thực chiến với AI 3D Avatar, nhận phản hồi ngay lập tức giúp rút ngắn thời gian chuẩn bị từ vài tháng xuống vài tuần!`,
      cover_image_url: 'https://images.unsplash.com/photo-1501504905252-473c47e087f8?w=800',
      category: 'Công nghệ Giáo dục',
      tags: ['edtech', 'ai', 'learning', 'education'],
      status: 'PUBLISHED',
      approved_by: 1,
      published_at: now,
      view_count: 1650,
      created_at: now,
      updated_at: now
    },
    {
      id: 9,
      author_id: 2,
      title: 'Những sai lầm chết người khi tham gia phỏng vấn Live Coding',
      slug: 'nhung-sai-lam-chet-nguoi-khi-phong-van-live-coding-9',
      content: `Phỏng vấn Live Coding thường khiến nhiều ứng viên hoảng loạn. Nhớ kỹ:

- **Đừng vội code ngay**: Hãy dành 3-5 phút đặt câu hỏi làm rõ các trường hợp biên (edge cases).
- **Vừa code vừa giải thích (Think aloud)**: Nhà tuyển dụng muốn xem tư duy logic của bạn chứ không chỉ là kết quả đúng.
- **Tối ưu hóa độ phức tạp**: Phân tích Time Complexity & Space Complexity sau khi hoàn thành.`,
      cover_image_url: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=800',
      category: 'Kinh nghiệm phỏng vấn',
      tags: ['livecoding', 'developer', 'algorithm', 'interview'],
      status: 'PUBLISHED',
      approved_by: 1,
      published_at: now,
      view_count: 2310,
      created_at: now,
      updated_at: now
    },
    {
      id: 10,
      author_id: 2,
      title: 'Xây dựng thương hiệu cá nhân ấn tượng trên LinkedIn',
      slug: 'xay-dung-thuong-hieu-ca-nhan-tren-linkedin-10',
      content: `LinkedIn là công cụ tuyệt vời để các Nhà tuyển dụng chủ động tìm đến bạn.

Bí quyết nâng tầm trang cá nhân:
- Tiêu đề (Headline) ghi rõ vị trí và thế mạnh cốt lõi.
- Đăng tải bài viết chia sẻ dự án, góc nhìn công nghệ định kỳ.
- Xin đánh giá (Recommendations) từ đồng nghiệp hoặc cấp trên cũ.`,
      cover_image_url: 'https://images.unsplash.com/photo-1611944212129-29977ae1398c?w=800',
      category: 'Mẹo phát triển sự nghiệp',
      tags: ['linkedin', 'personalbrand', 'networking'],
      status: 'PUBLISHED',
      approved_by: 1,
      published_at: now,
      view_count: 1980,
      created_at: now,
      updated_at: now
    },
    {
      id: 11,
      author_id: 3,
      title: 'Tối ưu hóa điểm số ATS CV với công cụ AI chấm điểm',
      slug: 'toi-uu-hoa-diem-so-ats-cv-voi-cong-cu-ai-11',
      content: `Hệ thống phân tích CV tự động bằng AI giúp ứng viên phát hiện ngay lập tức các kỹ năng còn thiếu so với mô tả công việc (JD).

Hãy kiểm tra ngay điểm số CV của bạn trên MockAI để nâng tỷ lệ được gọi phỏng vấn lên tới 85%!`,
      cover_image_url: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=800',
      category: 'Cẩm nang CV',
      tags: ['ats', 'score', 'cv', 'ai'],
      status: 'PUBLISHED',
      approved_by: 1,
      published_at: now,
      view_count: 2840,
      created_at: now,
      updated_at: now
    },
    {
      id: 12,
      author_id: 6,
      title: 'Hành trang gia nhập ngành Fintech và Ngân hàng số',
      slug: 'hanh-trang-gia-nhap-nganh-fintech-va-ngan-hang-so-12',
      content: `Khối tài chính số luôn đòi hỏi sự chuẩn xác tuyệt đối về an toàn thông tin và tính toàn vẹn dữ liệu. Nếu bạn định ứng tuyển vị trí Developer trong ngành này, hãy trang bị kiến thức về mã hóa, OAuth2, Microservices và giao thức thanh toán.`,
      cover_image_url: 'https://images.unsplash.com/photo-1559526324-4b87b5e36e44?w=800',
      category: 'Xu hướng ngành nghề',
      tags: ['fintech', 'banking', 'security'],
      status: 'PUBLISHED',
      approved_by: 1,
      published_at: now,
      view_count: 1530,
      created_at: now,
      updated_at: now
    },
    {
      id: 13,
      author_id: 2,
      title: 'Phương pháp luyện phản xạ phỏng vấn tiếng Anh không ngập ngừng',
      slug: 'phuong-phap-luyen-phan-xa-phong-van-tieng-anh-13',
      content: `Nhiều bạn có ngữ pháp tốt nhưng khi nói tiếng Anh phỏng vấn lại bị lúng túng.

Giải pháp:
1. Học các mẫu câu chuyển ý (Linking phrases) như: "That is a great question...", "From my experience...".
2. Thực hành hội thoại hàng ngày với trợ lý AI giọng chuẩn bản xứ để xây dựng sự tự tin.`,
      cover_image_url: 'https://images.unsplash.com/photo-1543269865-cbf427effbad?w=800',
      category: 'Luyện tập AI',
      tags: ['english', 'speaking', 'interview', 'communication'],
      status: 'PUBLISHED',
      approved_by: 1,
      published_at: now,
      view_count: 2120,
      created_at: now,
      updated_at: now
    },
    {
      id: 14,
      author_id: 4,
      title: 'Làm sao để nhận biết văn hóa công ty phù hợp với bản thân?',
      slug: 'lam-sao-de-nhan-biet-van-hoa-cong-ty-phu-hop-14',
      content: `Văn hóa công ty ảnh hưởng trực tiếp đến sự gắn bó lâu dài của bạn. Hãy chủ động chuẩn bị các câu hỏi ngược lại cho HR ở cuối buổi phỏng vấn như: "Đội ngũ giải quyết bất đồng ý kiến như thế nào?", "Công ty hỗ trợ việc học tập nâng cao kỹ năng ra sao?".`,
      cover_image_url: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=800',
      category: 'Mẹo phát triển sự nghiệp',
      tags: ['culture', 'company', 'hr', 'tips'],
      status: 'PUBLISHED',
      approved_by: 1,
      published_at: now,
      view_count: 1740,
      created_at: now,
      updated_at: now
    },
    {
      id: 15,
      author_id: 1, // Admin
      title: 'Chào mừng bạn đến với Cộng đồng Luyện phỏng vấn Thông minh MockAI!',
      slug: 'chao-mung-ban-den-voi-cong-dong-mockai-15',
      content: `MockAI là nền tảng kết nối ứng viên và các nhà tuyển dụng hàng đầu. Tại đây bạn có thể chia sẻ kinh nghiệm xin việc, hỏi đáp các câu hỏi phỏng vấn hóc húa và trải nghiệm mô phỏng phỏng vấn giọng nói 3D độc đáo. Chúc cộng đồng chúng ta ngày càng phát triển!`,
      cover_image_url: 'https://images.unsplash.com/photo-1531482615713-2afd69097998?w=800',
      category: 'Thông báo',
      tags: ['mockai', 'community', 'welcome'],
      status: 'PUBLISHED',
      approved_by: 1,
      published_at: now,
      view_count: 4200,
      created_at: now,
      updated_at: now
    }
  ];

  await knex('blogs').insert(blogsData);

  // 7. Seed Blog Comments (12 interactions between candidates, HRs and admin)
  const commentsData = [
    {
      id: 1,
      blog_id: 1,
      user_id: 2, // Candidate
      content: 'Bài viết rất chi tiết! Mình đã áp dụng cách trình bày kinh nghiệm theo con số và điểm CV tăng rõ rệt.',
      created_at: now,
      updated_at: now
    },
    {
      id: 2,
      blog_id: 1,
      user_id: 3, // HR TechCorp
      content: 'Cảm ơn bạn! Đúng là phía HR chúng mình rất đánh giá cao các CV ghi rõ kết quả và công nghệ sử dụng thực tế.',
      created_at: now,
      updated_at: now
    },
    {
      id: 3,
      blog_id: 2,
      user_id: 2,
      content: 'Phương pháp STAR đúng là cứu cánh cho mình trong buổi phỏng vấn vị trí Senior tuần trước!',
      created_at: now,
      updated_at: now
    },
    {
      id: 4,
      blog_id: 2,
      user_id: 4, // HR VinaGroup
      content: 'Rất chuẩn! Khi ứng viên trình bày theo cấu trúc STAR, HR có thể dễ dàng đánh giá chính xác năng lực giải quyết vấn đề.',
      created_at: now,
      updated_at: now
    },
    {
      id: 5,
      blog_id: 3,
      user_id: 2,
      content: 'Trải nghiệm phỏng vấn voice AI trên MockAI thấy phản xạ nói tự nhiên hơn hẳn. Giọng AI rất chuẩn!',
      created_at: now,
      updated_at: now
    },
    {
      id: 6,
      blog_id: 3,
      user_id: 1, // Admin
      content: 'Cảm ơn bạn đã trải nghiệm! Đội ngũ vừa nâng cấp mô hình AI voice với độ trễ phản hồi cực thấp đấy.',
      created_at: now,
      updated_at: now
    },
    {
      id: 7,
      blog_id: 6,
      user_id: 2,
      content: 'Mọi người cho mình hỏi nếu HR hỏi mức lương mong muốn ngay từ đầu buổi thì nên trả lời sao cho khéo ạ?',
      created_at: now,
      updated_at: now
    },
    {
      id: 8,
      blog_id: 6,
      user_id: 6, // HR FastFinance
      content: 'Bạn nên đưa ra một khoảng (Salary range) dựa trên nghiên cứu thị trường, đồng thời nhấn mạnh sự linh hoạt theo tổng đãi ngộ nhé!',
      created_at: now,
      updated_at: now
    },
    {
      id: 9,
      blog_id: 7,
      user_id: 5, // HR GreenEnergy
      content: 'Mảng năng lượng xanh bên mình đang tuyển nhiều vị trí kỹ sư chất lượng cao, các bạn quan tâm cứ gửi CV nhé!',
      created_at: now,
      updated_at: now
    },
    {
      id: 10,
      blog_id: 8,
      user_id: 7, // HR SmartEdu
      content: 'Luyện tập cá nhân hóa với AI giúp các bạn tự tin hơn rất nhiều khi gặp trực tiếp nhà tuyển dụng.',
      created_at: now,
      updated_at: now
    },
    {
      id: 11,
      blog_id: 11,
      user_id: 2,
      content: 'Sau khi soi kỹ các từ khóa ATS thiếu trên MockAI, mình bổ sung vào CV và lập tức trúng tuyển vòng sơ loại!',
      created_at: now,
      updated_at: now
    },
    {
      id: 12,
      blog_id: 15,
      user_id: 2,
      content: 'Chúc cộng đồng MockAI ngày càng lớn mạnh! Nền tảng thực sự rất hữu ích cho người tìm việc.',
      created_at: now,
      updated_at: now
    }
  ];

  await knex('blog_comments').insert(commentsData);

  // 8. Seed Blog Reactions (20 reactions)
  const reactionsData = [
    { id: 1, blog_id: 1, user_id: 1, reaction_type: 'LIKE', created_at: now },
    { id: 2, blog_id: 1, user_id: 2, reaction_type: 'LOVE', created_at: now },
    { id: 3, blog_id: 1, user_id: 3, reaction_type: 'HELPFUL', created_at: now },
    { id: 4, blog_id: 2, user_id: 2, reaction_type: 'LOVE', created_at: now },
    { id: 5, blog_id: 2, user_id: 4, reaction_type: 'LIKE', created_at: now },
    { id: 6, blog_id: 3, user_id: 1, reaction_type: 'LOVE', created_at: now },
    { id: 7, blog_id: 3, user_id: 2, reaction_type: 'HELPFUL', created_at: now },
    { id: 8, blog_id: 4, user_id: 3, reaction_type: 'LIKE', created_at: now },
    { id: 9, blog_id: 5, user_id: 2, reaction_type: 'HELPFUL', created_at: now },
    { id: 10, blog_id: 5, user_id: 5, reaction_type: 'LIKE', created_at: now },
    { id: 11, blog_id: 6, user_id: 2, reaction_type: 'LOVE', created_at: now },
    { id: 12, blog_id: 6, user_id: 6, reaction_type: 'HELPFUL', created_at: now },
    { id: 13, blog_id: 7, user_id: 5, reaction_type: 'LIKE', created_at: now },
    { id: 14, blog_id: 8, user_id: 7, reaction_type: 'LOVE', created_at: now },
    { id: 15, blog_id: 9, user_id: 2, reaction_type: 'HELPFUL', created_at: now },
    { id: 16, blog_id: 11, user_id: 1, reaction_type: 'LIKE', created_at: now },
    { id: 17, blog_id: 11, user_id: 2, reaction_type: 'LOVE', created_at: now },
    { id: 18, blog_id: 13, user_id: 2, reaction_type: 'HELPFUL', created_at: now },
    { id: 19, blog_id: 15, user_id: 1, reaction_type: 'LOVE', created_at: now },
    { id: 20, blog_id: 15, user_id: 2, reaction_type: 'LIKE', created_at: now }
  ];

  await knex('blog_reactions').insert(reactionsData);

  // Reset sequence generators for PostgreSQL auto-increment safely
  await knex.raw("SELECT setval(pg_get_serial_sequence('locations', 'id'), COALESCE((SELECT MAX(id) FROM locations), 1))");
  await knex.raw("SELECT setval(pg_get_serial_sequence('job_types', 'id'), COALESCE((SELECT MAX(id) FROM job_types), 1))");
  await knex.raw("SELECT setval(pg_get_serial_sequence('categories', 'id'), COALESCE((SELECT MAX(id) FROM categories), 1))");
  await knex.raw("SELECT setval(pg_get_serial_sequence('jobs', 'id'), COALESCE((SELECT MAX(id) FROM jobs), 1))");
  await knex.raw("SELECT setval(pg_get_serial_sequence('job_requirements', 'id'), COALESCE((SELECT MAX(id) FROM job_requirements), 1))");
  await knex.raw("SELECT setval(pg_get_serial_sequence('blogs', 'id'), COALESCE((SELECT MAX(id) FROM blogs), 1))");
  await knex.raw("SELECT setval(pg_get_serial_sequence('blog_comments', 'id'), COALESCE((SELECT MAX(id) FROM blog_comments), 1))");
  await knex.raw("SELECT setval(pg_get_serial_sequence('blog_reactions', 'id'), COALESCE((SELECT MAX(id) FROM blog_reactions), 1))");
}

