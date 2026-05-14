const API_BASE = 'http://127.0.0.1:8000/api/tasks';

// 상태 — 모듈 변수로 관리
let tasks = [];
let pollingTimer = null;

// ── 유틸 ──────────────────────────────────────────────

const STATUS_LABEL = { todo: '할 일', in_progress: '진행 중', done: '완료' };
const STATUS_COLOR = {
  todo:        'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300',
  in_progress: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300',
  done:        'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300',
};

function formatDueAt(dueAtStr) {
  if (!dueAtStr) return null;
  const due = new Date(dueAtStr);
  const now = new Date();
  const dueDay = new Date(due.getFullYear(), due.getMonth(), due.getDate());
  const nowDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const diff = Math.round((dueDay - nowDay) / 86400000);
  const h = String(due.getHours()).padStart(2, '0');
  const m = String(due.getMinutes()).padStart(2, '0');
  const time = `${h}:${m}`;

  if (diff > 0)  return { text: `D-${diff} ${time}`, cls: 'text-gray-500 dark:text-gray-400' };
  if (diff === 0) return { text: `D-0 ${time}`,  cls: 'text-red-500 dark:text-red-400 font-semibold' };
  return           { text: `D+${Math.abs(diff)} ${time}`, cls: 'text-gray-400 dark:text-gray-500 line-through' };
}

// datetime-local 인풋 ↔ ISO 8601 변환
function toLocalDatetimeValue(isoStr) {
  if (!isoStr) return '';
  const d = new Date(isoStr);
  const pad = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function toISOString(localValue) {
  if (!localValue) return null;
  return new Date(localValue).toISOString();
}

// ── API ───────────────────────────────────────────────

async function apiFetch(path, options = {}) {
  const res = await fetch(API_BASE + path, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  if (res.status === 204) return null;
  if (!res.ok) throw new Error(`API ${res.status}`);
  return res.json();
}

async function fetchTasks() {
  tasks = await apiFetch('');
  renderTasks();
}

async function createTask(data) {
  await apiFetch('', { method: 'POST', body: JSON.stringify(data) });
  await fetchTasks();
}

async function updateTask(id, data) {
  await apiFetch(`/${id}`, { method: 'PUT', body: JSON.stringify(data) });
  await fetchTasks();
}

async function deleteTask(id) {
  await apiFetch(`/${id}`, { method: 'DELETE' });
  await fetchTasks();
}

// ── 렌더링 ────────────────────────────────────────────

function renderTasks() {
  const list = document.getElementById('task-list');
  const empty = document.getElementById('empty-msg');
  const count = document.getElementById('task-count');

  count.textContent = tasks.length ? `${tasks.length}개` : '';

  if (!tasks.length) {
    list.innerHTML = '';
    empty.classList.remove('hidden');
    return;
  }
  empty.classList.add('hidden');
  list.innerHTML = tasks.map(renderCard).join('');

  // 카드 본문 클릭 → 수정 모달
  list.querySelectorAll('.card-body').forEach((el) => {
    el.addEventListener('click', () => openModal(Number(el.dataset.id)));
  });
  // 휴지통 클릭 → 삭제
  list.querySelectorAll('.btn-delete').forEach((el) => {
    el.addEventListener('click', async (e) => {
      e.stopPropagation();
      if (confirm('정말 삭제할까요?')) await deleteTask(Number(el.dataset.id));
    });
  });
}

function renderCard(task) {
  const due = formatDueAt(task.due_at);
  const badge = `<span class="inline-flex items-center px-2 py-0.5 rounded-lg text-xs font-medium ${STATUS_COLOR[task.status]}">${STATUS_LABEL[task.status]}</span>`;
  const dueHtml = due
    ? `<span class="text-xs ${due.cls}">${due.text}</span>`
    : '';

  return `
    <div class="backdrop-blur-md bg-white/70 dark:bg-gray-800/70 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 flex items-center gap-3 px-4 py-3 cursor-pointer hover:shadow-xl transition-shadow group">
      <div class="card-body flex-1 min-w-0 flex flex-col gap-1" data-id="${task.id}">
        <div class="flex items-center gap-2 flex-wrap">
          ${badge}
          ${dueHtml}
        </div>
        <p class="text-sm font-medium truncate">${escHtml(task.title)}</p>
      </div>
      <button
        class="btn-delete min-w-[44px] min-h-[44px] flex items-center justify-center rounded-xl text-gray-300 dark:text-gray-600 hover:text-red-400 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors opacity-0 group-hover:opacity-100"
        data-id="${task.id}"
        aria-label="삭제"
      >🗑</button>
    </div>`;
}

function escHtml(str) {
  return str.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

// ── 모달 ──────────────────────────────────────────────

function openModal(id) {
  const task = tasks.find((t) => t.id === id);
  if (!task) return;

  document.getElementById('edit-id').value = id;
  document.getElementById('edit-title').value = task.title;
  document.getElementById('edit-description').value = task.description ?? '';
  document.getElementById('edit-due-at').value = toLocalDatetimeValue(task.due_at);
  document.getElementById('edit-status').value = task.status;
  document.getElementById('modal').classList.remove('hidden');
}

function closeModal() {
  document.getElementById('modal').classList.add('hidden');
}

// ── 이벤트 ────────────────────────────────────────────

document.getElementById('add-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  const title = document.getElementById('add-title').value.trim();
  if (!title) return;
  await createTask({
    title,
    status: document.getElementById('add-status').value,
    due_at: toISOString(document.getElementById('add-due-at').value),
  });
  e.target.reset();
});

document.getElementById('edit-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  const id = Number(document.getElementById('edit-id').value);
  await updateTask(id, {
    title: document.getElementById('edit-title').value.trim(),
    description: document.getElementById('edit-description').value || null,
    status: document.getElementById('edit-status').value,
    due_at: toISOString(document.getElementById('edit-due-at').value),
  });
  closeModal();
});

document.getElementById('modal-cancel').addEventListener('click', closeModal);
document.getElementById('modal-backdrop').addEventListener('click', closeModal);

// 테마 토글
const themeBtn = document.getElementById('theme-toggle');
function applyTheme(dark) {
  document.documentElement.classList.toggle('dark', dark);
  localStorage.setItem('theme', dark ? 'dark' : 'light');
  themeBtn.textContent = dark ? '☀️' : '🌙';
}
themeBtn.addEventListener('click', () => {
  applyTheme(!document.documentElement.classList.contains('dark'));
});
// 초기 아이콘 동기화
applyTheme(document.documentElement.classList.contains('dark'));

// ── 폴링 3초 ──────────────────────────────────────────

async function startPolling() {
  await fetchTasks();
  pollingTimer = setInterval(fetchTasks, 3000);
}

startPolling();
