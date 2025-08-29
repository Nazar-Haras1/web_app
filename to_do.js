document.addEventListener('DOMContentLoaded', () => {
    const addInput = document.querySelector(".add-task-input");
    const addBtn = document.querySelector(".add-task-btn");
    const taskListContainer = document.getElementById("todo-list-container");
    const filterButtons = document.querySelectorAll(".filter-btn");

    const storageKey = "myTasks";
    const categories = ["DESIGN", "PERSONAL", "HOUSE"];

    const saveTasks = (tasks) => {
        localStorage.setItem(storageKey, JSON.stringify(tasks));
    };

    const loadTasks = () => {
        return JSON.parse(localStorage.getItem(storageKey)) || {};
    };

    const renderTasks = (filter = "all") => {
        const tasks = loadTasks();
        taskListContainer.innerHTML = "";

        categories.forEach(category => {
            const categoryElement = document.createElement('div');
            categoryElement.className = 'task-category';
            categoryElement.innerHTML = `<h3 class="category-title">${category}</h3>`;

            const subcategoryList = document.createElement('ul');
            subcategoryList.className = 'task-list';
            subcategoryList.dataset.category = category; 

            const categoryTasks = tasks[category] || [];
            const filteredTasks = categoryTasks.filter(task => {
                if (filter === "all") return true;
                if (filter === "completed") return task.completed;
                if (filter === "active") return !task.completed;
                return false;
            });

            filteredTasks.forEach((task) => {
                const taskItem = document.createElement('li');
                taskItem.className = 'task-item';
                taskItem.dataset.id = task.id;
                taskItem.draggable = true; 

                taskItem.innerHTML = `
                    <input type="checkbox" class="task-checkbox" ${task.completed ? 'checked' : ''}>
                    <span class="task-text">${task.text}</span>
                    <div class="task-actions">
                        <button class="edit-btn">Редагувати</button>
                        <button class="delete-btn">Видалити</button>
                    </div>
                `;

                taskItem.addEventListener("dragstart", (e) => {
                    e.dataTransfer.setData("taskId", task.id);
                    e.dataTransfer.setData("fromCategory", category);
                });

                const checkbox = taskItem.querySelector('.task-checkbox');
                checkbox.addEventListener('change', () => {
                    const allTasks = loadTasks();
                    const targetTask = allTasks[category].find(t => t.id === task.id);
                    if (targetTask) {
                        targetTask.completed = checkbox.checked;
                        saveTasks(allTasks);
                        renderTasks(filter);
                    }
                });

                const editBtn = taskItem.querySelector('.edit-btn');
                editBtn.addEventListener('click', () => {
                    const newText = prompt("Редагувати завдання:", task.text);
                    if (newText && newText.trim() !== "") {
                        const allTasks = loadTasks();
                        const targetTask = allTasks[category].find(t => t.id === task.id);
                        if (targetTask) {
                            targetTask.text = newText.trim();
                            saveTasks(allTasks);
                            renderTasks(filter);
                        }
                    }
                });

                const deleteBtn = taskItem.querySelector('.delete-btn');
                deleteBtn.addEventListener('click', () => {
                    const allTasks = loadTasks();
                    const taskIndex = allTasks[category].findIndex(t => t.id === task.id);
                    if (taskIndex > -1) {
                        allTasks[category].splice(taskIndex, 1);
                        saveTasks(allTasks);
                        renderTasks(filter);
                    }
                });

                subcategoryList.appendChild(taskItem);
            });

            subcategoryList.addEventListener("dragover", (e) => {
                e.preventDefault();
            });

            subcategoryList.addEventListener("drop", (e) => {
                e.preventDefault();
                const taskId = e.dataTransfer.getData("taskId");
                const fromCategory = e.dataTransfer.getData("fromCategory");
                const toCategory = subcategoryList.dataset.category;

                if (fromCategory !== toCategory) {
                    const allTasks = loadTasks();

                    const taskIndex = allTasks[fromCategory].findIndex(t => t.id == taskId);
                    if (taskIndex > -1) {
                        const [movedTask] = allTasks[fromCategory].splice(taskIndex, 1);
                        if (!allTasks[toCategory]) allTasks[toCategory] = [];
                        allTasks[toCategory].push(movedTask);
                        saveTasks(allTasks);
                        renderTasks(filter);
                    }
                }
            });

            if (subcategoryList.children.length > 0) {
                categoryElement.appendChild(subcategoryList);
                taskListContainer.appendChild(categoryElement);
            }
        });
    };

    addBtn.addEventListener('click', () => {
        const text = addInput.value.trim();
        if (text === "") return;

        const category = prompt("До якої категорії додати завдання? (" + categories.join(', ') + ")");
        if (!category || !categories.includes(category.toUpperCase())) {
            alert("Невірна категорія. Спробуйте ще раз.");
            return;
        }

        const tasks = loadTasks();
        const upperCaseCategory = category.toUpperCase();
        if (!tasks[upperCaseCategory]) {
            tasks[upperCaseCategory] = [];
        }

        tasks[upperCaseCategory].push({
            id: Date.now(),
            text: text,
            completed: false
        });

        saveTasks(tasks);
        addInput.value = "";

        const currentFilterBtn = document.querySelector('.filter-btn.active');
        const currentFilter = currentFilterBtn ? currentFilterBtn.id.replace('filter-', '') : 'all';
        renderTasks(currentFilter);
    });

    filterButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            filterButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            const filterType = btn.id.replace('filter-', '');
            renderTasks(filterType);
        });
    });

    renderTasks();
});
