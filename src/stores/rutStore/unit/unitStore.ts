import { defineStore } from 'pinia';
// project imports
import { isAxiosError, currentMonth } from '@/services/utils';

// import { router } from '@/router';

import ApiAxios from '@/services/ApiAxios';
import Swal from 'sweetalert2'

import fr from 'date-fns/locale/fr';
import { format } from 'date-fns';
import { da } from 'date-fns/locale';
const locale = fr; // or en, or es

export const useUnitStore = defineStore({
    id: 'unitStore',
    state: () => ({
        url: 'unites',
        categroy: 'unit',
        unites: [] as any,
        unitesLine: [] as any,
        months: [] as any,
        dialog: false,
        errors: {
            nameError: null as any,
            nameText: null as any,

            short_name_error: null as any,
            short_name_text: null as any,
        },
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
    
        async fetchUnites() {
            try {
                const response = await new ApiAxios().find(`/${this.url}/`);

                // this.unites = await response?.data?.results;

                // const response = await new ApiAxios().find(`/${this.url}/`);
        
                // Formater les données pour EasyDataTable
                this.unites = (response?.data?.results || []).map((unite: any) => ({
                    ref: unite.ref || 'N/A',
                    short_name: unite.short_name || unite.name || 'N/A',
                    name: unite.name || 'N/A',
                    area: unite.area || 'N/A',
                    type_of_unit: unite.type_of_unit || 'N/A',
                    effective: unite.effective || 0,
                    g_staff: unite.g_staff || 'N/A',
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
        async addOrUpdateUnit(data: any, param?: any) {
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
                            this.errors.nameText = data.name
                            
                            // Retourner un objet d'erreur personnalisé
                            return Promise.reject({
                                type: 'DUPLICATE_ERROR',
                                message: 'Cette unité existe déjà dans la base de données',
                                originalError: error.response.data
                            });
                        }
                    }

                    //  if (isAxiosError(error)) {
                    //     if (error.response && error.response.data) {
                    //         console.log(error.response.data);
                
                    //         const responseData = error.response.data as { username: string[], email: string[], phone_number: string[], error: string[], password: string[]};
    
                    //         this.errors.usernameError = responseData.username ? responseData.username[0] : null;
                    //         this.errors.usernameText = data.username
    
                    //         this.errors.emailError = responseData.email ? responseData.email[0] : null;
                    //         this.errors.emailText = data.email;
    
                    //         this.errors.phone_numberError = responseData.phone_number ? responseData.phone_number[0] : null;
                    //         this.errors.phone_numberText = data.phone_number;
            
                            
                    //         if (responseData.error) {
                    //             router.push({name: 'Providers'})
                    //         }
                    //     }
                    // }
                }
                
                // Pour les autres types d'erreurs
                console.error('Erreur lors de l\'opération:', error);
                return Promise.reject({
                    type: 'GENERAL_ERROR',
                    message: 'Une erreur est survenue lors de l\'opération',
                    originalError: error
                });
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
