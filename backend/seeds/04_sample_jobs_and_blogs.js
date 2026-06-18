/**
 * Seed: Enrichment seed for Jobs and Blogs in various approval states.
 * 
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> } 
 */
export async function seed(knex) {
  // Clear dependent tables first
  await knex('blogs').del();
  await knex('jobs').del();
  await knex('companies').del();
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

  // 4. Seed Companies
  await knex('companies').insert([
    {
      id: 1,
      name: 'TechCorp Vietnam',
      logo_url: '💻',
      website: 'techcorp.vn',
      industry: 'Công nghệ thông tin',
      company_size: '150-200',
      description: 'Công ty công nghệ hàng đầu chuyên về phát triển Web và AI.',
      address: 'Hà Nội',
      phone: '024123456',
      email: 'contact@techcorp.vn',
      tax_code: '0101234567',
      is_verified: true,
      created_at: new Date(),
      updated_at: new Date()
    },
    {
      id: 2,
      name: 'VinaGroup',
      logo_url: '🏢',
      website: 'vinagroup.com',
      industry: 'Đa ngành',
      company_size: '500+',
      description: 'Tập đoàn kinh tế tư nhân đa ngành hàng đầu Việt Nam.',
      address: 'TP. Hồ Chí Minh',
      phone: '028123456',
      email: 'contact@vinagroup.com',
      tax_code: '0201234567',
      is_verified: true,
      created_at: new Date(),
      updated_at: new Date()
    },
    {
      id: 3,
      name: 'GreenEnergy',
      logo_url: '🌱',
      website: 'greenenergy.com',
      industry: 'Năng lượng sạch',
      company_size: '51-200',
      description: 'Cung cấp giải pháp năng lượng mặt trời và năng lượng tái tạo.',
      address: 'Đà Nẵng',
      phone: '0236123456',
      email: 'contact@greenenergy.com',
      tax_code: '0301234567',
      is_verified: false,
      created_at: new Date(),
      updated_at: new Date()
    },
    {
      id: 4,
      name: 'FastFinance',
      logo_url: '🏦',
      website: 'fastfinance.com',
      industry: 'Tài chính / Ngân hàng',
      company_size: '201-500',
      description: 'Ứng dụng giải pháp công nghệ số trong lĩnh vực tài chính tiêu dùng.',
      address: 'TP. Hồ Chí Minh',
      phone: '028987654',
      email: 'contact@fastfinance.com',
      tax_code: '0401234567',
      is_verified: false,
      created_at: new Date(),
      updated_at: new Date()
    },
    {
      id: 5,
      name: 'SmartEdu',
      logo_url: '🎓',
      website: 'smartedu.vn',
      industry: 'Giáo dục / EdTech',
      company_size: '11-50',
      description: 'Cung cấp nền tảng học trực tuyến chất lượng cao dành cho học sinh.',
      address: 'Hà Nội',
      phone: '024987654',
      email: 'contact@smartedu.vn',
      tax_code: '0501234567',
      is_verified: true,
      created_at: new Date(),
      updated_at: new Date()
    }
  ]);

  // 5. Seed Jobs (linked to Companies, Locations, Job Types, Categories)
  await knex('job_posts').del();

  // 5. Seed Job Posts (linked to Companies)
  await knex('job_posts').insert([
    {
      id: 1,
      hr_id: 3,
      company_id: 1,
      title: 'Chiến dịch tuyển dụng Kỹ sư Phần mềm - Mùa Hè 2026',
      description: 'Gia nhập đội ngũ phát triển sản phẩm cốt lõi tại TechCorp. Chúng tôi đang tìm kiếm các kỹ sư xuất sắc để xây dựng nền tảng giáo dục triệu người dùng.',
      deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      status: 'OPEN',
      approval_status: 'APPROVED',
      approved_by: 1,
      approved_at: new Date(),
      view_count: 1250,
      created_at: new Date(),
      updated_at: new Date()
    },
    {
      id: 2,
      hr_id: 3,
      company_id: 1,
      title: 'Tuyển dụng Đội ngũ Trí tuệ Nhân tạo & Dữ liệu lớn',
      description: 'Cơ hội làm việc với các mô hình AI tiên tiến nhất hiện nay (LLMs, RAG). TechCorp đang mở rộng bộ phận R&D AI.',
      deadline: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000),
      status: 'OPEN',
      approval_status: 'APPROVED',
      approved_by: 1,
      approved_at: new Date(),
      view_count: 2189,
      created_at: new Date(),
      updated_at: new Date()
    },
    {
      id: 3,
      hr_id: 3,
      company_id: 2,
      title: 'Chiến dịch tuyển dụng Khối Kinh doanh & Sản phẩm',
      description: 'VinaGroup đang tìm kiếm những tài năng dẫn dắt chiến lược tăng trưởng và phát triển sản phẩm trên toàn cầu.',
      deadline: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000),
      status: 'OPEN',
      approval_status: 'PENDING',
      view_count: 85,
      created_at: new Date(),
      updated_at: new Date()
    }
  ]);

  // Seed Jobs (Positions linked to job_posts)
  await knex('jobs').insert([
    {
      id: 1,
      job_post_id: 1, // Thuộc chiến dịch 1
      category_id: 1,
      location_id: 1,
      job_type_id: 1,
      title: 'Senior Frontend Engineer (React 19 / Vite / Tailwind v4)',
      requirements: 'Ít nhất 4 năm kinh nghiệm với React. Thành thạo State Management (Zustand/Redux), TanStack Query, Framer Motion. Có khả năng tối ưu Web Performance và thấu hiểu các tiêu chuẩn Accessibility.',
      experience_level: 'SENIOR',
      salary_min: 45000000,
      salary_max: 65000000,
      salary_currency: 'VND',
      is_salary_visible: true,
      vacancy_count: 2,
      created_at: new Date(),
      updated_at: new Date()
    },
    {
      id: 2,
      job_post_id: 1, // Thuộc chiến dịch 1
      category_id: 1,
      location_id: 4, // Remote
      job_type_id: 3,
      title: 'Node.js Backend Architect (Microservices)',
      requirements: 'Có kinh nghiệm thiết kế kiến trúc hệ thống xử lý hàng triệu requests/ngày. Am hiểu sâu sắc về PostgreSQL, Redis, Message Brokers (RabbitMQ/Kafka) và Containerization (Docker/K8s).',
      experience_level: 'EXPERT',
      salary_min: 70000000,
      salary_max: 120000000,
      salary_currency: 'VND',
      is_salary_visible: true,
      vacancy_count: 1,
      created_at: new Date(),
      updated_at: new Date()
    },
    {
      id: 3,
      job_post_id: 2, // Thuộc chiến dịch 2
      category_id: 1,
      location_id: 2,
      job_type_id: 1,
      title: 'AI Research Scientist (Generative AI / LLMs)',
      requirements: 'Có nền tảng Toán học/Khoa học máy tính vững chắc. Kinh nghiệm triển khai các mô hình Deep Learning/NLP trên môi trường Production (AWS/GCP). Thành thạo PyTorch và Python.',
      experience_level: 'SENIOR',
      salary_min: 60000000,
      salary_max: 100000000,
      salary_currency: 'VND',
      is_salary_visible: true,
      vacancy_count: 1,
      created_at: new Date(),
      updated_at: new Date()
    },
    {
      id: 4,
      job_post_id: 3, // Thuộc chiến dịch 3
      category_id: 2,
      location_id: 3,
      job_type_id: 1,
      title: 'Growth Marketing Manager',
      requirements: 'Hơn 3 năm kinh nghiệm trong lĩnh vực Growth Hacking/Performance Marketing. Data-driven mindset, sử dụng thành thạo Google Analytics 4, Mixpanel, và các công cụ A/B Testing.',
      experience_level: 'MID',
      salary_min: 25000000,
      salary_max: 40000000,
      salary_currency: 'VND',
      is_salary_visible: true,
      vacancy_count: 1,
      created_at: new Date(),
      updated_at: new Date()
    },
    {
      id: 5,
      job_post_id: 3, // Thuộc chiến dịch 3
      category_id: 4,
      location_id: 2,
      job_type_id: 1,
      title: 'Agile Product Manager (FinTech)',
      requirements: 'Ít nhất 5 năm kinh nghiệm làm Product Management trong lĩnh vực Fintech. Sở hữu chứng chỉ PSPO/CSPO là lợi thế. Kỹ năng giao tiếp xuất sắc và tư duy phân tích nhạy bén.',
      experience_level: 'LEAD',
      salary_min: 50000000,
      salary_max: 80000000,
      salary_currency: 'VND',
      is_salary_visible: true,
      vacancy_count: 1,
      created_at: new Date(),
      updated_at: new Date()
    }
  ]);

  // 6. Seed Blogs
  await knex('blogs').insert([
    {
      id: 1,
      author_id: 2, // Candidate
      title: 'Bí quyết vàng để viết CV chinh phục mọi nhà tuyển dụng công nghệ',
      slug: 'bi-quyet-vang-de-viet-cv-chinh-phuc-nha-tuyen-dung-1',
      content: 'Viết CV là bước đệm đầu tiên cực kỳ quan trọng trong hành trình tìm việc của bạn. Hãy đảm bảo bạn liệt kê rõ ràng các kỹ năng trọng tâm và các dự án thực tế nổi bật...',
      cover_image_url: 'https://images.unsplash.com/photo-1586281380349-632531db7ed4?w=500',
      category: 'Cẩm nang CV',
      tags: ['cv', 'tips', 'frontend'],
      status: 'PUBLISHED',
      approved_by: 1,
      published_at: new Date(),
      view_count: 1240,
      created_at: new Date(),
      updated_at: new Date()
    },
    {
      id: 2,
      author_id: 2,
      title: '10 câu hỏi phỏng vấn hành vi và phương pháp STAR để trả lời',
      slug: '10-cau-hoi-phong-van-hanh-vi-va-phuong-phap-star-2',
      content: 'Phỏng vấn hành vi là cơ hội để bạn chứng minh năng lực giải quyết vấn đề của mình. Sử dụng mô hình STAR (Situation, Task, Action, Result) giúp câu trả lời của bạn chặt chẽ và thuyết phục...',
      cover_image_url: 'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=500',
      category: 'Kinh nghiệm phỏng vấn',
      tags: ['phongvan', 'star', 'behavioral'],
      status: 'PUBLISHED',
      approved_by: 1,
      published_at: new Date(),
      view_count: 3105,
      created_at: new Date(),
      updated_at: new Date()
    },
    {
      id: 3,
      author_id: 2,
      title: 'Lộ trình chuyển ngành sang lập trình AI trong năm 2026',
      slug: 'lo-trinh-chuyen-nganh-sang-lap-trinh-ai-nam-2026-3',
      content: 'Chuyển ngành chưa bao giờ là dễ dàng, đặc biệt là sang lĩnh vực AI đầy thử thách. Bạn cần trang bị vững kiến thức về Toán học (Đại số tuyến tính, Xác suất thống kê), Lập trình Python, và các mô hình Học máy cơ bản...',
      cover_image_url: 'https://images.unsplash.com/photo-1677442136019-21780efad99a?w=500',
      category: 'Lộ trình sự nghiệp',
      tags: ['ai', 'python', 'careermap'],
      status: 'PENDING',
      view_count: 890,
      created_at: new Date(),
      updated_at: new Date()
    },
    {
      id: 4,
      author_id: 2,
      title: 'Xu hướng thị trường việc làm IT nửa đầu năm 2026 có gì nổi bật?',
      slug: 'xu-huong-thi-truong-viec-lam-it-nua-dau-nam-2026-4',
      content: 'Thị trường việc làm IT trong năm 2026 chứng kiến sự chuyển dịch rõ nét. Các nhà tuyển dụng ưu tiên ứng viên có khả năng làm việc đa nhiệm, đặc biệt là các kỹ năng lập trình Full-stack kết hợp kiến thức AI...',
      cover_image_url: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=500',
      category: 'Thị trường lao động',
      tags: ['jobs', 'trend', '2026'],
      status: 'PUBLISHED',
      approved_by: 1,
      published_at: new Date(),
      view_count: 450,
      created_at: new Date(),
      updated_at: new Date()
    }
  ]);

  // Reset sequence generators to prevent duplicate key errors in auto-increment
  await knex.raw("SELECT setval('locations_id_seq', (SELECT MAX(id) FROM locations))");
  await knex.raw("SELECT setval('job_types_id_seq', (SELECT MAX(id) FROM job_types))");
  await knex.raw("SELECT setval('categories_id_seq', (SELECT MAX(id) FROM categories))");
  await knex.raw("SELECT setval('companies_id_seq', (SELECT MAX(id) FROM companies))");
  await knex.raw("SELECT setval('jobs_id_seq', (SELECT MAX(id) FROM jobs))");
  await knex.raw("SELECT setval('blogs_id_seq', (SELECT MAX(id) FROM blogs))");
};
