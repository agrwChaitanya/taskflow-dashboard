class StorageManager {
    constructor() {
        this.usersKey = 'taskflow_users';
        this.currentUserKey = 'taskflow_current_user';
        this.projectsKey = 'taskflow_projects';
        this.tasksKey = 'taskflow_tasks';
    }

    // User Management
    getUsers() {
        return JSON.parse(localStorage.getItem(this.usersKey)) || [];
    }

    saveUsers(users) {
        localStorage.setItem(this.usersKey, JSON.stringify(users));
    }

    getCurrentUser() {
        return JSON.parse(localStorage.getItem(this.currentUserKey));
    }

    setCurrentUser(user) {
        localStorage.setItem(this.currentUserKey, JSON.stringify(user));
    }

    logout() {
        localStorage.removeItem(this.currentUserKey);
    }

    // Project Management
    getProjects() {
        return JSON.parse(localStorage.getItem(this.projectsKey)) || [];
    }

    saveProjects(projects) {
        localStorage.setItem(this.projectsKey, JSON.stringify(projects));
    }

    getProjectsByUser(userId) {
        const projects = this.getProjects();
        return projects.filter(project => project.ownerId === userId || project.members.includes(userId));
    }

    createProject(projectData) {
        const projects = this.getProjects();
        const newProject = {
            id: this.generateId(),
            ...projectData,
            createdAt: new Date().toISOString(),
            tasks: []
        };
        projects.push(newProject);
        this.saveProjects(projects);
        return newProject;
    }

    // Task Management
    getTasks() {
        return JSON.parse(localStorage.getItem(this.tasksKey)) || [];
    }

    saveTasks(tasks) {
        localStorage.setItem(this.tasksKey, JSON.stringify(tasks));
    }

    getTasksByProject(projectId) {
        const tasks = this.getTasks();
        return tasks.filter(task => task.projectId === projectId);
    }

    createTask(taskData) {
        const tasks = this.getTasks();
        const newTask = {
            id: this.generateId(),
            ...taskData,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };
        tasks.push(newTask);
        this.saveTasks(tasks);
        return newTask;
    }

    updateTask(taskId, updates) {
        const tasks = this.getTasks();
        const taskIndex = tasks.findIndex(task => task.id === taskId);
        if (taskIndex !== -1) {
            tasks[taskIndex] = {
                ...tasks[taskIndex],
                ...updates,
                updatedAt: new Date().toISOString()
            };
            this.saveTasks(tasks);
            return tasks[taskIndex];
        }
        return null;
    }

    deleteTask(taskId) {
        const tasks = this.getTasks();
        const filteredTasks = tasks.filter(task => task.id !== taskId);
        this.saveTasks(filteredTasks);
    }

    // Utility Methods
    generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    }

    initializeSampleData() {
        // Only initialize if no users exist
        if (this.getUsers().length === 0) {
            const sampleUsers = [
                {
                    id: 'admin1',
                    username: 'demo',
                    email: 'demo@taskflow.com',
                    password: 'demo123',
                    createdAt: new Date().toISOString()
                }
            ];
            this.saveUsers(sampleUsers);

            // Create sample project
            const sampleProject = this.createProject({
                name: 'Website Redesign',
                description: 'Complete redesign of company website',
                ownerId: 'admin1',
                members: ['admin1']
            });

            // Create sample tasks
            const sampleTasks = [
                {
                    projectId: sampleProject.id,
                    title: 'Design Homepage',
                    description: 'Create new homepage layout and design',
                    priority: 'high',
                    status: 'inprogress',
                    assignee: 'John Doe',
                    dueDate: '2024-02-15'
                },
                {
                    projectId: sampleProject.id,
                    title: 'Develop Contact Form',
                    description: 'Implement responsive contact form with validation',
                    priority: 'medium',
                    status: 'todo',
                    assignee: 'Jane Smith',
                    dueDate: '2024-02-20'
                },
                {
                    projectId: sampleProject.id,
                    title: 'SEO Optimization',
                    description: 'Optimize website for search engines',
                    priority: 'low',
                    status: 'review',
                    assignee: 'Mike Johnson',
                    dueDate: '2024-02-25'
                }
            ];

            sampleTasks.forEach(task => this.createTask(task));
        }
    }
}

// Create global instance
const storage = new StorageManager();
