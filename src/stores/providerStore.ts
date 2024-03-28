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
            passwordError: null as any,
            passwordText: null as any,
           
        },
        itemSelected: null,
        store: Object(),
    }),
    actions: {
        async add(data: any, param?: any) {
            try {
                if (param) {
                    const response = await new ApiAxios().updatePartialForm(`/users/${param}/`, data, param);
                    router.push({ name: 'Providers' })
                    this.$reset()
                    Swal.fire({
                        position: "center",
                        icon: "success",
                        title: "Modification effectué",
                        showConfirmButton: false,
                        timer: 2000,
                        showClass: {
                            popup: `
                            animate__animated
                            animate__fadeInRight
                            animate__faster
                            `
                        },
                        hideClass: {
                            popup: `
                            animate__animated
                            animate__fadeInRight
                            animate__faster
                            `
                        }
                    });
                } else {
                    const response = await new ApiAxios().add('/u/create-provider/', data);
                    router.push({ name: 'Providers' })
                    this.$reset()
                    Swal.fire({
                        position: "center",
                        icon: "success",
                        title: "Enregisrement effectué",
                        showConfirmButton: false,
                        timer: 2000,
                        showClass: {
                            popup: `
                            animate__animated
                            animate__fadeInRight
                            animate__faster
                            `
                        },
                        hideClass: {
                            popup: `
                            animate__animated
                            animate__fadeInRight
                            animate__faster
                            `
                        }
                    });
                }
                // this.store = response.data;
                // localStorage.setItem('user', JSON.stringify(response.data));
                
            } catch (error) {
                if (isAxiosError(error)) {
                    if (error.response && error.response.data) {
                        console.log(error.response.data);
            
                        const responseData = error.response.data as { username: string[], email: string[], phone_number: string[], error: string[], password: string[]};

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
