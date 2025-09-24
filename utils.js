class Utils {
    // Date formatting
    static formatDate(dateString) {
        if (!dateString) return 'No due date';
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    }

    // Priority styling
    static getPriorityClass(priority) {
        switch (priority) {
            case 'high': return 'high';
            case 'medium': return 'medium';
            case 'low': return 'low';
            default: return 'low';
        }
    }

    static getPriorityLabel(priority) {
        switch (priority) {
            case 'high': return 'High';
            case 'medium': return 'Medium';
            case 'low': return 'Low';
            default: return 'Low';
        }
    }

    // Status styling
    static getStatusLabel(status) {
        switch (status) {
            case 'todo': return 'To Do';
            case 'inprogress': return 'In Progress';
            case 'review': return 'Review';
            case 'done': return 'Done';
            default: return status;
        }
    }

    // Search and filter
    static filterTasks(tasks, filters) {
        return tasks.filter(task => {
            let matches = true;

            if (filters.status && filters.status !== 'all') {
                matches = matches && task.status === filters.status;
            }

            if (filters.priority && filters.priority !== 'all') {
                matches = matches && task.priority === filters.priority;
            }

            if (filters.search) {
                const searchTerm = filters.search.toLowerCase();
                matches = matches && (
                    task.title.toLowerCase().includes(searchTerm) ||
                    task.description.toLowerCase().includes(searchTerm) ||
                    task.assignee.toLowerCase().includes(searchTerm)
                );
            }

            return matches;
        });
    }

    // Validation
    static validateEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    static validatePassword(password) {
        return password.length >= 6;
    }

    // DOM helpers
    static createElement(tag, className, content) {
        const element = document.createElement(tag);
        if (className) element.className = className;
        if (content) element.innerHTML = content;
        return element;
    }

    // Debounce for search
    static debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }
}
