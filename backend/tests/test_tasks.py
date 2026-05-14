import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from main import app
from database import Base, get_db

# StaticPool: 인메모리 SQLite에서 모든 세션이 동일 커넥션 공유
engine = create_engine(
    "sqlite:///:memory:",
    connect_args={"check_same_thread": False},
    poolclass=StaticPool,
)
TestingSession = sessionmaker(autocommit=False, autoflush=False, bind=engine)


def override_get_db():
    db = TestingSession()
    try:
        yield db
    finally:
        db.close()


@pytest.fixture(autouse=True)
def setup_db():
    Base.metadata.create_all(bind=engine)
    app.dependency_overrides[get_db] = override_get_db
    yield
    Base.metadata.drop_all(bind=engine)
    app.dependency_overrides.clear()


@pytest.fixture
def client():
    return TestClient(app)


# ── 헬퍼 ──────────────────────────────────────────────

def create_sample(client, title="샘플 태스크", status="todo", due_at=None):
    body = {"title": title, "status": status}
    if due_at:
        body["due_at"] = due_at
    return client.post("/api/tasks", json=body)


# ── POST /api/tasks ────────────────────────────────────

class TestCreateTask:
    def test_성공_201(self, client):
        r = create_sample(client)
        assert r.status_code == 201
        data = r.json()
        assert data["id"] is not None
        assert data["title"] == "샘플 태스크"
        assert data["status"] == "todo"

    def test_due_at_포함_201(self, client):
        r = create_sample(client, due_at="2026-05-12T18:00:00Z")
        assert r.status_code == 201
        assert r.json()["due_at"] is not None

    def test_title_빈값_400(self, client):
        r = client.post("/api/tasks", json={"title": ""})
        assert r.status_code == 400

    def test_title_누락_400(self, client):
        r = client.post("/api/tasks", json={"status": "todo"})
        assert r.status_code == 400

    def test_title_200자_초과_400(self, client):
        r = client.post("/api/tasks", json={"title": "a" * 201})
        assert r.status_code == 400

    def test_status_잘못된값_400(self, client):
        r = client.post("/api/tasks", json={"title": "테스트", "status": "invalid"})
        assert r.status_code == 400


# ── GET /api/tasks ─────────────────────────────────────

class TestListTasks:
    def test_목록_200(self, client):
        create_sample(client, "태스크1")
        create_sample(client, "태스크2")
        r = client.get("/api/tasks")
        assert r.status_code == 200
        assert len(r.json()) == 2

    def test_목록_description_미포함(self, client):
        create_sample(client)
        r = client.get("/api/tasks")
        assert "description" not in r.json()[0]

    def test_빈목록_200(self, client):
        r = client.get("/api/tasks")
        assert r.status_code == 200
        assert r.json() == []


# ── GET /api/tasks/{id} ────────────────────────────────

class TestGetTask:
    def test_단건_200(self, client):
        task_id = create_sample(client).json()["id"]
        r = client.get(f"/api/tasks/{task_id}")
        assert r.status_code == 200
        assert r.json()["id"] == task_id

    def test_단건_description_포함(self, client):
        task_id = create_sample(client).json()["id"]
        r = client.get(f"/api/tasks/{task_id}")
        assert "description" in r.json()

    def test_없는_id_404(self, client):
        r = client.get("/api/tasks/99999")
        assert r.status_code == 404


# ── PUT /api/tasks/{id} ────────────────────────────────

class TestUpdateTask:
    def test_상태변경_200(self, client):
        task_id = create_sample(client).json()["id"]
        r = client.put(f"/api/tasks/{task_id}", json={"status": "in_progress"})
        assert r.status_code == 200
        assert r.json()["status"] == "in_progress"

    def test_부분수정_기존값_유지(self, client):
        task_id = create_sample(client, "원래 제목").json()["id"]
        r = client.put(f"/api/tasks/{task_id}", json={"status": "done"})
        assert r.json()["title"] == "원래 제목"

    def test_title_빈값_400(self, client):
        task_id = create_sample(client).json()["id"]
        r = client.put(f"/api/tasks/{task_id}", json={"title": ""})
        assert r.status_code == 400

    def test_없는_id_404(self, client):
        r = client.put("/api/tasks/99999", json={"status": "done"})
        assert r.status_code == 404


# ── DELETE /api/tasks/{id} ─────────────────────────────

class TestDeleteTask:
    def test_삭제_204(self, client):
        task_id = create_sample(client).json()["id"]
        r = client.delete(f"/api/tasks/{task_id}")
        assert r.status_code == 204

    def test_삭제후_404(self, client):
        task_id = create_sample(client).json()["id"]
        client.delete(f"/api/tasks/{task_id}")
        r = client.get(f"/api/tasks/{task_id}")
        assert r.status_code == 404

    def test_없는_id_404(self, client):
        r = client.delete("/api/tasks/99999")
        assert r.status_code == 404
