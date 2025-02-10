import { defineStore } from 'pinia';
import { isAxiosError, currentMoment ,showNotification } from '@/services/utils';

import ApiAxios from '@/services/ApiAxios';
import Swal from 'sweetalert2'

import { ref } from 'vue';

export const useSubAreStore = defineStore({
    id: 'subAreaStore',
    state: () => ({
        url: 'subareas',
        lineUrl: 'line-sub-area',
        sub_areas: [] as any,
        
        dialog: false,

        errors : ref({
            nameError: null,
            nameText: null,

        })
    
    }),
    getters: {
        getUnites(state) {
            return state.sub_areas;
        },
        // getMonths(state) {
        //     return state.months;
        // }
    },
    actions: {
    
        async fetchSoubArea() {
            try {
                const response = await new ApiAxios().find(`/${this.url}/`);
        
                // Formater les données pour EasyDataTable
                this.sub_areas = (response?.data?.results || []).map((item: any) => ({
                    ref: item.ref || 'N/A',
                    name: item.name || 'N/A',
                    area: item.area || 'N/A',
                   
                    created_at: item.created_at || null,
                    modified_at: item.modified_at || null,
                    description: item.description || 'Aucune description',
                    
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
        async addOrUpdateSubArea(data: FormData, param?: any) {
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
                        this.sub_areas = this.sub_areas?.filter((user: any) => user.id !== item.id);
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
