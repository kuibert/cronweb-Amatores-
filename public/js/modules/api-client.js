/**
 * Cliente API para comunicación con el backend
 */

const ApiClient = {
    baseUrl: 'cron_manager_v2.php',
    
    async request(action, data = {}, method = 'GET') {
        const url = new URL(this.baseUrl, window.location.origin + window.location.pathname.replace(/[^/]*$/, ''));
        
        if (method === 'GET') {
            url.searchParams.append('action', action);
            if (data.linux_user) {
                url.searchParams.append('linux_user', data.linux_user);
            }
            
            const response = await fetch(url);
            return await response.json();
        } else {
            const formData = new FormData();
            formData.append('action', action);
            
            for (const [key, value] of Object.entries(data)) {
                if (typeof value === 'object') {
                    formData.append(key, JSON.stringify(value));
                } else {
                    formData.append(key, value);
                }
            }
            
            const response = await fetch(url, {
                method: 'POST',
                body: formData
            });
            
            return await response.json();
        }
    },
    
    // Métodos específicos
    async listJobs(linuxUser) {
        return await this.request('list', { linux_user: linuxUser });
    },
    
    async addJob(jobData, linuxUser) {
        return await this.request('add', { 
            data: jobData, 
            linux_user: linuxUser 
        }, 'POST');
    },
    
    async editJob(index, jobData, linuxUser) {
        return await this.request('edit', { 
            index, 
            data: jobData, 
            linux_user: linuxUser 
        }, 'POST');
    },
    
    async deleteJob(index, linuxUser) {
        return await this.request('delete', { 
            index, 
            linux_user: linuxUser 
        }, 'POST');
    },
    
    async toggleJob(index, linuxUser) {
        return await this.request('toggle', { 
            index, 
            linux_user: linuxUser 
        }, 'POST');
    },
    
    async runJob(index, linuxUser) {
        return await this.request('run', { 
            index, 
            linux_user: linuxUser 
        }, 'POST');
    },
    
    async getLogs(linuxUser) {
        return await this.request('logs', { linux_user: linuxUser });
    },
    
    async clearLogs(linuxUser) {
        return await this.request('clear_logs', { linux_user: linuxUser }, 'POST');
    },
    
    async getCrontab(linuxUser) {
        const url = new URL(this.baseUrl, window.location.origin + window.location.pathname.replace(/[^/]*$/, ''));
        url.searchParams.append('action', 'crontab');
        url.searchParams.append('linux_user', linuxUser);
        
        const response = await fetch(url);
        return await response.text();
    },
    
    async getLinuxUsers() {
        return await this.request('get_linux_users');
    },
    
    async exportJobs(linuxUser) {
        const url = new URL(this.baseUrl, window.location.origin + window.location.pathname.replace(/[^/]*$/, ''));
        url.searchParams.append('action', 'export');
        url.searchParams.append('linux_user', linuxUser);
        
        window.location.href = url.toString();
    },
    
    async importJobs(jobsData, linuxUser) {
        return await this.request('import', { 
            data: jobsData, 
            linux_user: linuxUser 
        }, 'POST');
    }
};

// Exportar para uso global
window.ApiClient = ApiClient;
