import { defineStore } from 'pinia';
import { useAuthStore } from '@/stores/auth';
// project imports

import ApiAxios from '@/services/ApiAxios';
import Swal from 'sweetalert2'


export const useOrderStore = defineStore({
    id: 'orderStore',
    state: () => ({
        orders: [] as any,
        ordersLine: [] as any,
        moments: [] as any,
        dialog: false,
        errors: {
            nameError: null as any,
        },
    }),
    getters: {
        getOrders(state) {
            
            return state.orders;
        },
        getMonths(state) {
            return state.moments;
        }
    },
    actions: {

        async fetchOrderById(orderId: number) {
            try {
                const response = await new ApiAxios().find(`/orders/${orderId}`);
                return response.data.results;
                } catch (error) {
                console.error('Error fetching order:', error);
                throw error;
            }
        },
        // Fetch followers from action
        
        async fetchOrders() {
            await this.fetchOrdersLine();//Récuperation des lignes de commandes
            try {
                const response = await new ApiAxios().find(`/orders/`);

                this.orders = response.data.results;    

                this.orders.forEach((item: any) => {

                    item.created_at = new Date(item.created_at);
                    item.modified_at = new Date(item.modified_at);

                    // item.created_at = format(new Date(item.created_at), "dd, MMMM yyyy HH'h'mm", { locale });
                    // item.modified_at = format(new Date(item.modified_at), "dd, MMMM yyyy", { locale });
               
                    item.image = item.provider?.image;
                    item.first_name = item.provider?.first_name;
                    item.last_name = item.provider?.last_name;
                    item.contact  = item.provider?.phone_number;
                    item.email = item.provider?.email;
                    item.address = item.provider?.address;
                    
                    item.id = item.id;

                    item.orders = this.ordersLine.filter((itemLine: { order?: any }) => itemLine?.order?.id === item.id);
                 
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
                this.ordersLine = response.data.results;
            } catch (error) {
                alert(error);
                console.log(error);
            }
        },
        
        //
        // async getUniqueMonth() {
        //     try {
        //         const archives = await new ApiAxios().find('/archives/');

        //        // Créer un Map pour stocker les mois uniques
        //         const monthMap = new Map();
                
        //         archives.data.results.forEach((item: any) => {
        //             const monthKey = format(new Date(item.date), "MMMM yyyy", { locale });
        //             // Si le mois n'existe pas déjà, l'ajouter
        //             if (!monthMap.has(monthKey)) {
        //                 monthMap.set(monthKey, {
        //                     months: monthKey,
        //                     days: item.nomber_of_days
        //                 });
        //             }
        //         });
        //         // Convertir les valeurs du Map en tableau
        //         this.moments = Array.from(monthMap.values());
                
        //     return this.moments;

        //     } catch (error) {
        //         alert(error+ "Erreur d'uniqueMonths date");
        //     }
        // },

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
                   
                    // //
                    // const archives = await new ApiAxios().find('/archives/');

                    // archives.data.results.forEach(async (item: any) => {
                    //     // if(format(new Date(item.date), "MMMM yyyy", { locale }) === format(new Date(data.order.created_at), "MMMM yyyy", { locale })) {
                    //     //     await new ApiAxios().update(`/archives/${item.id}/`, {order: OrderResponse.data.id}, item.id);
                    //     // }

                    //     if (data.order.id === item.order.id) {
                            
                    //         await new ApiAxios().update(`/archives/${item.id}/`, { order: OrderResponse.data.id }, item.id);
                            
                    //     }
                    // });
                    useAuthStore().getUniqueMonth();

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
                    // console.log(OrderResponse.data);
                  
                    //Ajout des articles dans la commande
                    data.orderLine.forEach(async (item: any) => {
                        const response = await new ApiAxios().add('/orders-line/', {quantity: item.quantity,item: item.item.id, order: OrderResponse.data.id});
                    });
                    //Enregistrement de la date
                    const archiveResponse = await new ApiAxios().add('/archives/', {order: OrderResponse.data.id});
                    useAuthStore().getUniqueMonth();
                    
                    //Récuperation des commandes
                    this.fetchOrders();
                    
                    
                    //Réinitialisation du formulaire
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
