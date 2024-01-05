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
            // console.log(username, password);
            try {
                const response = await new ApiAxios().add('/jwt/create/', {username,password});
                // update pinia state
                this.accessToken = response.data.access;
                this.refreshToken = response.data.refresh;
                this.isAuthenticated = true;
        
                const userConnected = await new ApiAxios().find('/users/me/');
                this.user = userConnected.data;
                
                if (this.user?.role === 'admin') {
                    router.push(this.returnUrl || '/dashboards/modern');
                } else if (this.user?.role === 'manager_a') {
                    router.push(this.returnUrl || '/dashboards/modern/mag');
                } else {
                    router.push('/');
                }
                
            } catch (error) {
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
