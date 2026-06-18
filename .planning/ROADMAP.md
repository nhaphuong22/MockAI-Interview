# Roadmap: MockAI-Interview

**Last Updated:** 2026-06-18
**Current Milestone:** v5.0 HR Dashboard Enhancements & Job-grouped Applications

## Milestones

- ✅ **v1.0 MVP Core** - Phases 1-3 (Shipped 2026-06-11)
- ✅ **v3.0 Extended AI Room** - Phases 03.2, 5 (Shipped 2026-06-13)
- ✅ **v4.0 Job Search & Application UI** - Phase 6 (Shipped 2026-06-18)
- 🚧 **v5.0 HR Dashboard Enhancements** - Phase 7 (In progress)

---

## Phases

### 🚧 v5.0 HR Dashboard Enhancements (In Progress)

**Milestone Goal:** Hiển thị chi tiết thông tin cá nhân tùy chỉnh của ứng viên trên giao diện HR, đồng thời cấu trúc lại giao diện quản lý của nhà tuyển dụng để gom nhóm các đơn ứng tuyển theo từng tin tuyển dụng mà HR đã đăng.

#### Phase 7: HR Dashboard Refactoring & Grouped Applications

*   **Goal:** Cấu trúc lại giao diện quản lý của HR để hiển thị đơn ứng tuyển theo Job và hiển thị thông tin ứng viên chi tiết trong modal.
*   **Depends on:** Phase 6, Phase 2
*   **Requirements:** HR-04, HR-05, HR-06
*   **Plans:** 0/1 plans complete
*   **Success Criteria:**
    1. HR Dashboard hiển thị đúng danh sách Job của HR hiện tại đã đăng nhập.
    2. Chọn Job cụ thể hiển thị đúng danh sách ứng viên đã nộp đơn cho Job đó.
    3. Modal chi tiết ứng viên hiển thị chính xác Họ tên, Email, Số điện thoại, link Portfolio tùy chỉnh từ bảng `applications`.
    4. API backend hỗ trợ lọc đơn tuyển theo `jobId` và đảm bảo an toàn phân quyền `hrId`.

---

## Progress

| Phase | Milestone | Plans Complete | Status | Completed |
|-------|-----------|----------------|--------|-----------|
| 1. Luồng Ứng Tuyển & ATS | v1.0 | 0/0 | Complete | 2026-06-11 |
| 2. HR Dashboard | v1.0 | 0/0 | Complete | 2026-06-11 |
| 3. Phòng Phỏng Vấn 3D | v1.0 | 0/0 | Complete | 2026-06-11 |
| 03.2. Tìm kiếm mô hình 3D | v3.0 | 1/1 | Complete | 2026-06-13 |
| 5. Eye-Tracking AI | v3.0 | 1/1 | Complete | 2026-06-13 |
| 6. Jobs UI & Apply Form | v4.0 | 1/1 | Complete | 2026-06-18 |
| 7. HR Grouped Applications | v5.0 | 0/1 | Planned | |
