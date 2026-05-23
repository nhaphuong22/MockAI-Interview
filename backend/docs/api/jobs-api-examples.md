# Test Jobs API

## 1. Login để lấy token

```bash
POST http://localhost:5000/api/auth/login
Content-Type: application/json

{
  "email": "recruiter@mockai.com",
  "password": "123456"
}
```

**Response:** Copy `token` từ response để dùng cho các request tiếp theo.

---

## 2. Create Job (POST /api/jobs)

```bash
POST http://localhost:5000/api/jobs
Content-Type: application/json
Authorization: Bearer YOUR_TOKEN_HERE

{
  "title": "Senior Frontend Developer",
  "description": "We are looking for an experienced frontend developer to join our team. You will be responsible for building modern web applications using React and related technologies.",
  "requirements": "3+ years of React experience, strong JavaScript skills, experience with state management",
  "status": "OPEN",
  "company_id": 1,
  "category_id": 1,
  "location_id": 1,
  "job_type_id": 1,
  "experience_level": "SENIOR",
  "salary_min": 20000000,
  "salary_max": 35000000,
  "salary_currency": "VND",
  "is_salary_visible": true,
  "vacancy_count": 2,
  "deadline": "2026-06-30T23:59:59Z",
  "skill_ids": [1, 2, 3],
  "job_requirements": [
    {
      "requirement_type": "EDUCATION",
      "description": "Bachelor's degree in Computer Science or related field",
      "is_required": true,
      "priority": 1
    },
    {
      "requirement_type": "EXPERIENCE",
      "description": "3+ years of professional experience with React",
      "is_required": true,
      "priority": 2
    },
    {
      "requirement_type": "SKILL",
      "description": "Strong proficiency in JavaScript, HTML, CSS",
      "is_required": true,
      "priority": 3
    },
    {
      "requirement_type": "SKILL",
      "description": "Experience with TypeScript",
      "is_required": false,
      "priority": 4
    },
    {
      "requirement_type": "LANGUAGE",
      "description": "Good English communication skills",
      "is_required": true,
      "priority": 5
    },
    {
      "requirement_type": "OTHER",
      "description": "Team player with good problem-solving skills",
      "is_required": true,
      "priority": 6
    }
  ]
}
```

---

## 3. Get All Jobs (GET /api/jobs)

```bash
# Get all jobs (no auth required)
GET http://localhost:5000/api/jobs

# With pagination
GET http://localhost:5000/api/jobs?page=1&limit=10

# With filters
GET http://localhost:5000/api/jobs?status=OPEN&experience_level=SENIOR&location_id=1

# With search
GET http://localhost:5000/api/jobs?search=frontend
```

---

## 4. Get Job by ID (GET /api/jobs/:id)

```bash
GET http://localhost:5000/api/jobs/1
```

---

## 5. Update Job (PUT /api/jobs/:id)

```bash
PUT http://localhost:5000/api/jobs/1
Content-Type: application/json
Authorization: Bearer YOUR_TOKEN_HERE

{
  "title": "Senior Frontend Developer (Updated)",
  "salary_max": 40000000,
  "job_requirements": [
    {
      "requirement_type": "EDUCATION",
      "description": "Bachelor's or Master's degree in Computer Science",
      "is_required": true,
      "priority": 1
    },
    {
      "requirement_type": "EXPERIENCE",
      "description": "5+ years of professional experience with React",
      "is_required": true,
      "priority": 2
    }
  ]
}
```

---

## 6. Delete Job (DELETE /api/jobs/:id)

```bash
DELETE http://localhost:5000/api/jobs/1
Authorization: Bearer YOUR_TOKEN_HERE
```

---

## Testing with cURL

### Create Job
```bash
curl -X POST http://localhost:5000/api/jobs \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{
    "title": "Senior Frontend Developer",
    "description": "We are looking for an experienced frontend developer",
    "requirements": "3+ years of React experience",
    "company_id": 1,
    "category_id": 1,
    "location_id": 1,
    "job_type_id": 1,
    "experience_level": "SENIOR",
    "salary_min": 20000000,
    "salary_max": 35000000,
    "job_requirements": [
      {
        "requirement_type": "EXPERIENCE",
        "description": "3+ years of React",
        "is_required": true
      }
    ]
  }'
```

### Get All Jobs
```bash
curl http://localhost:5000/api/jobs
```

### Get Job by ID
```bash
curl http://localhost:5000/api/jobs/1
```

---

## Expected Response Format

### Success Response
```json
{
  "success": true,
  "data": {
    "id": 1,
    "title": "Senior Frontend Developer",
    "description": "...",
    "requirements": [...],
    "skills": [...],
    "company_name": "...",
    "location_name": "...",
    ...
  },
  "error": null
}
```

### Error Response
```json
{
  "success": false,
  "data": null,
  "error": "Error message here"
}
```

---

## Notes

1. **Authentication Required:**
   - POST /api/jobs (Create)
   - PUT /api/jobs/:id (Update)
   - DELETE /api/jobs/:id (Delete)

2. **Public Access:**
   - GET /api/jobs (List all)
   - GET /api/jobs/:id (Get details)

3. **Authorization:**
   - Only RECRUITER and ADMIN roles can create/update/delete jobs
   - Users can only update/delete their own jobs (unless ADMIN)

4. **Job Requirements Types:**
   - EDUCATION
   - EXPERIENCE
   - SKILL
   - LANGUAGE
   - CERTIFICATE
   - OTHER
