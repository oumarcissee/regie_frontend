import { defineStore } from 'pinia';
import { isAxiosError } from '@/services/utils';
import { router } from '@/router';
import { fetchWrapper } from '@/utils/helpers/fetch-wrapper';
import { useOrderStore } from '@/stores/rutStore/orders/orderStore';

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
        refreshToken: null,
        
        dates: [] as any,
        
    }),
    actions: {
        async login(username: string, password: string) {
            // console.log(username, password);
            try {
                const response = await new ApiAxios().add('/jwt/create/', { username, password });
                // console.log(response)
                // update pinia state
                this.accessToken = response.data.access;
                this.refreshToken = response.data.refresh;
                this.isAuthenticated = true;
                
                // // localStorage.setItem('user', JSON.stringify(response.data.user));
                // localStorage.setItem('accessToken', JSON.stringify(response.data.access));
                // localStorage.setItem('refreshToken', JSON.stringify(response.data.refresh));

        
                const userConnected = await new ApiAxios().find('/users/me/');
                this.user = userConnected.data;

                //Chargement des dates
                this.dates = await useOrderStore().getUniqueMonth();
                
                if (this.user?.role === 'admin') {
                    this.dashboard = 'ModernDashboard';
                    router.push({ name: 'ModernDashboard' });
                } else if (this.user?.role === 'manager_a') {
                    this.dashboard = 'ManagerADashboard';
                    router.push({name: 'ManagerADashboard'});
                } else {
                    router.push('/');
                }
                
            } catch (error) {
               if (isAxiosError(error)) {
                    if (error.response) {
                        return Promise.reject("Aucun compte actif n'a été trouvé avec les informations d'identification");
                    }
                }
                return Promise.reject("Erreur de connexion");
            }
        },

        logout() {
            this.user = Object();
            this.isAuthenticated = false
            localStorage.removeItem('user');
            localStorage.removeItem('accessToken');
            localStorage.removeItem('refreshToken');
            this.accessToken = null;
            this.refreshToken = null;
            
            router.push('/');
        }
    }
});
