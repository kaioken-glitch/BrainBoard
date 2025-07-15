// API Service for BrainBoard Dashboard
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

class ApiService {
    // Generic request handler
    async request(endpoint, options = {}) {
        const url = `${API_BASE_URL}${endpoint}`;
        const config = {
            headers: {
                'Content-Type': 'application/json',
                ...options.headers,
            },
            ...options,
        };

        try {
            const response = await fetch(url, config);
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            // Don't try to parse JSON for 204 No Content responses
            if (response.status === 204) {
                return null;
            }
            
            return await response.json();
        } catch (error) {
            console.error(`API request failed: ${endpoint}`, error);
            throw error;
        }
    }

    // ============= NOTIFICATIONS API =============
    
    async getNotifications() {
        return this.request('/notifications');
    }

    async getNotificationById(id) {
        return this.request(`/notifications/${id}`);
    }

    async createNotification(title, message) {
        return this.request('/notifications', {
            method: 'POST',
            body: JSON.stringify({ title, message }),
        });
    }

    async updateNotification(id, data) {
        return this.request(`/notifications/${id}`, {
            method: 'PUT',
            body: JSON.stringify(data),
        });
    }

    async deleteNotification(id) {
        return this.request(`/notifications/${id}`, {
            method: 'DELETE',
        });
    }

    async markNotificationAsRead(id) {
        return this.request(`/notifications/${id}/read`, {
            method: 'PATCH',
        });
    }

    // ============= MESSAGES API =============
    
    async getMessages() {
        return this.request('/messages');
    }

    async getMessageById(id) {
        return this.request(`/messages/${id}`);
    }

    async createMessage(sender, message) {
        return this.request('/messages', {
            method: 'POST',
            body: JSON.stringify({ sender, message }),
        });
    }

    async updateMessage(id, data) {
        return this.request(`/messages/${id}`, {
            method: 'PUT',
            body: JSON.stringify(data),
        });
    }

    async deleteMessage(id) {
        return this.request(`/messages/${id}`, {
            method: 'DELETE',
        });
    }

    async markMessageAsRead(id) {
        return this.request(`/messages/${id}/read`, {
            method: 'PATCH',
        });
    }

    // ============= TASKS API =============
    
    async getTasks(filters = {}) {
        const params = new URLSearchParams(filters).toString();
        const endpoint = params ? `/tasks?${params}` : '/tasks';
        return this.request(endpoint);
    }

    async getTaskById(id) {
        return this.request(`/tasks/${id}`);
    }

    async createTask(taskData) {
        return this.request('/tasks', {
            method: 'POST',
            body: JSON.stringify(taskData),
        });
    }

    async updateTask(id, data) {
        return this.request(`/tasks/${id}`, {
            method: 'PUT',
            body: JSON.stringify(data),
        });
    }

    async deleteTask(id) {
        return this.request(`/tasks/${id}`, {
            method: 'DELETE',
        });
    }

    // ============= SEARCH API =============
    
    async search(query, filters = {}) {
        const params = new URLSearchParams({ q: query, ...filters }).toString();
        return this.request(`/search?${params}`);
    }

    async addSearchItem(title, category = 'general', type = 'item') {
        return this.request('/search', {
            method: 'POST',
            body: JSON.stringify({ title, category, type }),
        });
    }

    async deleteSearchItem(id) {
        return this.request(`/search/${id}`, {
            method: 'DELETE',
        });
    }

    // ============= UTILITY API =============
    
    async getStats() {
        return this.request('/stats');
    }

    async markAllAsRead() {
        return this.request('/mark-all-read', {
            method: 'PATCH',
        });
    }

    async healthCheck() {
        return this.request('/health');
    }
}

// Create and export a singleton instance
const apiService = new ApiService();
export default apiService;
