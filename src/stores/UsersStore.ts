import { defineStore } from 'pinia';
import { isAxiosError } from '@/services/utils';
import { router } from '@/router';
import { fetchWrapper } from '@/utils/helpers/fetch-wrapper';

import ApiAxios from '@/services/ApiAxios';

import type { UsersStateProps } from '@/types/UsersTypes';
import { filter, map, sum } from 'lodash';

// Interface pour typer les erreurs

export const UsersStore = defineStore({
    id: 'usersStore',
    state: (): UsersStateProps => ({
        users: [],
        gender: '',
        category: [],
        price: '',
        subTotal: 0,
        discount: 5,
        total: 0,

        errors: {} as any
    }),

    getters: {},
    actions: {

        async add(data: any) {
            try {
                const response = await new ApiAxios().add('/u/create-provider/', data);
                router.push({name: 'Users'})
                // this.store = response.data;
                // localStorage.setItem('user', JSON.stringify(response.data));
                
            } catch (error) {
                if (isAxiosError(error)) {
                    if (error.response && error.response.data) {
                        console.log(error.response.data);
            
                        const responseData = error.response.data as { username: string[], email: string[], phone_number: string[], error: string[]};

                        this.errors.usernameError     = responseData.username ? responseData.username[0] : null;
                        this.errors.usernameText      = data.username

                        this.errors.emailError        = responseData.email ? responseData.email[0] : null;
                        this.errors.emailText         = data.email;

                        this.errors.phone_numberError = responseData.phone_number ? responseData.phone_number[0] : null;
                        this.errors.phone_numberText  = data.phone_number;
        
                        if (responseData.error) {
                            router.push({name: 'Users'})
                        }
                    }
                }
                return Promise.reject("Autres erreur");
            }
        },

        // Fetch Customers from action
        async fetchUsers() {
            try {
                const data = await new ApiAxios().find('/users')
                this.users = data.data;
            } catch (error) {
                alert(error);
                console.log(error);
            }
        },
    
        //select gender
        SelectGender(items: any) {
            this.gender = items;
        },
       
        //select category
        SelectCategory(items: any) {
            this.category = items;
        },
       

        //Reset Filter
        filterReset(){}


    }
});
