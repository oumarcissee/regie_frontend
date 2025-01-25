import { defineStore } from 'pinia';
// project imports
import { isAxiosError, currentMonth ,showNotification } from '@/services/utils';

// import { router } from '@/router';

import ApiAxios from '@/services/ApiAxios';
import Swal from 'sweetalert2'


import { ref } from 'vue';

export const useDischargeStore = defineStore({
    id: 'useDischarge',
    state: () => ({
        url: 'boredereaux',
        categroy: 'unit',
        boredereaux: [] as any,
        areas: [] as any,
        products: [] as any,
        dialog: false,

        errors : ref({
            nameError: null,
            nameText: null,
            
            shortNameError: null,
            shortNameText: null
        })
    
    }),
    getters: {
        getDischarge(state) {
            return state.boredereaux;
        },
        getProducts(state) {
            return state.products;
        }
    },
    actions: {
         async fetchProducts() {
            try {
                const response = await new ApiAxios().find(`/items/`);

               this.products = await response?.data?.results.map((item: any, index: number) => ({
                    ref: item.ref,
                    item: {
                        name: item.name,
                        image: item.image,
                        description: item.description,
                    },
                    
                    price: item.price,
                    unite: item.unite,
                    choise: item.choise,
                    quantity: item.quantity,
                    rate_per_days: item.rate_per_days,
                    divider: item.divider,
                    created_at : new Date(item.created_at),
                    modified_at : new Date(item.modified_at),
                    actions: item,
                    raw: item // Keep raw data for actions
               }).choise = true);
                console.log(response?.data?.results);

                return this.products;
            } catch (error) {
                alert(error);
                console.log(error);
            }
        },

        async fetchAllAreas() {
            try {
                const response = await new ApiAxios().find(`/${this.url}/`);
                // Formater les données pour EasyDataTable
                this.areas = response.data.results;
                console.log(this.areas);
                return true;

            } catch (error) {
                console.log(error);
                return false;
            }
        },
    
        async fetchDischarge() {
            try {
                const response = await new ApiAxios().find(`/${this.url}/`);
                this.boredereaux = response?.data?.results;
                console.log(this.boredereaux);
                
                // Formater les données pour EasyDataTable
                // this.boredereaux = (response?.data?.results || []).map((bor: any) => ({
                //     ref: bor.ref || 'N/A',
                //     name: bor.name || 'N/A',
                //     area: bor.area || 'N/A',
                //     image: bor.image ,
                //     type_of_unit: bor.type_of_unit || 'N/A',
                //     category: bor.category || 'N/A',
                //     effective: bor.effective || 0,
                //     status: bor.status || 0,
                //     g_staff: bor.g_staff || 'N/A',
                //     description: bor.description || 'Aucune description',
                //     created_at: bor.created_at || null,
                //     modified_at: bor.modified_at || null,
                   
                //     actions: bor,
                //     raw: bor // Keep raw data for actions
                // }));
                return true;

            } catch (error) {
                console.log(error);
                return false;
            }
        },

        //Ajout d'un élement
        async addOrUpdateUnit(data: FormData, param?: any) {
            try {
                if (param) {
                    const response = await new ApiAxios().updatePartialForm(`/${this.url}/${param}/`, data, param);
                } else {
                    const response = await new ApiAxios().addForm(`/${this.url}/`, data);
                    this.$reset();
                }
                return true;
            } catch (error: any) {
                // Vérification du type d'erreur
                console.log(error)
                if (error.response) {
                    // Si c'est une erreur de doublon (généralement code 400 ou 409)
                    if (error.response.status === 400 || error.response.status === 409) {
                        // Si le message d'erreur contient une indication de doublon
                        if (error.response.data) {

                            const responseData = error.response.data as { name: string[], short_name: string[] };
                            
                            this.errors.nameError = responseData.name ? responseData.name[0] : null;
                            this.errors.nameText = data.get('name')

                            this.errors.shortNameError = responseData.short_name ? responseData.short_name[0] : null;
                            this.errors.shortNameText = data.get('short_name');

                            
                            // Retourner un objet d'erreur personnalisé
                            return Promise.reject({
                                type: 'DUPLICATE_ERROR',
                                message: 'Cette unité existe déjà dans la base de données',
                                originalError: error.response.data
                            });
                        }
                    }
                 
                }
             
                showNotification("Y'a une erreur serveur.", 'error');
            
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
                        this.boredereaux = this.boredereaux?.filter((user: any) => user.id !== item.id);
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
