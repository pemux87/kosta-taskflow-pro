# 05. Conventions — 협업 규칙

## 명명 규칙 (Naming)

| 대상 | 규칙 | 예시 |
|---|---|---|
| 백엔드 변수·함수·파일 | `snake_case` | `task_id`, `get_task_list`, `task_router.py` |
| 프론트엔드 변수·함수 | `camelCase` | `taskId`, `getTaskList`, `fetchTasks` |
| 프론트엔드 컴포넌트 | `PascalCase` | `TaskCard`, `AddTaskForm`, `ThemeToggle` |
| DB 컬럼·테이블 | `snake_case` | `due_at`, `created_at`, `task` |
| 환경 변수 | `UPPER_SNAKE_CASE` | `DATABASE_URL`, `SECRET_KEY` |

**언어 원칙**
- 모든 식별자(변수명·함수명·파일명·클래스명)는 **영어**로 작성한다.
- 코드 주석은 **한국어**로 작성한다.
- 커밋 메시지 요약은 **한국어**로 작성한다.

---

## 금지 패턴 5개

| # | 금지 | 이유 | 대안 |
|---|---|---|---|
| 1 | `print()` 디버깅 | 운영 환경에 노이즈 발생, 로그 추적 불가 | `logging` 모듈 사용 (`logger.debug()`, `logger.info()`) |
| 2 | `bare except` (`except:`) | 모든 예외를 무조건 삼켜 디버깅 불가 | `except SpecificError as e:` 로 예외 명시 |
| 3 | 비밀번호·토큰 하드코딩 | 코드 유출 시 즉각 보안 사고 발생 | `.env` 파일 + `os.getenv("KEY")` 사용 |
| 4 | TypeScript `any` 타입 | 타입 안전성 상실, 컴파일 오류 미탐지 | 명시적 타입 또는 `unknown` + 타입 가드 사용 |
| 5 | CSS `!important` | 우선순위 충돌로 스타일 추적 불가 | 셀렉터 구체성(specificity) 개선 또는 Tailwind 유틸리티 조합 |

---

## 테스트 규칙

- **테스트 프레임워크**: `pytest`
- **테스트 파일 위치**: `backend/tests/test_*.py`
- **필수 케이스**: 각 API 엔드포인트마다 아래 3가지를 작성한다.

| 케이스 | 예시 |
|---|---|
| 정상 동작 | `POST /api/tasks` → 201, 응답 body에 id 포함 |
| 잘못된 입력 (400) | title 빈값 → 400 Bad Request |
| 존재하지 않는 리소스 (404) | `GET /api/tasks/99999` → 404 Not Found |

```python
# 예시 — test_tasks.py
def test_create_task_success(client):
    res = client.post("/api/tasks", json={"title": "테스트"})
    assert res.status_code == 201

def test_create_task_empty_title(client):
    res = client.post("/api/tasks", json={"title": ""})
    assert res.status_code == 400

def test_get_task_not_found(client):
    res = client.get("/api/tasks/99999")
    assert res.status_code == 404
```

---

## Git 커밋 규칙

### 타입 prefix

| 타입 | 사용 시점 |
|---|---|
| `feat` | 새 기능 추가 |
| `fix` | 버그 수정 |
| `docs` | 문서 작성·수정 |
| `refactor` | 기능 변경 없는 코드 개선 |
| `test` | 테스트 추가·수정 |
| `chore` | 빌드·설정·패키지 변경 |

### 형식

```
<타입>: <한국어 요약 (50자 이내)>
```

### 예시

```
feat: 태스크 생성 API 추가
fix: due_at 누락 시 400 미반환 오류 수정
docs: 03-design.md 의존성 정책 섹션 추가
test: POST /api/tasks 400 케이스 테스트 추가
chore: requirements.txt 업데이트
```

### 금지

- `fix bug`, `update`, `WIP` 같은 내용 없는 메시지 금지
- 한 커밋에 여러 기능 혼재 금지 — 기능 단위로 분리할 것
