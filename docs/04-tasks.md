# 04. Tasks — MVP 작업 계획

## 진행 규칙

> 1. **순서대로만** 진행한다. 앞 단계가 완료되지 않으면 다음 단계로 넘어가지 않는다.
> 2. **병렬 금지** — 두 단계를 동시에 진행하지 않는다.
> 3. **단계별 검증 필수** — 검증 방법을 직접 실행하고 통과한 뒤 체크한다.
> 4. **확장 단계 제외** — 확장(JWT, 팀, Kanban, 채팅, CI/CD)은 별도 문서에서 다룬다.

---

## Phase 1 — 설계 `✅ 완료`

> CLAUDE.md 및 docs/ 6종 문서 작성

| # | 작업 | 검증 방법 |
|---|---|---|
| 1-01 | `CLAUDE.md` 작성 (역할·규칙·절차 정의) | 파일 존재 확인 + 5개 절대 규칙 포함 여부 육안 확인 |
| 1-02 | `docs/00-overview.md` 작성 (문서 구조 안내) | 6개 파일 매핑표 및 읽는 순서 포함 여부 확인 |
| 1-03 | `docs/01-product.md` 작성 (제품 정의·페르소나·MVP 범위) | 성공 기준 5개 항목 포함 여부 확인 |
| 1-04 | `docs/02-specs.md` 작성 (데이터 모델·API 명세·화면 명세) | Task 모델 7개 필드, REST API 5개 엔드포인트 포함 여부 확인 |
| 1-05 | `docs/03-design.md` 작성 (8대 설계 결정·의존성 정책) | 8개 결정 항목 및 의존성 추가 정책 포함 여부 확인 |
| 1-06 | `docs/04-tasks.md` 작성 (본 문서 — 3 Phase 체크리스트) | Phase 1·2·3 체크리스트 존재 여부 확인 |
| 1-07 | `docs/05-conventions.md` 작성 (네이밍·커밋 컨벤션) | 파일 존재 확인 |
| 1-08 | GitHub 원격 저장소 연결 (`origin` 설정) | `git remote -v` 에서 origin URL 확인 |
| 1-09 | 전체 docs/ 파일 커밋 및 push | `git log --oneline` 에서 각 docs 커밋 확인 |
| 1-10 | Phase 1 최종 검토 — docs/ 6개 파일 모두 GitHub에 존재 | GitHub 저장소 파일 목록 육안 확인 |

---

## Phase 2 — 백엔드

> `backend/` 디렉토리에 FastAPI 서버 구축 및 CRUD API 5개 완성

| # | 작업 | 검증 방법 |
|---|---|---|
| 2-01 | `backend/` 폴더 생성 및 Python 가상환경 구성 (`venv`) | `python -m venv venv` 실행 후 `venv/` 폴더 존재 확인 |
| 2-02 | 의존성 설치 — FastAPI, Uvicorn, SQLAlchemy, python-dotenv | `pip freeze` 에서 4개 패키지 확인 |
| 2-03 | `requirements.txt` 생성 | `pip freeze > requirements.txt` 후 파일 내용 확인 |
| 2-04 | `.env` 파일 및 `DATABASE_URL` 환경 변수 설정 | `.env` 파일에 `DATABASE_URL=sqlite:///./taskflow.db` 존재 확인 |
| 2-05 | SQLAlchemy `Task` 모델 정의 (7개 필드) | `backend/models.py` 에 id·title·description·status·due_at·created_at·updated_at 확인 |
| 2-06 | DB 테이블 자동 생성 (`create_all`) | 서버 실행 후 `taskflow.db` 파일 생성 확인 |
| 2-07 | `POST /api/tasks` 구현 (201 반환) | `curl -X POST` 또는 Swagger UI에서 201 응답 확인 |
| 2-08 | `GET /api/tasks`, `GET /api/tasks/{id}` 구현 | Swagger UI에서 목록·단건 200 응답 및 description 포함 여부 확인 |
| 2-09 | `PUT /api/tasks/{id}`, `DELETE /api/tasks/{id}` 구현 | Swagger UI에서 PUT 200, DELETE 204 응답 확인 |
| 2-10 | 입력 검증 확인 (400 / 404) 및 CORS 설정 | title 빈값 → 400, 없는 id → 404, 브라우저에서 CORS 오류 없음 확인 |

---

## Phase 3 — 프론트엔드

> `frontend/` 디렉토리에 HTML + Vanilla JS + Tailwind CDN으로 UI 구현 및 API 연결

| # | 작업 | 검증 방법 |
|---|---|---|
| 3-01 | `frontend/` 폴더 생성 및 `index.html` 기본 구조 작성 (Tailwind CDN 포함) | 브라우저에서 파일 열어 빈 화면 렌더링 확인 |
| 3-02 | 라이트/다크 테마 토글 구현 (`localStorage` + `prefers-color-scheme` 초기값) | 토글 클릭 후 새로고침해도 테마 유지 확인 |
| 3-03 | 태스크 추가 폼 구현 (title / due_at / status 입력) | 폼 제출 시 `POST /api/tasks` 호출 후 201 응답 확인 |
| 3-04 | 태스크 목록 카드 렌더링 (status 배지 + `D-N HH:MM` 표시) | `GET /api/tasks` 호출 후 카드 목록 화면 표시 확인 |
| 3-05 | 수정 모달 구현 (카드 클릭 → 모달 → `PUT /api/tasks/{id}`) | 수정 후 목록에서 변경 내용 반영 확인 |
| 3-06 | 삭제 구현 (휴지통 클릭 → 확인 다이얼로그 → `DELETE /api/tasks/{id}`) | 삭제 후 카드 목록에서 제거 확인 |
| 3-07 | 폴링 3초 구현 (`setInterval` → `GET /api/tasks`) | 다른 탭에서 추가한 태스크가 3초 내 자동 반영 확인 |
| 3-08 | 모바일 360px 레이아웃 확인 및 최종 git push | Chrome DevTools 360px 뷰에서 깨짐 없음 + GitHub push 완료 확인 |

---

## 완료 기준 요약

| Phase | 완료 조건 |
|---|---|
| Phase 1 | docs/ 6개 파일 GitHub에 존재 |
| Phase 2 | Swagger UI(`/docs`)에서 CRUD 5개 API 모두 정상 동작 |
| Phase 3 | 브라우저에서 CRUD 4종 화면 동작 + 360px 깨짐 없음 + GitHub push 완료 |
