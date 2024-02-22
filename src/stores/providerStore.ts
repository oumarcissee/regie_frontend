import { defineStore } from 'pinia';
import { isAxiosError } from '@/services/utils';
import { router } from '@/router';
import { fetchWrapper } from '@/utils/helpers/fetch-wrapper';

import ApiAxios from '@/services/ApiAxios';

const baseUrl = `${import.meta.env.VITE_API_URL}/users`;

export const useProdiverStore = defineStore({
    id: 'providerStore',
    state: () => ({
        // initialize state from local storage to enable user to stay logged in
        errors: {
            usernameError: null as any,
            usernameText: null as any,
            emailError: null as any,
            emailText: null as any,
            phone_numberError: null as any,
            phone_numberText: null as any,
           
        },
        store: Object(),
    }),
    actions: {
        async add(data: any) {
            try {
                const response = await new ApiAxios().add('/u/users/', data);
            } catch (error) {
                if (isAxiosError(error)) {
                    if (error.response && error.response.data) {
            
                        const responseData = error.response.data as { username: string[], email: string[], phone: string[]};

                        this.errors.usernameError = responseData.username ? responseData.username[0] : null;
                        this.errors.usernameText = data.username

                        this.errors.emailError = responseData.email ? responseData.email[0] : null;
                        this.errors.emailText = data.email;

                        this.errors.phone_numberError = responseData.phone ? responseData.phone[0] : null;
                        this.errors.phone_numberText = data.phone;
                        
                        
                        // Utilisez usernameError et emailError comme vous le souhaitez,
                        // par exemple, vous pouvez les enregistrer dans un fichier TypeScript
                        
                        return Promise.reject(this.errors);
                    }
                }
                return Promise.reject("Autres erreur");
            }
        }
    }
});
