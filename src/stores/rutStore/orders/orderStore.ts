import { defineStore } from 'pinia';
// project imports
import { isAxiosError } from '@/services/utils';
import { router } from '@/router';

import ApiAxios from '@/services/ApiAxios';
import Swal from 'sweetalert2'



export const useOrderStore = defineStore({
    id: 'orderStore',
    state: () => ({
        orders: [],
        errors: {
            nameError: null as any,
            nameText: null as any,
        },
    }),
    getters: {
        getOrders(state) {
            return state.orders;
        }
    },
    actions: {
        // Fetch followers from action
        async fetchOrders() {
            try {
                const response = await new ApiAxios().find(`/orders/`);
                // console.log(response, "Dans try");
                this.orders = response.data.results
            } catch (error) {
                alert(error);
                console.log(error);
            }
        },

        //Ajout d'un élement
        async addOrUpdateProduct(data: any, param?: any) {
            try {
                if (param) {
                    const response = await new ApiAxios().updatePartialForm(`/orders/${param}/`, data, param);
                    // await this.fetchItems()

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
                    const response = await new ApiAxios().addForm('/orders/', data);
                    console.log(response.data);
        
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
             
            } catch (error) {

                if (isAxiosError(error)) {
                    // console.log(error)
                    if (error.response && error.response.data) {
                      
                        const responseData = error.response.data as { name: string[]};
                        this.errors.nameError = responseData.name ? "Cet article existe déja." : null;
                        this.errors.nameText = data.get('name')
                        
                      
                    }
                }
                return Promise.reject("Autres erreur");
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
                    this.orders = this.orders?.filter((user: any) => user.id !== item.id);

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
