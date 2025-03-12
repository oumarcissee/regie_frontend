import { defineStore } from 'pinia';
import { isAxiosError } from '@/services/utils';
import { router } from '@/router';
import { useOrderStore } from '@/stores/rutStore/orders/orderStore';

import fr from 'date-fns/locale/fr';
import { format } from 'date-fns';
const locale = fr; // or en, o

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
        accessToken: "",
        refreshToken: "",
        
        moments: [] as any,
        dates: [] as any,
        
    }),
    actions: {
         async getUniqueMonth() {
            try {
                const archives = await new ApiAxios().find('/archives/');

                // Créer un Map pour stocker les mois uniques
                const monthMap = new Map();
                
                archives.data.results.forEach((item: any) => {
                    const monthKey = format(new Date(item.date), "MMMM yyyy", { locale });
                    // Si le mois n'existe pas déjà, l'ajouter
                    if (!monthMap.has(monthKey)) {
                        monthMap.set(monthKey, {
                            months: monthKey,
                            days: item.nomber_of_days
                        });
                    }
                });
                // Convertir les valeurs du Map en tableau
                this.moments = Array.from(monthMap.values());
                
            return this.moments;

            } catch (error) {
                alert(error+ "Erreur d'uniqueMonths date");
            }
        },

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
                this.dates = this.getUniqueMonth();
                
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
