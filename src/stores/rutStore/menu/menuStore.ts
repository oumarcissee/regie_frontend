import { defineStore } from 'pinia';
import { showNotification, type_of_spending , } from '@/services/utils';

import ApiAxios from '@/services/ApiAxios';
import Swal from 'sweetalert2'

import { ref } from 'vue';

export const useMenuStore = defineStore({
    id: 'menuStore',
    state: () => ({
        url: 'spends',
        lineUrl: 'line-sub-area',
        menus: [] as any,
        menusData: [] as any,
        
        dialog: false,

        errors : ref({
            nameError: null,
            nameText: null,

        })
    
    }),
    getters: {
        getMenus(state) {
            return state.menus;
        },
        // getMonths(state) {
        //     return state.months;
        // }
    },
    actions: {
    
        async fetchMenus(type: string) {
            try {
                const response = await new ApiAxios().find(`/${this.url}/`);


                this.menusData = response?.data?.results.filter((item: { type_menu: string; }) => item.type_menu === type);
        
                // Formater les données pour EasyDataTable
                this.menus = (response?.data?.results || []).map((item: any) => ({
                    ref: item.ref || 'N/A',
                    item: {
                        name: item.name || 'N/A',
                        image: item.image || 'N/A',
                        rate: item.rate || 0,
                        price: item.price || 6,
                        status: item.status || true,
                        description: item.description || 'Aucune description',
                    },
                    type_menu: item.type_menu || 'N/A',
                    
                    created_at: item.created_at || null,
                    modified_at: item.modified_at || null,
                    
                    actions: item,
                    raw: item // Keep raw data for actions
                }));
                return true;

            } catch (error) {
                console.log(error);
                return false;
            }
        },

        //Ajout d'un élement
        async addOrUpdateMenu(data: FormData, param?: any) {
            try {
                if (param) {
                    const response = await new ApiAxios().updatePartialForm(`/${this.url}/${param}/`, data);
                } else {
                    const response = await new ApiAxios().addForm(`/${this.url}/`, data);
                    this.$reset();
                }
                return true;
            } catch (error: any) {
                // Vérification du type d'erreur
                // console.log(error)
                if (error.response) {
                    // Si c'est une erreur de doublon (généralement code 400 ou 409)
                    if (error.response.status === 400 || error.response.status === 409) {
                        // Si le message d'erreur contient une indication de doublon
                        if (error.response.data) {

                            const responseData = error.response.data as { name: string[], short_name: string[] };
                            
                            this.errors.nameError = responseData.name ? responseData.name[0] : null;
                            this.errors.nameText = data.get('name')

            
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
         */
        async deleteItem(item: any): Promise<boolean> {
            try {
                const result = await Swal.fire({
                    title: "Êtes vous sûr ?",
                    text: "Vous ne pourrez plus revenir en arrière!",
                    icon: "warning",
                    showCancelButton: true,
                    cancelButtonText: "Annuler",
                    confirmButtonColor: "#d33",
                    cancelButtonColor: "#3085d6",
                    confirmButtonText: "Oui, Je le supprime!"
                });

                if (result.isConfirmed) {
                    await new ApiAxios().delete(`/${this.url}/${item.id}/`);
                    
                    // Mettre à jour le state local après une suppression réussie
                    this.menus = this.menus.filter((menu: any) => menu.id !== item.id);
                    
                    await Swal.fire({
                        title: "Supprimé!",
                        text: "Votre objet a bien été supprimé.",
                        icon: "success"
                    });
                    
                    return true;
                }
                return false;
            } catch (error) {
                console.error(error);
                await Swal.fire({
                    title: "Erreur!",
                    text: "Votre objet ne peut pas être supprimé.",
                    icon: "warning"
                });
                return false;
            }
        }
    }
});
