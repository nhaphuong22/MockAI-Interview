// Mock data for Administrator Portal
export const mockUsers = [
  {
    id: "USR-001",
    name: "Nguyễn Văn A",
    email: "vana@gmail.com",
    avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&h=100&fit=crop&crop=faces",
    role: "Candidate",
    status: "Active",
    joinDate: "2026-04-10",
    cvScore: 85,
    interviewCount: 12,
    totalPaid: "199,000đ"
  },
  {
    id: "USR-002",
    name: "Trần Thị B",
    email: "thib@gmail.com",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop&crop=faces",
    role: "Candidate",
    status: "Active",
    joinDate: "2026-04-12",
    cvScore: 92,
    interviewCount: 8,
    totalPaid: "0đ"
  },
  {
    id: "USR-003",
    name: "Phạm Minh C",
    email: "minhc@techcorp.vn",
    avatar: "https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=100&h=100&fit=crop&crop=faces",
    role: "Recruiter",
    status: "Active",
    joinDate: "2026-03-25",
    cvScore: 0,
    interviewCount: 0,
    totalPaid: "2,500,000đ"
  },
  {
    id: "USR-004",
    name: "Lê Thị D",
    email: "lethid@gmail.com",
    avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=faces",
    role: "Candidate",
    status: "Banned",
    joinDate: "2026-02-18",
    cvScore: 64,
    interviewCount: 3,
    totalPaid: "0đ"
  },
  {
    id: "USR-005",
    name: "Hoàng Văn E",
    email: "vane@vinagroup.com",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=faces",
    role: "Recruiter",
    status: "Active",
    joinDate: "2026-05-01",
    cvScore: 0,
    interviewCount: 0,
    totalPaid: "4,900,000đ"
  },
  {
    id: "USR-006",
    name: "Vũ Thị F",
    email: "vuthif@outlook.com",
    avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&h=100&fit=crop&crop=faces",
    role: "Candidate",
    status: "Active",
    joinDate: "2026-05-05",
    cvScore: 78,
    interviewCount: 5,
    totalPaid: "199,000đ"
  }
];

export const mockCompanies = [
  {
    id: "COM-001",
    name: "TechCorp Vietnam",
    logo: "💻",
    industry: "Công nghệ thông tin",
    employees: "150-200",
    jobCount: 14,
    applicationsCount: 320,
    verified: true,
    status: "Active"
  },
  {
    id: "COM-002",
    name: "VinaGroup",
    logo: "🏢",
    industry: "Đa ngành",
    employees: "1000+",
    jobCount: 45,
    applicationsCount: 1205,
    verified: true,
    status: "Active"
  },
  {
    id: "COM-003",
    name: "GreenEnergy",
    logo: "🌱",
    industry: "Năng lượng sạch",
    employees: "50-100",
    jobCount: 3,
    applicationsCount: 42,
    verified: false,
    status: "Pending"
  },
  {
    id: "COM-004",
    name: "FastFinance",
    logo: "🏦",
    industry: "Tài chính / Ngân hàng",
    employees: "200-500",
    jobCount: 8,
    applicationsCount: 148,
    verified: false,
    status: "Suspended"
  },
  {
    id: "COM-005",
    name: "SmartEdu",
    logo: "🎓",
    industry: "Giáo dục / EdTech",
    employees: "20-50",
    jobCount: 5,
    applicationsCount: 96,
    verified: true,
    status: "Active"
  }
];

export const mockJobPosts = [
  {
    id: "JOB-001",
    title: "Senior React Developer",
    company: "TechCorp Vietnam",
    salary: "35,000,000đ - 45,000,000đ",
    location: "Hà Nội",
    type: "Full-time",
    status: "Approved",
    featured: true,
    postedDate: "2026-05-10"
  },
  {
    id: "JOB-002",
    title: "AI Engineer (Python / PyTorch)",
    company: "TechCorp Vietnam",
    salary: "40,000,000đ - 60,000,000đ",
    location: "TP. Hồ Chí Minh",
    type: "Full-time",
    status: "Approved",
    featured: true,
    postedDate: "2026-05-12"
  },
  {
    id: "JOB-003",
    title: "Chuyên viên Marketing Online",
    company: "VinaGroup",
    salary: "15,000,000đ - 22,000,000đ",
    location: "Đà Nẵng",
    type: "Full-time",
    status: "Pending",
    featured: false,
    postedDate: "2026-05-15"
  },
  {
    id: "JOB-004",
    title: "Node.js Backend Developer",
    company: "SmartEdu",
    salary: "20,000,000đ - 30,000,000đ",
    location: "Remote",
    type: "Remote",
    status: "Approved",
    featured: false,
    postedDate: "2026-05-14"
  },
  {
    id: "JOB-005",
    title: "Project Manager",
    company: "FastFinance",
    salary: "30,000,000đ - 40,000,000đ",
    location: "TP. Hồ Chí Minh",
    type: "Full-time",
    status: "Rejected",
    featured: false,
    postedDate: "2026-05-08"
  }
];

