const form = document.getElementById('todo-form');
const taskInput = document.getElementById('task-input');
const dateInput = document.getElementById('date-input');
const categoryInput = document.getElementById('category-input');
const todoList = document.getElementById('todo-list');
const deleteAllBtn = document.getElementById('delete-all-btn');
const resetFilterBtn = document.getElementById('reset-filter-btn');
const filterDateBtn = document.getElementById('filter-date');
const filterCategoryBtn = document.getElementById('filter-category');
const filterTaskBtn = document.getElementById('filter-task');

// Capitalize first letter while typing
taskInput.addEventListener('input', () => {
  const value = taskInput.value;
  if (value.length > 0) {
    taskInput.value = value.charAt(0).toUpperCase() + value.slice(1);
  }
});

// Load tasks from localStorage
window.addEventListener('load', () => {
  const savedTasks = JSON.parse(localStorage.getItem('todos')) || [];
  savedTasks.forEach(task => addTaskToDOM(task.text, task.date, task.category, task.done));
});

// Add new task func and validate input
form.addEventListener('submit', (e) => {
  e.preventDefault();
  let task = taskInput.value.trim();
  const date = dateInput.value;
  const category = categoryInput.value;

  // Validate inputs
  if (!task || !date || !category) {
    alert('Isi semua kolom termasuk kategori!');
    return;
  }

  // Capitalize first letter of task
  task = task.charAt(0).toUpperCase() + task.slice(1);

  addTaskToDOM(task, date, category, false);
  saveTask(task, date, category, false);
  form.reset(); //mengosongkan form setelah submit
});

function addTaskToDOM(task, date, category, done) {
  const li = document.createElement('li');
  li.draggable = true;
  li.setAttribute('data-category', category);
  li.setAttribute('data-date', date);
  if (done) li.classList.add('done');

  // isi konten li
  const span = document.createElement('span');
  span.innerHTML = `<strong>${category}</strong> | ${task} - ${date}`;

  // tombol done
  const doneBtn = document.createElement('button');
  doneBtn.textContent = 'Done';
  doneBtn.className = 'done-btn';
  doneBtn.addEventListener('click', () => {
    li.classList.toggle('done');
    updateDoneStatus(task, date, category, li.classList.contains('done'));
  });

  // tombol delete
  const deleteBtn = document.createElement('button');
  deleteBtn.textContent = 'Delete';
  deleteBtn.className = 'delete-btn';
  deleteBtn.addEventListener('click', () => {
    li.remove();
    removeTask(task, date, category);
  });

  li.appendChild(span);
  li.appendChild(doneBtn);
  li.appendChild(deleteBtn);
  todoList.appendChild(li);

  // Drag and drop events
  li.addEventListener('dragstart', () => li.classList.add('dragging'));
  li.addEventListener('dragend', () => li.classList.remove('dragging'));
}

function saveTask(task, date, category, done) {
  const tasks = JSON.parse(localStorage.getItem('todos')) || [];
  tasks.push({ text: task, date: date, category: category, done: done });
  localStorage.setItem('todos', JSON.stringify(tasks));
}

function removeTask(task, date, category) {
  let tasks = JSON.parse(localStorage.getItem('todos')) || [];
  tasks = tasks.filter(t => !(t.text === task && t.date === date && t.category === category));
  localStorage.setItem('todos', JSON.stringify(tasks));
}

function updateDoneStatus(task, date, category, doneStatus) {
  let tasks = JSON.parse(localStorage.getItem('todos')) || [];
  tasks = tasks.map(t => {
    if (t.text === task && t.date === date && t.category === category) {
      t.done = doneStatus;
    }
    return t;
  });
  localStorage.setItem('todos', JSON.stringify(tasks));
}

deleteAllBtn.addEventListener('click', () => {
  todoList.innerHTML = '';
  localStorage.removeItem('todos');
});

resetFilterBtn.addEventListener('click', () => {
  const items = todoList.querySelectorAll('li');
  items.forEach(item => {
    item.style.display = 'flex';
  });
});

filterDateBtn.addEventListener('click', () => {
  const dateKeyword = prompt('Masukkan tanggal (yyyy-mm-dd):');
  const items = todoList.querySelectorAll('li');
  items.forEach(item => {
    item.style.display = item.getAttribute('data-date') === dateKeyword ? 'flex' : 'none';
  });
});

filterCategoryBtn.addEventListener('click', () => {
  const categoryKeyword = prompt('Masukkan kategori (General, Chore, School):').toLowerCase();
  const items = todoList.querySelectorAll('li');
  items.forEach(item => {
    const itemCategory = item.getAttribute('data-category').toLowerCase();
    item.style.display = itemCategory === categoryKeyword ? 'flex' : 'none';
  });
});


filterTaskBtn.addEventListener('click', () => {
  const taskKeyword = prompt('Masukkan kata kunci tugas:').toLowerCase();
  const items = todoList.querySelectorAll('li');
  items.forEach(item => {
    item.style.display = item.textContent.toLowerCase().includes(taskKeyword) ? 'flex' : 'none';
  });
});

// Drag and drop reorder
todoList.addEventListener('dragover', (e) => {
  e.preventDefault();
  const dragging = document.querySelector('.dragging');
  const afterElement = getDragAfterElement(todoList, e.clientY);
  if (afterElement == null) {
    todoList.appendChild(dragging);
  } else {
    todoList.insertBefore(dragging, afterElement);
  }
});

// fungsi bantu untuk drag and drop
function getDragAfterElement(container, y) {
  const draggableElements = [...container.querySelectorAll('li:not(.dragging)')];
  return draggableElements.reduce((closest, child) => {
    const box = child.getBoundingClientRect();
    const offset = y - box.top - box.height / 2;
    if (offset < 0 && offset > closest.offset) {
      return { offset: offset, element: child };
    } else {
      return closest;
    }
  }, { offset: Number.NEGATIVE_INFINITY }).element;
}
