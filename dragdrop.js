class DragDropManager {
    constructor() {
        this.draggedTask = null;
        this.init();
    }

    init() {
        this.setupDragAndDrop();
        this.setupEventListeners();
    }

    setupDragAndDrop() {
        const taskContainers = document.querySelectorAll('.tasks-container');
        
        taskContainers.forEach(container => {
            // Allow dropping
            container.addEventListener('dragover', (e) => {
                e.preventDefault();
                container.classList.add('drag-over');
            });

            container.addEventListener('dragleave', () => {
                container.classList.remove('drag-over');
            });

            container.addEventListener('drop', (e) => {
                e.preventDefault();
                container.classList.remove('drag-over');
                this.handleDrop(container, e);
            });
        });

        // Document-wide drag end cleanup
        document.addEventListener('dragend', () => {
            document.querySelectorAll('.drag-over').forEach(el => {
                el.classList.remove('drag-over');
            });
        });
    }

    setupEventListeners() {
        // Listen for task updates
        document.addEventListener('taskCreated', () => this.makeTasksDraggable());
        document.addEventListener('taskUpdated', () => this.makeTasksDraggable());
        document.addEventListener('projectSelected', () => this.makeTasksDraggable());
    }

    makeTasksDraggable() {
        const taskCards = document.querySelectorAll('.task-card');
        
        taskCards.forEach(task => {
            task.draggable = true;
            
            task.addEventListener('dragstart', (e) => {
                this.draggedTask = task;
                task.classList.add('dragging');
                e.dataTransfer.setData('text/plain', task.dataset.taskId);
                e.dataTransfer.effectAllowed = 'move';
            });

            task.addEventListener('dragend', () => {
                task.classList.remove('dragging');
                this.draggedTask = null;
            });
        });
    }

    handleDrop(container, e) {
        if (!this.draggedTask) return;

        const taskId = this.draggedTask.dataset.taskId;
        const newStatus = container.closest('.board-column').dataset.status;
        
        this.updateTaskStatus(taskId, newStatus);
    }

    async updateTaskStatus(taskId, newStatus) {
        try {
            const updatedTask = storage.updateTask(taskId, { status: newStatus });
            
            if (updatedTask) {
                // Dispatch custom event for UI update
                const event = new CustomEvent('taskStatusUpdated', {
                    detail: { taskId, newStatus, task: updatedTask }
                });
                document.dispatchEvent(event);
                
                notificationManager.success(`Task moved to ${Utils.getStatusLabel(newStatus)}`);
            }
        } catch (error) {
            console.error('Error updating task status:', error);
            notificationManager.error('Failed to update task status');
        }
    }

    // Enhanced drag and drop with visual feedback
    setupEnhancedDragDrop() {
        const columns = document.querySelectorAll('.board-column');
        
        columns.forEach(column => {
            column.addEventListener('dragover', (e) => {
                e.preventDefault();
                const afterElement = this.getDragAfterElement(column.querySelector('.tasks-container'), e.clientY);
                const draggable = document.querySelector('.dragging');
                
                if (afterElement) {
                    column.querySelector('.tasks-container').insertBefore(draggable, afterElement);
                } else {
                    column.querySelector('.tasks-container').appendChild(draggable);
                }
            });
        });
    }

    getDragAfterElement(container, y) {
        const draggableElements = [...container.querySelectorAll('.task-card:not(.dragging)')];
        
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

    // Reorder tasks within the same column
    handleTaskReorder(taskId, newIndex, status) {
        const tasks = storage.getTasks().filter(task => task.status === status);
        const taskIndex = tasks.findIndex(task => task.id === taskId);
        
        if (taskIndex !== -1) {
            // Remove task from current position
            const [task] = tasks.splice(taskIndex, 1);
            // Insert at new position
            tasks.splice(newIndex, 0, task);
            
            // Update order in storage (you might want to add an order field to tasks)
            // This is a simplified implementation
            notificationManager.info('Task order updated');
        }
    }
}

const dragDropManager = new DragDropManager();
