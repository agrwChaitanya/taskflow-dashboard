class ModalManager {
    constructor() {
        this.modals = {};
        this.init();
    }

    init() {
        // Task modal event listeners
        const taskModal = document.getElementById('taskModal');
        const closeBtn = taskModal.querySelector('.close');
        const cancelBtn = document.getElementById('cancelTask');

        closeBtn.onclick = () => this.hide('taskModal');
        cancelBtn.onclick = () => this.hide('taskModal');
        
        window.onclick = (event) => {
            if (event.target === taskModal) {
                this.hide('taskModal');
            }
        };
    }

    show(modalId, data = null) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.style.display = 'block';
            
            // Pre-fill data if provided
            if (data && modalId === 'taskModal') {
                this.populateTaskForm(data);
            }
            
            document.body.style.overflow = 'hidden';
        }
    }

    hide(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.style.display = 'none';
            document.body.style.overflow = 'auto';
            
            // Clear form if task modal
            if (modalId === 'taskModal') {
                this.clearTaskForm();
            }
        }
    }

    populateTaskForm(taskData) {
        document.getElementById('taskTitle').value = taskData.title || '';
        document.getElementById('taskDescription').value = taskData.description || '';
        document.getElementById('taskPriority').value = taskData.priority || 'medium';
        document.getElementById('taskStatus').value = taskData.status || 'todo';
        document.getElementById('taskDueDate').value = taskData.dueDate || '';
        document.getElementById('taskAssignee').value = taskData.assignee || '';
        
        // Update modal title
        document.getElementById('modalTitle').textContent = taskData.id ? 'Edit Task' : 'Create New Task';
    }

    clearTaskForm() {
        document.getElementById('taskForm').reset();
        document.getElementById('modalTitle').textContent = 'Create New Task';
    }

    getTaskFormData() {
        return {
            title: document.getElementById('taskTitle').value,
            description: document.getElementById('taskDescription').value,
            priority: document.getElementById('taskPriority').value,
            status: document.getElementById('taskStatus').value,
            dueDate: document.getElementById('taskDueDate').value,
            assignee: document.getElementById('taskAssignee').value
        };
    }
}

const modalManager = new ModalManager();
