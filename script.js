
/* =========================
   STATE (DATA UTAMA)
========================= */
let tasks = [];

/* ====================
   DOM ELEMENTS
==================== */
const taskInput = document.getElementById("taskInput");
const addBtn = document.getElementById("addBtn");
const taskList = document.getElementById("taskList");
const emptyMessage = document.getElementById("emptyMessage");
const prioritySelect = document.getElementById("prioritySelect");
const deadlineInput = document.getElementById("deadlineInput");
const searchInput = document.getElementById("searchInput");
const progressFill = document.getElementById("progressFill");
const progressText = document.getElementById("progressText");
const toast = document.getElementById("toast");

/* ====================
   STORAGE
==================== */
function saveTasks(){
    localStorage.setItem("tasks", JSON.stringify(tasks));
}

function loadTasks(){
    const savedTasks = localStorage.getItem("tasks");
    if(savedTasks){
        try{
            tasks = JSON.parse(savedTasks);
            renderTasks();
        }
        catch(error){
            console.error("Data lama tidak valid");
            localStorage.removeItem("tasks");
        }
    }
}

/* ====================
   TASK MANAGEMENT
==================== */
function attachTaskEvents(li){
    const deleteBtn = li.querySelector(".deleteBtn");
    const checkTask = li.querySelector(".checkTask");
    const taskSpan = li.querySelector("span");
    const editBtn = li.querySelector(".editBtn");

    deleteBtn.addEventListener("click", function(){
        const taskId = Number(li.dataset.id);
        tasks = tasks.filter(function(task){
            return task.id !== taskId;
        });
        renderTasks();
        updateTaskCount();
        updateProgress();
        saveTasks();
        showToast("Task dihapus!");
    });

    checkTask.addEventListener("change", function(){
        const taskId = Number(li.dataset.id);
        const task = tasks.find(function(task){
            return task.id === taskId;
        });
        if(task){
            task.completed = checkTask.checked;
        }
        if(checkTask.checked){
            taskSpan.style.textDecoration = "line-through";
            taskSpan.style.opacity = "0.5";
        } else{
            taskSpan.style.textDecoration = "none";
            taskSpan.style.opacity = "1";
        }
        saveTasks();
        updateProgress();
    });

    editBtn.addEventListener("click", function(){
        const newTask = prompt("Edit task:", taskSpan.textContent);
        if(newTask !== null && newTask.trim() !== ""){
            const taskId = Number(li.dataset.id);
            const task = tasks.find(function(task){
                return task.id === taskId;
            });
            if(task){
                task.text = newTask;
            }
            taskSpan.textContent = newTask;
            saveTasks();
            showToast("Task berhasil diubah!");
        }
    });
}

addBtn.addEventListener("click", function(){
    const taskText = taskInput.value;
    if(taskText.trim() === ""){
        showToast("Task tidak boleh kosong!")
        return;
    }
    const priority = prioritySelect.value;
    const deadline = deadlineInput.value;
    const task = {
        id: Date.now(),
        text: taskText,
        completed: false,
        priority: priority,
        deadline: deadline
    };
    tasks.push(task);
    renderTasks();
    showToast("Task berhasil ditambahkan!");
    taskInput.value ="";
    updateTaskCount();
    saveTasks();
});

const allBtn = document.getElementById("allBtn");
const activeBtn = document.getElementById("activeBtn");
const completedBtn = document.getElementById("completedBtn");

taskInput.addEventListener("keypress", function(event){
    if(event.key === "Enter"){
        addBtn.click();
    }
});

allBtn.addEventListener("click", function(){
    const tasks = document.querySelectorAll(".task");
    tasks.forEach(function(task){
        task.style.display = "flex";
    });
});

const darkModeBtn = document.getElementById("darkModeBtn");
darkModeBtn.addEventListener("click", function(){
    document.body.classList.toggle("dark");
    if(document.body.classList.contains("dark")){
        localStorage.setItem("darkMode", "enabled");
    } else {
        localStorage.setItem("darkMode", "disabled");
    }
});

