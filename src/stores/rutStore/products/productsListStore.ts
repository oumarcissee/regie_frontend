import { defineStore } from 'pinia';
// project imports
import axios from '@/utils/axios';

export const useProductsList = defineStore({
    id: 'productsListStore',
    state: () => ({
        contacts: [],

        errors: {
            nameError: null as any,
            nameText: null as any,
            emailError: null as any,
            emailText: null as any,
            phone_numberError: null as any,
            phone_numberText: null as any,
            passwordError: null as any,
            passwordText: null as any,
           
        },

    }),
    getters: {
        getProducts(state) {
            return state.contacts;
        }
    },
    actions: {
        // Fetch followers from action
        async fetchProducts() {
            try {
                const response = await axios.get('/api/contacts');
                this.contacts = response.data.contacts;
            } catch (error) {
                alert(error);
                console.log(error);
            }
        }
    }
});
