class TaskFlowApp {
    constructor() {
        this.currentProject = null;
        this.currentTasks = [];
        this.filters = {
            status: 'all',
            priority: 'all',
            search: ''
        };
        
        this.init();
    }

    init() {
        // Wait for auth to initialize
        setTimeout(() => {
            this.setupEventListeners();
            this.initializeSearch();
        }, 100);
    }

    setupEventListeners() {
        // Task form submission
        document.getElementById('taskForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleTaskSave();
        });

        // Add task button
        document.getElementById('addTaskBtn').addEventListener('click', () => {
            this.showAddTaskModal();
        });

        // Filters
        document.getElementById('statusFilter').addEventListener('change', (e) => {
            this.filters.status = e.target.value;
            this.applyFilters();
        });

        document.getElementById('priorityFilter').addEventListener('change', (e) => {
            this.filters.priority = e.target.value;
            this.applyFilters();
        });

        // Global events
        document.addEventListener('projectSelected', (e) => {
            this.loadProject(e.detail.projectId);
        });

        document.addEventListener('taskStatusUpdated', (e) => {
            this.renderTasks();
        });

        document.addEventListener('taskCreated', () => {
            this.renderTasks();
        });

        document.addEventListener('taskUpdated', () => {
            this.renderTasks();
        });

        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            if (e.ctrlKey || e.metaKey) {
                switch(e.key) {
                    case 'n':
                        e.preventDefault();
                        this.showAddTaskModal();
                        break;
                    case 'k':
                        e.preventDefault();
                        document.getElementById('globalSearch').focus();
                        break;
                }
            }
        });
    }

    initializeSearch() {
        const searchInput = document.getElementById('globalSearch');
        const debouncedSearch = Utils.debounce((value) => {
            this.filters.search = value;
            this.applyFilters();
        }, 300);

        searchInput.addEventListener('input', (e) => {
            debouncedSearch(e.target.value);
        });
    }

    async loadProject(projectId) {
        const projects = storage.getProjects();
        this.currentProject = projects.find(p => p.id === projectId);
        
        if (!this.currentProject) {
            notificationManager.error('Project not found');
            return;
        }

        // Update UI
        document.getElementById('currentProject').textContent = this.currentProject.name;
        
        // Load tasks for this project
        this.currentTasks = storage.getTasksByProject(projectId);
        
        // Update project stats in sidebar
        sidebarManager.updateProjectStats(projectId, this.currentTasks.length);
        
        // Render tasks
        this.renderTasks();
        
        // Initialize drag and drop
        setTimeout(() => {
            dragDropManager.makeTasksDraggable();
        }, 100);
    }

    renderTasks() {
        if (!this.currentProject) return;

        // Reload tasks to get updates
        this.currentTasks = storage.getTasksByProject(this.currentProject.id);
        
        // Apply filters
        let filteredTasks = this.currentTasks;
        if (this.filters.status !== 'all' || this.filters.priority !== 'all' || this.filters.search) {
            filteredTasks = Utils.filterTasks(this.currentTasks, this.filters);
        }

        // Group tasks by status
        const tasksByStatus = {
            todo: filteredTasks.filter(task => task.status === 'todo'),
            inprogress: filteredTasks.filter(task => task.status === 'inprogress'),
            review: filteredTasks.filter(task => task.status === 'review'),
            done: filteredTasks.filter(task => task.status === 'done')
        };

        // Render each column
        Object.keys(tasksByStatus).forEach(status => {
            const container = document.getElementById(`${status}Tasks`);
            if (container) {
                container.innerHTML = this.renderTaskList(tasksByStatus[status]);
            }
        });

        // Update task counts in column headers
        this.updateColumnCounts();

        // Re-initialize drag and drop
        setTimeout(() => {
            dragDropManager.makeTasksDraggable();
            this.attachTaskEventListeners();
        }, 50);
    }

    renderTaskList(tasks) {
        if (tasks.length === 0) {
            return '<div class="empty-state">No tasks</div>';
        }

        return tasks.map(task => `
            <div class="task-card ${Utils.getPriorityClass(task.priority)}" 
                 data-task-id="${task.id}"
                 draggable="true">
                <div class="task-header">
                    <h4 class="task-title">${task.title}</h4>
                    <div class="task-actions">
                        <button class="btn-edit" data-task-id="${task.id}">✏️</button>
                        <button class="btn-delete" data-task-id="${task.id}">🗑️</button>
                    </div>
                </div>
                <p class="task-description">${task.description || 'No description'}</p>
                <div class="task-meta">
                    <span class="task-priority ${task.priority}">${Utils.getPriorityLabel(task.priority)}</span>
                    <span class="task-assignee">👤 ${task.assignee || 'Unassigned'}</span>
                    ${task.dueDate ? `<span class="task-due">📅 ${Utils.formatDate(task.dueDate)}</span>` : ''}
                </div>
                <div class="task-footer">
                    <small>Created: ${Utils.formatDate(task.createdAt)}</small>
                </div>
            </div>
        `).join('');
    }

    attachTaskEventListeners() {
        // Edit buttons
        document.querySelectorAll('.btn-edit').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const taskId = e.target.closest('.btn-edit').dataset.taskId;
                this.editTask(taskId);
            });
        });

        // Delete buttons
        document.querySelectorAll('.btn-delete').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const taskId = e.target.closest('.btn-delete').dataset.taskId;
                this.deleteTask(taskId);
            });
        });
    }

    updateColumnCounts() {
        const statuses = ['todo', 'inprogress', 'review', 'done'];
        
        statuses.forEach(status => {
            const column = document.querySelector(`[data-status="${status}"]`);
            if (column) {
                const count = this.currentTasks.filter(task => task.status === status).length;
                const title = column.querySelector('h3');
                const originalText = title.textContent.replace(/\(\d+\)/, '').trim();
                title.textContent = `${originalText} (${count})`;
            }
        });
    }

    showAddTaskModal(taskData = null) {
        if (!this.currentProject) {
            notificationManager.error('Please select a project first');
            return;
        }

        if (taskData) {
            modalManager.show('taskModal', taskData);
        } else {
            modalManager.show('taskModal', {
                projectId: this.currentProject.id,
                status: 'todo'
            });
        }
    }

    handleTaskSave() {
        const formData = modalManager.getTaskFormData();
        
        if (!formData.title.trim()) {
            notificationManager.error('Task title is required');
            return;
        }

        try {
            if (this.editingTaskId) {
                // Update existing task
                const updatedTask = storage.updateTask(this.editingTaskId, formData);
                if (updatedTask) {
                    notificationManager.success('Task updated successfully!');
                    
                    const event = new CustomEvent('taskUpdated', {
                        detail: { task: updatedTask }
                    });
                    document.dispatchEvent(event);
                }
            } else {
                // Create new task
                const newTask = storage.createTask({
                    projectId: this.currentProject.id,
                    ...formData
                });
                
                notificationManager.success('Task created successfully!');
                
                const event = new CustomEvent('taskCreated', {
                    detail: { task: newTask }
                });
                document.dispatchEvent(event);
            }

            modalManager.hide('taskModal');
            this.editingTaskId = null;
            
        } catch (error) {
            console.error('Error saving task:', error);
            notificationManager.error('Failed to save task');
        }
    }

    editTask(taskId) {
        const task = this.currentTasks.find(t => t.id === taskId);
        if (task) {
            this.editingTaskId = taskId;
            this.showAddTaskModal(task);
        }
    }

    deleteTask(taskId) {
        if (confirm('Are you sure you want to delete this task?')) {
            storage.deleteTask(taskId);
            notificationManager.info('Task deleted');
            this.renderTasks();
        }
    }

    applyFilters() {
        this.renderTasks();
    }
}

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.taskFlowApp = new TaskFlowApp();
});
