import { defineStore } from 'pinia';
// project imports
import { isAxiosError, currentMonth } from '@/services/utils';

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
        months: [] as any,
        errors: {
            nameError: null as any,
            nameText: null as any,
        },
    }),
    getters: {
        getOrders(state) {
            
            return state.orders;
        },
        getMonths(state) {
            return state.months;
        }
    },
    actions: {
        // Fetch followers from action
        
        async fetchOrders() {
            try {
                const response = await new ApiAxios().find(`/orders/`);

                // console.log(response, "Dans try");
                // return;
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
        //
        async getUniqueMonth() {
            try {
                const archives = await new ApiAxios().find('/archives/');

                const uniqueMonths = new Set();
  
                archives.data.results.forEach((item: any) => {
                    uniqueMonths.add(format(new Date(item.date), "MMMM yyyy", { locale }));
                });
               
                Array.from(uniqueMonths).forEach((item: any) => {
                    this.months.push(item);
                });
                
                currentMonth.value = currentMonth.value ?? this.months[0];
      
                return this.months

            } catch (error) {
                alert(error+ "Erreur d'uniqueMonths date");
            }
        },

        //Ajout d'un élement
        async addOrUpdateOrder(data: any, param?: any) {
      
            try {

                //Si c'est une modification
                if (param) {
               
                    const OrderResponse = await new ApiAxios().updatePartialForm(`/orders/${param}/`, {status: data.order.status}, param);
                    
                    //Suppression des anciennes commande
                    const response = await new ApiAxios().find(`/orders-line/?order=${param}`);
                  
                    response.data.results.forEach(async (item: any) => {
                        await new ApiAxios().delete(`/orders-line/${item.id}/`, item.id);
                    });

                
                    //Ajout des articles dans la commande
                    data.orderLine.forEach(async (item: any) => {
                        const response = await new ApiAxios().add('/orders-line/', {quantity: item.quantity,item: item.item.id, order: OrderResponse.data.id});
                    });
                    //Enregistrement de la date
                    const archiveResponse = await new ApiAxios().add('/archives/', {order: OrderResponse.data.id});
                   this.getUniqueMonth()

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
                    const OrderResponse = await new ApiAxios().add('/orders/', data.order);
                  
                    //Ajout des articles dans la commande
                    data.orderLine.forEach(async (item: any) => {
                        const response = await new ApiAxios().add('/orders-line/', {quantity: item.quantity,item: item.item.id, order: OrderResponse.data.id});
                    });
                    //Enregistrement de la date
                    const archiveResponse = await new ApiAxios().add('/archives/', {order: OrderResponse.data.id});
                   this.getUniqueMonth()
                    

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
