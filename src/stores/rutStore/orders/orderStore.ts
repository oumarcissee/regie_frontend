import { defineStore } from 'pinia';
// project imports
import { isAxiosError } from '@/services/utils';
import { router } from '@/router';

import ApiAxios from '@/services/ApiAxios';
import Swal from 'sweetalert2'

import fr from 'date-fns/locale/fr';
import { format } from 'date-fns';
const locale = fr; // or en, or es




export const useOrderStore = defineStore({
    id: 'orderStore',
    state: () => ({
        orders: [],
        ordersLine: [],
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
                this.orders.forEach((item: any) => {

                    item.created_at  = format(new Date(item.created_at), "dd, MMMM yyyy", { locale });
                    item.modified_at = format(new Date(item.modified_at), "dd, MMMM yyyy", { locale });
                    // item.user = item.provider.first_name + " " + item.provider.last_name;
                    item.image = item.provider.image;
                    item.first_name = item.provider.first_name;
                    item.last_name = item.provider.last_name;
                    item.contact  = item.provider.phone_number;
                    item.email   = item.provider.email;
                });
            } catch (error) {
                alert(error);
                console.log(error);
            }
        },

         //Cette fonction retourne les lingnes de commande
        async fetchOrdersLine() {
            try {
                const response = await new ApiAxios().find(`/orders-line/`);
                // console.log(response, "Commande line: ");
                this.ordersLine = response.data.results
               
            } catch (error) {
                alert(error);
                console.log(error);
            }
        },

        //Ajout d'un élement
        async addOrUpdateOrder(data: any, param?: any) {
            try {
                if (param) {
                    // const response = await new ApiAxios().updatePartialForm(`/orders/${param}/`, data, param);
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
                    
                    //Ajout de la commande
                    const OrderResponse = await new ApiAxios().add('/orders/', data.order);
                    //Ajout de la ligne de commande
                    data.orderLine.forEach(async (item: any) => {
                        const response = await new ApiAxios().add('/orders-line/', {quantity: item.quantity,item: item.item.id, order: OrderResponse.data.id});
                    });
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
