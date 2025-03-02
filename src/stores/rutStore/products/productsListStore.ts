import { defineStore } from 'pinia';
// project imports
import { isAxiosError } from '@/services/utils';
import { router } from '@/router';

import ApiAxios from '@/services/ApiAxios';
import Swal from 'sweetalert2'



export const useProductsList = defineStore({
    id: 'productsListStore',
    state: () => ({
        items: [] as any,
        products: [] as any,
        errors: {
            nameError: null as any,
            nameText: null as any,
        },
    }),
    getters: {
        getProducts(state) {
            return state.products;
        }
    },
    actions: {
        // Fetch followers from action
        async fetchItems() {
            try {
                const response = await new ApiAxios().find(`/items/`);
                this.products = response.data.results;
                
               this.items = await response?.data?.results.map((item: any, index: number) => ({
                    ref: item.ref,
                    item: {
                        name: item.name,
                        image: item.image,
                        description: item.description,
                    },
                    
                    price: item.price,
                    choice: item.status === true ? "Activé" : "Désactivé",
                    rate_per_days: item.rate_per_days,
                    divider: item.divider,
                    created_at : new Date(item.created_at),
                    modified_at : new Date(item.modified_at),
                    actions: item,
                    raw: item // Keep raw data for actions
                }));

                return this.items;
            } catch (error) {
                alert(error);
                console.log(error);
            }
        },

        //Ajout d'un élement
        async addOrUpdateProduct(data: any, param?: any) {
            try {
                if (param) {
                    const response = await new ApiAxios().updatePartialForm(`/items/${param}/`, data, param);
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
                    const response = await new ApiAxios().addForm('/items/', data);
        
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
        async deleteItem (item: any, url: string): Promise<Boolean> {
            return Swal.fire({
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
                        await this.fetchItems(); //Actualisation

                        Swal.fire({
                            title: "Supprimé!",
                            text: "Votre objet a bien été supprimé.",
                            icon: "success"
                        });
                        //
                        this.items = this.items?.filter((user: any) => user.id !== item.id);
                        return true;
                    } catch (error) {
                        console.log(error);
                        Swal.fire({
                            title: "Erreur!",
                            text: "Votre objet ne peut pas être supprimé.",
                            icon: "warning"
                        });
                        return false;
                    }

                }

            });
        }
    }
});

