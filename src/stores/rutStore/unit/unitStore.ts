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
                this.unites = response.data.results;    
                return true;

            } catch (error) {
                console.log(error);
                return false;
            }
        },

        //Ajout d'un élement
        async addOrUpdateUnit(data: any, param?: any) {
            try {

                //Si c'est une modification
                if (param) {
               
                    const response = await new ApiAxios().updatePartialForm(`/${this.url}/${param}/`, data, param);
                    // Swal.fire({
                    //     position: "center",
                    //     icon: "success",
                    //     title: "Commande modifiée avec succès!",
                    //     showConfirmButton: false,
                    //     timer: 2000,
                    //     showClass: {
                    //         popup: `
                    //         animate__animated
                    //         animate__fadeInRight
                    //         animate__faster
                    //         `
                    //     },
                    //     hideClass: {
                    //         popup: `
                    //         animate__animated
                    //         animate__fadeInRight
                    //         animate__faster
                    //         `
                    //     }
                    // });
                } else {
                    //Ajout de la commande
                    const response = await new ApiAxios().addForm(`/${this.url}/`, data);

                    this.$reset()
                    
                    // Swal.fire({
                    //     position: "center",
                    //     icon: "success",
                    //     title: "Unité enregistrée avec succès!",
                    //     showConfirmButton: false,
                    //     timer: 2000,
                    //     showClass: {
                    //         popup: `
                    //         animate__animated
                    //         animate__fadeInRight
                    //         animate__faster
                    //         `
                    //     },
                    //     hideClass: {
                    //         popup: `
                    //         animate__animated
                    //         animate__fadeInRight
                    //         animate__faster
                    //         `
                    //     }
                    // });
                }
                return true;
             
            } catch (error) {

                return Promise.reject(error + "Autres erreur");
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
