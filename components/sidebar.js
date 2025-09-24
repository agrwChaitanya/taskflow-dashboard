class SidebarManager {
    constructor() {
        this.sidebar = document.getElementById('sidebar');
        this.currentProject = null;
    }

    render(user, projects) {
        if (!this.sidebar) return;

        this.sidebar.innerHTML = `
            <div class="sidebar-header">
                <h2>🚀 TaskFlow</h2>
                <div class="user-info">
                    <span>Welcome, ${user.username}</span>
                </div>
            </div>
            
            <nav class="sidebar-nav">
                <div class="nav-section">
                    <h3>Projects</h3>
                    <div id="projectsList" class="projects-list">
                        ${this.renderProjectsList(projects)}
                    </div>
                    <button id="createProjectBtn" class="nav-btn">
                        + New Project
                    </button>
                </div>
                
                <div class="nav-section">
                    <h3>Views</h3>
                    <button class="nav-btn active" data-view="dashboard">
                        📊 Dashboard
                    </button>
                    <button class="nav-btn" data-view="calendar">
                        📅 Calendar
                    </button>
                    <button class="nav-btn" data-view="reports">
                        📈 Reports
                    </button>
                </div>
                
                <div class="nav-section">
                    <h3>Settings</h3>
                    <button class="nav-btn" data-view="profile">
                        👤 Profile
                    </button>
                    <button class="nav-btn" data-view="team">
                        👥 Team
                    </button>
                </div>
            </nav>
            
            <div class="sidebar-footer">
                <button id="logoutBtn" class="logout-btn">🚪 Logout</button>
            </div>
        `;

        this.attachEventListeners();
    }

    renderProjectsList(projects) {
        if (projects.length === 0) {
            return '<div class="no-projects">No projects yet</div>';
        }

        return projects.map(project => `
            <div class="project-item ${this.currentProject?.id === project.id ? 'active' : ''}" 
                 data-project-id="${project.id}">
                <span class="project-icon">📁</span>
                <span class="project-name">${project.name}</span>
                <span class="project-stats">${project.taskCount || 0}</span>
            </div>
        `).join('');
    }

    attachEventListeners() {
        // Project selection
        this.sidebar.addEventListener('click', (e) => {
            const projectItem = e.target.closest('.project-item');
            if (projectItem) {
                const projectId = projectItem.dataset.projectId;
                this.selectProject(projectId);
            }

            // View buttons
            const navBtn = e.target.closest('.nav-btn');
            if (navBtn && navBtn.dataset.view) {
                this.switchView(navBtn.dataset.view);
            }

            // Create project button
            if (e.target.id === 'createProjectBtn') {
                this.createProject();
            }
        });
    }

    selectProject(projectId) {
        // Update active state
        document.querySelectorAll('.project-item').forEach(item => {
            item.classList.remove('active');
        });
        document.querySelector(`[data-project-id="${projectId}"]`).classList.add('active');

        // Dispatch custom event
        const event = new CustomEvent('projectSelected', {
            detail: { projectId }
        });
        document.dispatchEvent(event);
    }

    switchView(view) {
        // Update active state
        document.querySelectorAll('.nav-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        document.querySelector(`[data-view="${view}"]`).classList.add('active');

        // Dispatch custom event
        const event = new CustomEvent('viewChanged', {
            detail: { view }
        });
        document.dispatchEvent(event);
    }

    createProject() {
        const projectName = prompt('Enter project name:');
        if (projectName && projectName.trim()) {
            const newProject = storage.createProject({
                name: projectName.trim(),
                ownerId: storage.getCurrentUser().id,
                members: [storage.getCurrentUser().id]
            });

            notificationManager.success(`Project "${projectName}" created!`);
            
            // Refresh sidebar
            const user = storage.getCurrentUser();
            const projects = storage.getProjectsByUser(user.id);
            this.render(user, projects);
        }
    }

    updateProjectStats(projectId, taskCount) {
        const projectItem = this.sidebar.querySelector(`[data-project-id="${projectId}"] .project-stats`);
        if (projectItem) {
            projectItem.textContent = taskCount;
        }
    }
}

const sidebarManager = new SidebarManager();
