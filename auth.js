class AuthManager {
    constructor() {
        this.currentUser = null;
        this.init();
    }

    init() {
        // Initialize sample data
        storage.initializeSampleData();

        // Check if user is already logged in
        this.checkExistingSession();

        // Attach event listeners
        this.attachAuthEventListeners();
    }

    checkExistingSession() {
        const user = storage.getCurrentUser();
        if (user) {
            this.handleSuccessfulLogin(user);
        }
    }

    attachAuthEventListeners() {
        // Login form
        document.getElementById('loginForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleLogin();
        });

        // Register form
        document.getElementById('registerForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleRegister();
        });

        // Switch between login/register
        document.getElementById('showRegister').addEventListener('click', (e) => {
            e.preventDefault();
            this.showRegisterForm();
        });

        document.getElementById('showLogin').addEventListener('click', (e) => {
            e.preventDefault();
            this.showLoginForm();
        });

        // Logout
        document.getElementById('logoutBtn').addEventListener('click', () => {
            this.handleLogout();
        });
    }

    handleLogin() {
        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;

        if (!username || !password) {
            notificationManager.error('Please fill in all fields');
            return;
        }

        const users = storage.getUsers();
        const user = users.find(u => u.username === username && u.password === password);

        if (user) {
            this.handleSuccessfulLogin(user);
        } else {
            notificationManager.error('Invalid username or password');
        }
    }

    handleRegister() {
        const username = document.getElementById('regUsername').value;
        const email = document.getElementById('regEmail').value;
        const password = document.getElementById('regPassword').value;

        if (!username || !email || !password) {
            notificationManager.error('Please fill in all fields');
            return;
        }

        if (!Utils.validateEmail(email)) {
            notificationManager.error('Please enter a valid email address');
            return;
        }

        if (!Utils.validatePassword(password)) {
            notificationManager.error('Password must be at least 6 characters long');
            return;
        }

        const users = storage.getUsers();
        
        // Check if username or email already exists
        if (users.find(u => u.username === username)) {
            notificationManager.error('Username already exists');
            return;
        }

        if (users.find(u => u.email === email)) {
            notificationManager.error('Email already registered');
            return;
        }

        // Create new user
        const newUser = {
            id: storage.generateId(),
            username,
            email,
            password,
            createdAt: new Date().toISOString()
        };

        users.push(newUser);
        storage.saveUsers(users);
        
        notificationManager.success('Account created successfully! Please login.');
        this.showLoginForm();
    }

    handleSuccessfulLogin(user) {
        this.currentUser = user;
        storage.setCurrentUser(user);
        
        // Hide auth screens, show dashboard
        document.getElementById('loginScreen').style.display = 'none';
        document.getElementById('registerScreen').style.display = 'none';
        document.getElementById('dashboard').style.display = 'flex';
        
        // Update UI
        document.getElementById('userGreeting').textContent = `Hello, ${user.username}!`;
        
        // Initialize dashboard
        this.initializeDashboard(user);
        
        notificationManager.success(`Welcome back, ${user.username}!`);
    }

    handleLogout() {
        storage.logout();
        this.currentUser = null;
        
        // Show auth screens, hide dashboard
        document.getElementById('dashboard').style.display = 'none';
        document.getElementById('loginScreen').style.display = 'flex';
        document.getElementById('registerScreen').style.display = 'none';
        
        // Clear forms
        document.getElementById('loginForm').reset();
        document.getElementById('registerForm').reset();
        
        notificationManager.info('Logged out successfully');
    }

    showLoginForm() {
        document.getElementById('loginScreen').style.display = 'flex';
        document.getElementById('registerScreen').style.display = 'none';
    }

    showRegisterForm() {
        document.getElementById('loginScreen').style.display = 'none';
        document.getElementById('registerScreen').style.display = 'flex';
    }

    initializeDashboard(user) {
        // Load user's projects
        const projects = storage.getProjectsByUser(user.id);
        
        // Initialize sidebar
        sidebarManager.render(user, projects);
        
        // Load first project or create default
        if (projects.length > 0) {
            const firstProject = projects[0];
            sidebarManager.selectProject(firstProject.id);
        } else {
            // Create a default project for new users
            const defaultProject = storage.createProject({
                name: 'My First Project',
                description: 'Welcome to TaskFlow! This is your first project.',
                ownerId: user.id,
                members: [user.id]
            });
            
            // Add welcome task
            storage.createTask({
                projectId: defaultProject.id,
                title: 'Welcome to TaskFlow!',
                description: 'This is your first task. You can drag it between columns, edit it, or delete it.',
                priority: 'medium',
                status: 'todo',
                assignee: user.username,
                dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] // 7 days from now
            });
            
            sidebarManager.render(user, [defaultProject]);
            sidebarManager.selectProject(defaultProject.id);
        }
    }

    getCurrentUser() {
        return this.currentUser;
    }
}

const authManager = new AuthManager();
