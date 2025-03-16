import { defineStore } from 'pinia';
// project imports
import { isAxiosError, currentMoment ,showNotification, get_staffs } from '@/services/utils';

// import { router } from '@/router';

import ApiAxios from '@/services/ApiAxios';
import Swal from 'sweetalert2'

import fr from 'date-fns/locale/fr';
import { format } from 'date-fns';
import { da } from 'date-fns/locale';
import { ref } from 'vue';
const locale = fr; // or en, or es

export const useUnitStore = defineStore({
    id: 'unitStore',
    state: () => ({
        url: 'unites',
        categroy: 'unit',
        unites: [] as any,
        areas: [] as any,
        months: [] as any,
        dialog: false,

        errors : ref({
            nameError: null,
            nameText: null,
            
            shortNameError: null,
            shortNameText: null
        })
    
    }),
    getters: {
        getUnites(state) {
            return state.unites;
        },
        getMonths(state) {
            return state.months;
        }
    },
    actions: {

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
    
        async fetchUnites() {
            try {
                const response = await new ApiAxios().find(`/${this.url}/`);
        
                // Formater les données pour EasyDataTable
                this.unites = (response?.data?.results || []).map((unite: any) => ({
                    ref: unite.ref || 'N/A',
                    short_name: unite.short_name  || 'N/A',
                    name: unite.name || 'N/A',
                    area: unite.area || 'N/A',
                    image: unite.image ,
                    type_of_unit: unite.type_of_unit || 'N/A',
                    category: unite.category || 'N/A',
                    effective: unite.effective || 0,
                    status: unite.status || 0,
                    g_staff: get_staffs(unite.g_staff) || 'N/A',
                    description: unite.description || 'Aucune description',
                    created_at: unite.created_at || null,
                    modified_at: unite.modified_at || null,
                   
                    actions: unite,
                    raw: unite // Keep raw data for actions
                }));
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
                        this.unites = this.unites?.filter((user: any) => user.id !== item.id);
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
