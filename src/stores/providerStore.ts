import { defineStore } from 'pinia';
import { isAxiosError } from '@/services/utils';
import { router } from '@/router';
import { fetchWrapper } from '@/utils/helpers/fetch-wrapper';

import ApiAxios from '@/services/ApiAxios';

import Swal from 'sweetalert2'


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
                const response = await new ApiAxios().add('/u/create-provider/', data);
                router.push({ name: 'Providers' })
                Swal.fire({
                    position: "top-end",
                    icon: "success",
                    title: "Objet ajouté avec succès",
                    showConfirmButton: false,
                    timer: 3000
                });
                // this.store = response.data;
                // localStorage.setItem('user', JSON.stringify(response.data));
                
            } catch (error) {
                if (isAxiosError(error)) {
                    if (error.response && error.response.data) {
                        console.log(error.response.data);
            
                        const responseData = error.response.data as { username: string[], email: string[], phone_number: string[], error: string[]};

                        this.errors.usernameError = responseData.username ? responseData.username[0] : null;
                        this.errors.usernameText = data.username

                        this.errors.emailError = responseData.email ? responseData.email[0] : null;
                        this.errors.emailText = data.email;

                        this.errors.phone_numberError = responseData.phone_number ? responseData.phone_number[0] : null;
                        this.errors.phone_numberText = data.phone_number;
        
                        if (responseData.error) {
                            router.push({name: 'Providers'})
                        }
                    }
                }
                return Promise.reject("Autres erreur");
            }
        }
    }
});
