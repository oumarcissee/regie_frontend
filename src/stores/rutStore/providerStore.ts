import { defineStore } from 'pinia';
// project imports
import ApiAxios from '@/services/ApiAxios';
import Swal from 'sweetalert2';
import fr from 'date-fns/locale/fr';
import { format } from 'date-fns';

const locale = fr; // or en, or es



import type { UsersStateProps } from '@/types/rut/ProvidersType';
import { filter, map, sum } from 'lodash';


export const useProviderStore = defineStore({
    id: 'rutProviders',
    state: (): UsersStateProps => ({
        users: [],
        items: [],

        isConfirmButton: false,
      
        gender: '',
        category: [],
        price: '',
        subTotal: 0,
        discount: 5,
        total: 0,
        addresses: [],
        color: 'All',
        
    }),
    getters: {
        getItems(state) {
        // autocompletion! ✨
            return state.items
        },
       
    },
    actions: {
        // Fetch followers from action
        async fetchUsers() {
            try {
                const response = await new ApiAxios().find('/u/get-users/');
                const items: any[] | undefined = []

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

                    items.push(item);
                });
 
                this.items = items;
                
            } catch (error) {
                alert(error);
                return Promise.reject(error);
            }
        },
        

        /**
         * @param  {String} item 
         * @param  {String} url 
         */
        async deleteItem (item: any, url: string){
            Swal.fire({
            title: "Êtes vous sûr ?",
            text: "Vous ne pourrez plus revenir en arrière!",
            icon: "warning",
            showCancelButton: true,
            cancelButtonText: "Annuler",
            confirmButtonColor: "#3085d6",
            cancelButtonColor: "#d33",
            confirmButtonText: "Oui, Je le supprime!"
            }).then(async (result) => {
            if (result.isConfirmed) {
                try {
                    const response = await new ApiAxios().delete(`/${url}/${item.id}/`, item.id);
                    Swal.fire({
                        title: "Supprimé!",
                        text: "Votre objet a bien été supprimé.",
                        icon: "success"
                    });
                    //
                    this.items = this.items?.filter((user: any) => user.id !== item.id);

                } catch (error) {
                    console.log(error);
                    Swal.fire({
                        title: "Erreur!",
                        text: "Votre objet ne peut pas être supprimé.",
                        icon: "warning"
                    });
                    return error;
                }
                
            }
                
            });
        }
       
    }
});
