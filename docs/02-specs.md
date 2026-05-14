# 02. Specs — 기술 명세

## Task 데이터 모델

### 필드 정의

| 필드명 | 타입 | 필수 | 기본값 | 설명 |
|---|---|---|---|---|
| `id` | INTEGER (PK, AUTO INCREMENT) | ✅ | — | 고유 식별자 |
| `title` | VARCHAR(200) | ✅ | — | 태스크 제목 |
| `description` | TEXT | ❌ | NULL | 상세 설명 |
| `status` | ENUM | ✅ | `todo` | 진행 상태 |
| `due_at` | DATETIME (UTC) | ❌ | NULL | 마감 시각 |
| `created_at` | DATETIME (UTC) | ✅ | 자동 생성 | 생성 시각 |
| `updated_at` | DATETIME (UTC) | ✅ | 자동 갱신 | 최종 수정 시각 |

### status ENUM 값

| 값 | 화면 표시 |
|---|---|
| `todo` | 할 일 |
| `in_progress` | 진행 중 |
| `done` | 완료 |

---

## 입력 검증 규칙

| 조건 | HTTP 응답 |
|---|---|
| `title` 누락 또는 빈 문자열 | `400 Bad Request` |
| `title` 200자 초과 | `400 Bad Request` |
| `status` 가 ENUM 외 값 | `400 Bad Request` |
| `due_at` 가 ISO 8601 형식이 아닌 경우 | `400 Bad Request` |
| 존재하지 않는 `id` 요청 | `404 Not Found` |

### due_at 허용 형식 (ISO 8601)

```
2026-05-12T18:00:00Z        # UTC 명시
2026-05-12T18:00:00+09:00   # 타임존 오프셋
```

저장 시 UTC로 변환하여 DB에 보관한다.

---

## REST API 명세

### 공통

- Base URL: `/api/tasks`
- Content-Type: `application/json`
- 에러 응답 형식:

```json
{
  "error": "에러 메시지"
}
```

---

### 1. 태스크 생성

```
POST /api/tasks
```

**Request Body**

```json
{
  "title": "디자인 시안 검토",
  "description": "3차 시안 피드백 정리",
  "status": "todo",
  "due_at": "2026-05-12T18:00:00Z"
}
```

**Response `201 Created`**

```json
{
  "id": 1,
  "title": "디자인 시안 검토",
  "description": "3차 시안 피드백 정리",
  "status": "todo",
  "due_at": "2026-05-12T18:00:00Z",
  "created_at": "2026-05-10T09:00:00Z",
  "updated_at": "2026-05-10T09:00:00Z"
}
```

---

### 2. 태스크 목록 조회

```
GET /api/tasks
```

> `description` 필드는 목록 응답에서 **제외**한다.

**Response `200 OK`**

```json
[
  {
    "id": 1,
    "title": "디자인 시안 검토",
    "status": "todo",
    "due_at": "2026-05-12T18:00:00Z",
    "created_at": "2026-05-10T09:00:00Z",
    "updated_at": "2026-05-10T09:00:00Z"
  }
]
```

---

### 3. 태스크 단건 조회

```
GET /api/tasks/:id
```

> `description` 필드를 **포함**하여 응답한다.

**Response `200 OK`**

```json
{
  "id": 1,
  "title": "디자인 시안 검토",
  "description": "3차 시안 피드백 정리",
  "status": "todo",
  "due_at": "2026-05-12T18:00:00Z",
  "created_at": "2026-05-10T09:00:00Z",
  "updated_at": "2026-05-10T09:00:00Z"
}
```

**Response `404 Not Found`** (존재하지 않는 id)

```json
{ "error": "Task not found" }
```

---

### 4. 태스크 수정 (부분 수정)

```
PUT /api/tasks/:id
```

전송한 필드만 갱신한다. 전송하지 않은 필드는 기존 값을 유지한다.

**Request Body** (부분 전송 허용)

```json
{
  "status": "in_progress"
}
```

**Response `200 OK`**

```json
{
  "id": 1,
  "title": "디자인 시안 검토",
  "description": "3차 시안 피드백 정리",
  "status": "in_progress",
  "due_at": "2026-05-12T18:00:00Z",
  "created_at": "2026-05-10T09:00:00Z",
  "updated_at": "2026-05-10T10:30:00Z"
}
```

---

### 5. 태스크 삭제

```
DELETE /api/tasks/:id
```

**Response `204 No Content`** (본문 없음)

**Response `404 Not Found`** (존재하지 않는 id)

```json
{ "error": "Task not found" }
```

---

## 화면 명세 (CRUD 4종)

### 추가 — 입력 폼

| 입력 요소 | 타입 | 필수 | 비고 |
|---|---|---|---|
| `title` | text input | ✅ | 최대 200자 |
| `due_at` | datetime-local input | ❌ | `YYYY-MM-DDTHH:MM` 형식 |
| `status` | select (기본: `todo`) | ✅ | todo / in_progress / done |

- 제출 시 `POST /api/tasks` 호출
- 성공 시 목록 자동 갱신

---

### 목록 — 태스크 카드

각 태스크를 카드로 표시하며 아래 정보를 포함한다.

```
┌─────────────────────────────────────┐
│ [in_progress]  디자인 시안 검토      🗑 │
│                D-2  18:00            │
└─────────────────────────────────────┘
```

| UI 요소 | 표시 규칙 |
|---|---|
| status 배지 | ENUM 값에 따라 색상 구분 |
| 마감 시각 | `D-N HH:MM` 형식 (예: `D-2 18:00`) |
| 마감 당일 | `D-0 HH:MM` 으로 표시, 붉은색 강조 |
| 마감 초과 | `D+N HH:MM` 으로 표시, 회색 처리 |
| `description` | 목록 카드에서는 표시하지 않음 |

---

### 수정 — 카드 클릭 > 모달

- 카드 본문(휴지통 아이콘 제외) 클릭 시 수정 모달 열림
- 모달에 `title`, `description`, `status`, `due_at` 수정 폼 표시
- 저장 시 `PUT /api/tasks/:id` 호출
- 성공 시 모달 닫힘 + 목록 갱신

---

### 삭제 — 휴지통 > 확인 > DELETE

1. 카드 우측 휴지통(🗑) 아이콘 클릭
2. 확인 다이얼로그 표시: "정말 삭제할까요?"
3. 확인 선택 시 `DELETE /api/tasks/:id` 호출
4. 성공(`204`) 시 목록에서 해당 카드 제거
