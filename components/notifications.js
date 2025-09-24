class NotificationManager {
    constructor() {
        this.container = document.getElementById('notificationContainer');
        if (!this.container) {
            this.container = document.createElement('div');
            this.container.id = 'notificationContainer';
            this.container.style.cssText = `
                position: fixed;
                top: 20px;
                right: 20px;
                z-index: 10000;
                max-width: 300px;
            `;
            document.body.appendChild(this.container);
        }
    }

    show(message, type = 'info', duration = 5000) {
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.style.cssText = `
            background: ${this.getBackgroundColor(type)};
            color: white;
            padding: 15px 20px;
            margin-bottom: 10px;
            border-radius: 5px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            animation: slideIn 0.3s ease-out;
            cursor: pointer;
        `;

        notification.innerHTML = `
            <div style="display: flex; justify-content: space-between; align-items: center;">
                <span>${message}</span>
                <button style="background: none; border: none; color: white; font-size: 16px; cursor: pointer;">×</button>
            </div>
        `;

        // Add styles for animation
        if (!document.querySelector('#notificationStyles')) {
            const styles = document.createElement('style');
            styles.id = 'notificationStyles';
            styles.textContent = `
                @keyframes slideIn {
                    from { transform: translateX(100%); opacity: 0; }
                    to { transform: translateX(0); opacity: 1; }
                }
                .notification {
                    transition: transform 0.3s ease-out, opacity 0.3s ease-out;
                }
                .notification.hiding {
                    transform: translateX(100%);
                    opacity: 0;
                }
            `;
            document.head.appendChild(styles);
        }

        this.container.appendChild(notification);

        // Close button event
        const closeBtn = notification.querySelector('button');
        closeBtn.onclick = () => this.removeNotification(notification);

        // Auto remove after duration
        if (duration > 0) {
            setTimeout(() => this.removeNotification(notification), duration);
        }

        return notification;
    }

    removeNotification(notification) {
        notification.classList.add('hiding');
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 300);
    }

    getBackgroundColor(type) {
        switch (type) {
            case 'success': return '#28a745';
            case 'error': return '#dc3545';
            case 'warning': return '#ffc107';
            case 'info': 
            default: return '#17a2b8';
        }
    }

    // Convenience methods
    success(message, duration = 5000) {
        return this.show(message, 'success', duration);
    }

    error(message, duration = 5000) {
        return this.show(message, 'error', duration);
    }

    warning(message, duration = 5000) {
        return this.show(message, 'warning', duration);
    }

    info(message, duration = 5000) {
        return this.show(message, 'info', duration);
    }
}

const notificationManager = new NotificationManager();