activeBtn.addEventListener("click",function(){
    const tasks = document.querySelectorAll(".task");
    tasks.forEach(function(task){
        const checkbox = task.querySelector(".checkTask");
        if(checkbox.checked){
            task.style.display = "none";
        } else{
            task.style.display = "flex";
        }
    });
});

completedBtn.addEventListener("click", function(){
    const tasks = document.querySelectorAll(".task");
    tasks.forEach(function(task){
        const checkbox = task.querySelector(".checkTask");
        if(checkbox.checked){
            task.style.display = "flex";
        } else{
            task.style.display = "none";
        }
    });
});

/* ====================
   UI FUNCTIONS
==================== */
function updateTaskCount(){
    const totalTasks = taskList.children.length;
    document.getElementById("taskCount").textContent = `Total Tugas : ${totalTasks}`;
    if(totalTasks === 0){
        emptyMessage.style.display = "block";
    } else {
        emptyMessage.style.display = "none";
    }
}   

function updateProgress(){
    const tasks = document.querySelectorAll(".task");
    const totalTasks = tasks.length;
    const completedTasks = document.querySelectorAll(".checkTask:checked").length;

    if(totalTasks === 0){
        progressFill.style.width = "0%";
        progressText.textContent = "0% Complete";
        return;
    }

    const progress = Math.round((completedTasks/totalTasks) * 100);
    progressFill.style.width = `${progress}%`;
    progressText.textContent = `${progress}% Complete (${completedTasks}/${totalTasks})`;
}

function showToast(message){
    toast.textContent = message;
    toast.style.opacity = "1";
    setTimeout(function(){
        toast.style.opacity = "0";
    }, 2000);
}


/* ====================
   EVENT LISTENERS
==================== */

loadTasks();
if(localStorage.getItem("darkMode") === "enabled"){
    document.body.classList.add("dark");
}
updateTaskCount();
updateProgress();

searchInput.addEventListener("keyup", function(){
    const keyword = searchInput.value.toLowerCase();
    const tasks = document.querySelectorAll(".task");
    tasks.forEach(function(task){
        const text = task.innerText.toLowerCase();
        if(text.includes(keyword)){
            task.style.display = "flex";
        } else{
            task.style.display = "none";
        }
    });
});

function sortTasks(){
    const tasks = Array.from(document.querySelectorAll(".task"));
    tasks.sort(function(a, b){
        const priorityA = a.querySelector(".priority").textContent.trim();
        const priorityB = b.querySelector(".priority").textContent.trim();
        const order = {
            "High": 1,
            "Medium": 2,
            "Low": 3
        };
        return order[priorityA] - order[priorityB];
    });
    tasks.forEach(function(task){
        taskList.appendChild(task);
    });
}

function renderTasks(){
    taskList.innerHTML = "";
    tasks.forEach(function(task){
        const li = document.createElement("li");
        li.classList.add("task");
        li.dataset.id = task.id
        li.innerHTML = `
            <div class="task-content">
                <input
                    type="checkbox"
                    class="checkTask"
                    ${task.completed ? "checked" : ""}
                >
                <div class="task-info">
                    <span>${task.text}</span>
                    <small class="priority ${task.priority}">
                        ${task.priority}
                    </small>
                    <p class="deadline">
                        ${task.deadline
                            ? `Due: ${task.deadline}`
                            : "No Deadline"}
                    </p>
                </div>
            </div>
            <div class="actions">
                <button class="editBtn">
                    Edit
                </button>
                <button class="deleteBtn">
                    Hapus
                </button>
            </div>
        `;
        taskList.appendChild(li);
        attachTaskEvents(li);

        const checkTask = li.querySelector(".checkTask");
        const taskSpan = li.querySelector("span");

        if(task.completed){
            checkTask.checked = true;
            taskSpan.style.textDecoration = "line-through";
            taskSpan.style.opacity = "0.5";
        }
    });
    updateTaskCount();
    updateProgress();
}



