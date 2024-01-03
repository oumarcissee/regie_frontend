import { defineStore } from 'pinia';
import { router } from '@/router';
import { fetchWrapper } from '@/utils/helpers/fetch-wrapper';
import ApiAxios from '@/services/ApiAxios';

const baseUrl = `${import.meta.env.VITE_API_URL}/users`;

export const useAuthStore = defineStore({
    id: 'auth',
    state: () => ({
        // initialize state from local storage to enable user to stay logged in
        // @ts-ignore
        returnUrl: null,
        
        dashboard: '',
        user: Object(),
        isAuthenticated: false,
        accessToken: null,
        refreshToken:null,
    }),
    actions: {
        async login(username: string, password: string) {
            const response = await new ApiAxios().add('/jwt/create/', {username, password})
            // update pinia state
            this.accessToken = response.data.access;
            this.refreshToken = response.data.refresh;
            this.isAuthenticated = true;

            await this.connection()

            if (this.user?.role === 'admin') {
                this.dashboard = 'AdminDashboard'
            } else if (this.user?.role === 'moderator') {
                this.dashboard = 'ModeratorDashboard'
            } else if (this.user?.role === 'recruiter') {
                this.dashboard = 'RecruiterDashboard'
            } else {
                this.dashboard = 'Dashboard'
            }
         
            // store user details and jwt in local storage to keep user logged in between page refreshes
            // localStorage.setItem('user', JSON.stringify(user));
            // redirect to previous url or default to home page
            router.push(this.returnUrl || '/dashboards/modern');
        },

        async connection() {
            try {
                const response = await new ApiAxios().find('/users/me/');
                this.user  = response.data
            } catch(error){
                console.log(error)
            }
        },

        logout() {
            this.user = null;
            localStorage.removeItem('user');
            router.push('/');
        }
    }
});
