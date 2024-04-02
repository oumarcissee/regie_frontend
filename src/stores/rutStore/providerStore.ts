import { defineStore } from 'pinia';
// project imports
import ApiAxios from '@/services/ApiAxios';
import fr from 'date-fns/locale/fr';
import { format } from 'date-fns';

const locale = fr; // or en, or es


import axios from '@/utils/axios';



import type { UsersStateProps } from '@/types/rut/ProvidersType';
import { filter, map, sum } from 'lodash';


export const useProviderStore = defineStore({
    id: 'rutProviders',
    state: (): UsersStateProps => ({
        users: [],

        item: '',
      
        cart: [],
        gender: '',
        category: [],
        price: '',
        subTotal: 0,
        discount: 5,
        total: 0,
        addresses: [],
        color: 'All',
        
    }),
    getters: {},
    actions: {
        // Fetch followers from action
        async fetchUsers() {
            try {
                const response = await new ApiAxios().find('/u/get-users/');

                response.data?.results.forEach((item: any) => {
                    switch (item.role) {
                        case 'provider':
                            item.role = 'FOURNISSEUR';
                            break;
                        case 'kepper_a':
                            item.role = 'MAGASINIER (A)';
                        break;
                        case 'manager_a':
                            item.role = 'RUT';
                        break;
                        case 'manager_b':
                            item.role = 'OPEX';
                        break;
                        default:
                            item.role = 'UNDEFINIT';
                            break;
                    }

                    item.date_joined = format(new Date(item.date_joined),"dd, MMMM yyyy", { locale });

                    this.users?.push(item);
                });

                
                
            } catch (error) {
                alert(error);
                return Promise.reject(error);
            }
        },
        //Reset Filter
        filterReset(){}


     
       
       
       
    }
});
