document.addEventListener("DOMContentLoaded", () => {
      // Select all elements
      const todoTitle = document.getElementById("todoTitle");
      const todoDesc = document.getElementById("todoDesc");
      const addBtn = document.getElementById("addBtn");
      const todoList = document.getElementById("todoList");
      const taskCounter = document.getElementById("taskCounter");
      const searchInput = document.getElementById("searchInput");
      const filterBtns = document.querySelectorAll(".filter-btn");
      const priorityBtns = document.querySelectorAll(".priority-btn");

      // Load todos from memory (no localStorage in Claude.ai artifacts)
      let todos = [];
      let currentFilter = "all";
      let searchQuery = "";
      let selectedPriority = "medium";

      // Priority button handling
      priorityBtns.forEach(btn => {
        btn.addEventListener("click", () => {
          priorityBtns.forEach(b => b.classList.remove("active"));
          btn.classList.add("active");
          selectedPriority = btn.dataset.priority;
        });
      });

      // Filter button handling
      filterBtns.forEach(btn => {
        btn.addEventListener("click", () => {
          filterBtns.forEach(b => b.classList.remove("active"));
          btn.classList.add("active");
          currentFilter = btn.dataset.filter;
          renderTodos();
        });
      });

      // Search handling
      searchInput.addEventListener("input", (e) => {
        searchQuery = e.target.value.toLowerCase();
        renderTodos();
      });

      // Show toast notification
      function showToast(message) {
        const toast = document.createElement("div");
        toast.className = "toast";
        toast.textContent = message;
        document.body.appendChild(toast);
        
        setTimeout(() => toast.classList.add("show"), 100);
        setTimeout(() => {
          toast.classList.remove("show");
          setTimeout(() => document.body.removeChild(toast), 300);
        }, 3000);
      }

      // Update task counter
      function updateTaskCounter() {
        const pendingCount = todos.filter(todo => !todo.completed).length;
        const totalCount = todos.length;
        taskCounter.textContent = `${pendingCount}/${totalCount} tasks`;
      }

      // Filter and search todos
      function getFilteredTodos() {
        return todos.filter(todo => {
          const matchesSearch = !searchQuery || 
            todo.title.toLowerCase().includes(searchQuery) || 
            todo.description.toLowerCase().includes(searchQuery);
          
          const matchesFilter = 
            currentFilter === "all" ||
            (currentFilter === "pending" && !todo.completed) ||
            (currentFilter === "completed" && todo.completed) ||
            (currentFilter === "high" && todo.priority === "high");
          
          return matchesSearch && matchesFilter;
        });
      }

      // Render todos
      function renderTodos() {
        const filteredTodos = getFilteredTodos();
        
        if (filteredTodos.length === 0) {
          todoList.innerHTML = `
            <div class="empty-state">
              <i class="fas fa-clipboard-list"></i>
              <h3>No tasks found</h3>
              <p>${searchQuery ? "Try adjusting your search" : currentFilter === "all" ? "Create your first task to get started!" : "No tasks match this filter"}</p>
            </div>
          `;
        } else {
          todoList.innerHTML = filteredTodos
            .map((todo, index) => {
              const originalIndex = todos.indexOf(todo);
              const priorityClass = `priority-${todo.priority}`;
              const completedClass = todo.completed ? "completed" : "";
              const statusClass = todo.completed ? "status-completed" : "status-pending";
              const statusText = todo.completed ? "Completed" : "Pending";
              const statusIcon = todo.completed ? "fas fa-check" : "fas fa-clock";
              
              return `
                <div class="card todo-item ${priorityClass} ${completedClass}">
                  <div class="todo-content">
                    <h3 class="${completedClass}">
                      ${todo.completed ? '<i class="fas fa-check-circle"></i>' : ''}
                      ${todo.title}
                    </h3>
                    ${todo.description ? `<p>${todo.description}</p>` : ''}
                    <div class="todo-meta">
                      <div>
                        <span class="status ${statusClass}">
                          <i class="${statusIcon}"></i>
                          ${statusText}
                        </span>
                        <span class="priority-badge priority-${todo.priority}">
                          ${todo.priority.charAt(0).toUpperCase() + todo.priority.slice(1)} Priority
                        </span>
                      </div>
                    </div>
                    <div class="date-created">
                      <i class="fas fa-calendar-alt"></i>
                      Created: ${todo.dateCreated}
                    </div>
                  </div>
                  <div class="todo-actions">
                    ${!todo.completed ? 
                      `<button onclick="toggleComplete(${originalIndex})" class="btn complete-btn">
                        <i class="fas fa-check"></i>
                      </button>` : 
                      `<button onclick="toggleComplete(${originalIndex})" class="btn complete-btn">
                        <i class="fas fa-undo"></i>
                      </button>`
                    }
                    <button onclick="editTodo(${originalIndex})" class="btn edit-btn">
                      <i class="fas fa-edit"></i>
                    </button>
                    <button onclick="deleteTodo(${originalIndex})" class="btn delete-btn">
                      <i class="fas fa-trash"></i>
                    </button>
                  </div>
                </div>
              `;
            })
            .join("");
        }
        
        updateTaskCounter();
      }

      // Add new todo
      function addTodo() {
        const title = todoTitle.value.trim();
        const description = todoDesc.value.trim();
        
        if (title) {
          const newTodo = {
            title,
            description,
            priority: selectedPriority,
            completed: false,
            dateCreated: new Date().toLocaleDateString(),
            id: Date.now()
          };
          
          todos.unshift(newTodo); // Add to beginning
          todoTitle.value = "";
          todoDesc.value = "";
          
          // Reset priority to medium
          priorityBtns.forEach(b => b.classList.remove("active"));
          priorityBtns[0].classList.add("active");
          selectedPriority = "medium";
          
          renderTodos();
          showToast("Task created successfully! 🎉");
        } else {
          showToast("Please enter a task title! ⚠️");
        }
      }

      // Toggle task completion
      window.toggleComplete = (todoIndex) => {
        todos[todoIndex].completed = !todos[todoIndex].completed;
        renderTodos();
        const status = todos[todoIndex].completed ? "completed" : "reopened";
        showToast(`Task ${status}! ${todos[todoIndex].completed ? '✅' : '🔄'}`);
      };

      // Delete todo
      window.deleteTodo = (todoIndex) => {
        if (confirm("Are you sure you want to delete this task?")) {
          todos.splice(todoIndex, 1);
          renderTodos();
          showToast("Task deleted! 🗑️");
        }
      };

      // Edit todo
      window.editTodo = (todoIndex) => {
        const todoToEdit = todos[todoIndex];
        todoTitle.value = todoToEdit.title || "";
        todoDesc.value = todoToEdit.description || "";
        
        // Set priority
        priorityBtns.forEach(b => b.classList.remove("active"));
        const priorityBtn = document.querySelector(`[data-priority="${todoToEdit.priority}"]`);
        if (priorityBtn) {
          priorityBtn.classList.add("active");
          selectedPriority = todoToEdit.priority;
        }
        
        todos.splice(todoIndex, 1);
        renderTodos();
        showToast("Task loaded for editing! ✏️");
        
        // Focus on title input
        todoTitle.focus();
      };

      // Event listeners
      addBtn.addEventListener("click", addTodo);
      
      // Enter key support
      todoTitle.addEventListener("keypress", (e) => {
        if (e.key === "Enter") {
          addTodo();
        }
      });

      // Initial render
      renderTodos();
      
      // Add some sample tasks for demonstration
      setTimeout(() => {
        if (todos.length === 0) {
          todos.push(
            {
              title: "Welcome to TaskMaster Pro!",
              description: "This is your enhanced todo app with priorities, search, and filters. Try creating a new task!",
              priority: "medium",
              completed: false,
              dateCreated: new Date().toLocaleDateString(),
              id: Date.now()
            }
          );
          renderTodos();
        }
      }, 1000);
    });