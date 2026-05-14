# 03. Design — 기술 설계 결정

## 8대 설계 결정

| # | 항목 | 선택 | 대안 | 근거 | 트레이드오프 |
|---|---|---|---|---|---|
| 1 | 백엔드 | **FastAPI** | Django, Express | 비동기 지원, 자동 OpenAPI 문서, Python 생태계와 SQLAlchemy 조합이 가장 가볍고 빠름 | Django보다 내장 기능 적음. 미들웨어·인증은 직접 구성 필요 |
| 2 | 프론트엔드 | **Vanilla JS + Tailwind CDN** | React, Vue | 빌드 도구 없이 즉시 실행 가능. 학습 곡선 없음. MVP 규모에서 프레임워크 오버헤드 불필요 | 컴포넌트 재사용성 낮음. 규모 커지면 React 마이그레이션 필요 |
| 3 | DB | **SQLite → PostgreSQL** + SQLAlchemy | MySQL, MongoDB | SQLite로 로컬 개발 후 PostgreSQL로 전환. SQLAlchemy ORM이 DB 교체를 추상화 | SQLite는 동시 쓰기 제한. 배포 시 PostgreSQL로 전환 필수 |
| 4 | CSS | **Tailwind만** (styled-components 금지) | CSS Modules, styled-components | 유틸리티 클래스로 HTML에서 스타일 확인 가능. CDN으로 빌드 없이 사용 | 클래스가 길어져 가독성 저하 가능. 커스텀 값은 `tailwind.config.js` 필요 |
| 5 | 실시간 | **폴링 3초** (MVP) → WebSocket (확장) | SSE, WebSocket | MVP에서 복잡도 최소화. 3초 폴링으로 UX 충분. WebSocket은 인프라 비용 증가 | 3초 지연 존재. 동시 사용자 증가 시 서버 부하 상승 |
| 6 | 상태관리 | **모듈 변수 + DOM 직접 갱신** | Redux, Zustand, Pinia | 프레임워크 없는 환경에서 가장 단순한 방식. 의존성 0 | 상태가 분산되면 추적 어려움. 규모 커지면 단방향 흐름 도입 필요 |
| 7 | 디자인 시스템 | **macOS UI 톤** | Material Design, Ant Design | 팀리더 페르소나(Mac 사용자)에 친숙. 외부 컴포넌트 라이브러리 없이 Tailwind 토큰으로 구현 | 커스텀 구현이므로 초기 비용 존재. 접근성(ARIA) 직접 챙겨야 함 |
| 8 | 테마 | **라이트/다크 토글** (`dark:` 변형 + localStorage) | OS 테마만 따름, CSS 변수 방식 | Tailwind `dark:` 클래스로 단일 파일에서 양쪽 스타일 관리. 사용자 선택 유지 | 클래스 양이 약 2배. 초기 깜빡임(FOUC) 방지 스크립트 필요 |

---

## 디자인 토큰 (macOS UI 톤)

| 토큰 | Tailwind 클래스 | 용도 |
|---|---|---|
| 둥근 모서리 | `rounded-xl` (12px) | 카드, 버튼, 인풋 |
| 그림자 | `shadow-lg` | 카드, 모달 |
| 반투명 배경 | `backdrop-blur-md` + `bg-white/70` | 카드, 헤더 |
| 시스템 폰트 | `font-sans` (`-apple-system, BlinkMacSystemFont, 'Segoe UI'`) | 전체 기본 폰트 |
| 터치 타깃 | `min-h-[44px] min-w-[44px]` | 버튼, 아이콘 버튼 |

---

## 테마 구현 방식

```html
<!-- index.html head — FOUC 방지: DOM 로드 전 클래스 적용 -->
<script>
  const saved = localStorage.getItem('theme');
  const prefer = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  document.documentElement.classList.toggle('dark', (saved ?? prefer) === 'dark');
</script>
```

- 초기값: `localStorage('theme')` 우선, 없으면 `prefers-color-scheme` 따름
- 토글 시: `document.documentElement.classList.toggle('dark')` + `localStorage` 저장
- Tailwind 설정: `darkMode: 'class'`

---

## 의존성 추가 정책

> **새 라이브러리·패키지 도입 전, 이 파일(`03-design.md`)에 아래 항목을 먼저 기록해야 한다.**
> 기록 없이 `import` 또는 `<script src>` 추가는 금지한다.

기록 형식:

```
| 패키지명 | 도입 사유 | 대안 검토 결과 | 승인 여부 |
```

| 패키지명 | 도입 사유 | 대안 검토 결과 | 승인 여부 |
|---|---|---|---|
| (현재 없음) | — | — | — |
