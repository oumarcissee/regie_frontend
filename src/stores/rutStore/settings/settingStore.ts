import { defineStore } from 'pinia';
// project imports
import ApiAxios from '@/services/ApiAxios';
import Swal from 'sweetalert2'

import fr from 'date-fns/locale/fr';
import { format } from 'date-fns';
const locale = fr; // or en, or es

export const useSettingStore = defineStore({
    id: 'settings-store',
    state: () => ({
        items: [] as any,
        url: 'operators',
    
        dialog: false,
        errors: {
            nameError: null as any,
            nameText: null as any,
        },
    }),
    getters: {
        getOrders(state) {
            
            return state.items;
        },
        
    },
    actions: {

        async fetchOrderById(id: number) {
            try {
                const response = await new ApiAxios().find(`/${this.url}/${id}`);
                return response.data.results;
                } catch (error) {
                console.error('Error fetching order:', error);
                throw error;
            }
        },
        // Fetch followers from action
        
        async fetchSignators() {
    
            try {
                const response = await new ApiAxios().find(`/${this.url}/`);

                return this.items = response.data.results;    

            } catch (error) {
                alert(error);
                console.log(error);
            }
        },

 

        //Ajout d'un élement
        async addOrUpdateSignator(data: any, param?: any) {
      
            try {

                //Si c'est une modification
                if (param) {
               
                    const OrderResponse = await new ApiAxios().updatePartialForm(`/${this.url}/${param}/`, data, param);

                    Swal.fire({
                        position: "center",
                        icon: "success",
                        title: "Commande modifiée avec succès!",
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
                    
                    // console.log(data.order);
                    // return;
                    //Ajout de la commande
                    const OrderResponse = await new ApiAxios().add(`/${this.url}/`, data.order);
                  
                
                    //Enregistrement de la date
                    // const archiveResponse = await new ApiAxios().add(`/archives/`, {order: OrderResponse.data.id});
                    

                    this.$reset()
                    
                    Swal.fire({
                        position: "center",
                        icon: "success",
                        title: "Commande enregistrée avec succès!",
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
             
            } catch (error) {

                return Promise.reject(error + "Autres erreur");
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
            confirmButtonColor: "#d33",
            cancelButtonColor: "#3085d6",
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