export const mockBlogPosts = [
  {
    id: "BLOG-001",
    title: "Bí quyết vàng để viết CV chinh phục mọi nhà tuyển dụng công nghệ",
    author: "Phan Hoài Nam",
    category: "Cẩm nang CV",
    views: 1240,
    status: "Published",
    postedDate: "2026-04-20",
    summary: "Những lỗi sai phổ biến và cách tối ưu hóa kỹ năng trên CV kỹ sư phần mềm..."
  },
  {
    id: "BLOG-002",
    title: "10 câu hỏi phỏng vấn hành vi và phương pháp STAR để trả lời",
    author: "Lê Minh Anh",
    category: "Kinh nghiệm phỏng vấn",
    views: 3105,
    status: "Published",
    postedDate: "2026-04-25",
    summary: "Khám phá cách cấu trúc câu trả lời logic, thu hút người phỏng vấn..."
  },
  {
    id: "BLOG-003",
    title: "Lộ trình chuyển ngành sang lập trình AI trong năm 2026",
    author: "AI Expert",
    category: "Lộ trình sự nghiệp",
    views: 890,
    status: "Draft",
    postedDate: "2026-05-16",
    summary: "Các kiến thức toán, lập trình và mô hình máy học cần tích lũy..."
  },
  {
    id: "BLOG-004",
    title: "Xu hướng thị trường việc làm IT nửa đầu năm 2026 có gì nổi bật?",
    author: "Trần Thế Vinh",
    category: "Thị trường lao động",
    views: 450,
    status: "Published",
    postedDate: "2026-05-02",
    summary: "Sự lên ngôi của các vị trí Fullstack và sự bão hòa của Front-end cơ bản..."
  }
];

export const mockTransactions = [
  {
    id: "TXN-73910",
    user: "Nguyễn Văn A",
    email: "vana@gmail.com",
    type: "Candidate Upgrade",
    amount: 199000,
    date: "2026-05-16 14:32",
    status: "Success",
    package: "Premium Member 1 Month"
  },
  {
    id: "TXN-73911",
    user: "TechCorp Vietnam",
    email: "billing@techcorp.vn",
    type: "Recruiter Bundle",
    amount: 2500000,
    date: "2026-05-15 09:15",
    status: "Success",
    package: "Gold Job Post Package (10 Posts)"
  },
  {
    id: "TXN-73912",
    user: "Trần Thị B",
    email: "thib@gmail.com",
    type: "Candidate Upgrade",
    amount: 199000,
    date: "2026-05-14 18:40",
    status: "Failed",
    package: "Premium Member 1 Month"
  },
  {
    id: "TXN-73913",
    user: "Hoàng Văn E",
    email: "vane@vinagroup.com",
    type: "Recruiter Bundle",
    amount: 4900000,
    date: "2026-05-13 11:20",
    status: "Success",
    package: "Diamond Recruiter Pack (Unlimited)"
  },
  {
    id: "TXN-73914",
    user: "Vũ Thị F",
    email: "vuthif@outlook.com",
    type: "Candidate Upgrade",
    amount: 199000,
    date: "2026-05-12 08:05",
    status: "Success",
    package: "Premium Member 1 Month"
  }
];

export const mockAISettings = {
  model: "gpt-4o",
  temperature: 0.7,
  maxTokens: 2048,
  promptCV: `You are an expert ATS (Applicant Tracking System) and professional Resume Parser. 
Extract: Full Name, Email, Phone, Socials, Skills (Languages, Frameworks, databases, tools), Education (University, Degree, Year), Work Experience (Company, Title, Duration, Achievements), and Project details.
Output must be in structured JSON format with absolute accuracy.`,
  promptReview: `You are an elite Tech recruiter and professional CV Coach. 
Analyze the provided CV against the Job Description (JD). 
Give a rating out of 100 based on keyword match, experience depth, skill compatibility, and formatting.
Provide 3 actionable tips to improve the resume for this specific role.`,
  promptInterview: `You are a Senior Technical Interviewer. 
Based on the candidate's CV and the target role, conduct a realistic job interview.
Ask 1 welcoming question, followed by 3 core technical questions, 1 behavioral question, and 1 wrapping-up question.
Evaluate each response based on accuracy, problem-solving depth, and communication skills.`
};

export const mockSystemSettings = {
  maintenanceMode: false,
  siteName: "MockAI",
  version: "1.2.0"
};
