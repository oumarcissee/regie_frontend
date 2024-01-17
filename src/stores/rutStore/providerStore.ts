import { defineStore } from 'pinia';
// project imports
import ApiAxios from '@/services/ApiAxios';

export const useProviderStore = defineStore({
    id: 'rutProviders',
    state: () => ({
        providers: []
    }),
    getters: {},
    actions: {
        // Fetch followers from action
        async fetchProviders() {
            try {
                const response = await new ApiAxios().find('/app/u/create-provider/');
                this.providers = response.data.contacts;
            } catch (error) {
                alert(error);
                return Promise.reject(error);
            }
        }
    }
});
