import { defineStore } from 'pinia';
import { isAxiosError } from '@/services/utils';
import ApiAxios from '@/services/ApiAxios';
import Swal from 'sweetalert2';
import type { Signator } from '@/types/rut/SignatorType';
import { shallowRef } from 'vue';

interface SettingStoreState {
    items: Signator[];
    errors: {
        nameError: string | null;
        nameText: string | null;
    };
}

export const useSettingStore = defineStore({
    id: 'settingStore',
    state: () => ({
        items: shallowRef([]),
   
    }),

    getters: {
        getSignators(state) {
            
        }
    },
    actions: {
        async fetchSignators() {
            try {
                const response = await new ApiAxios().find(`/operators/`);
           
                return await JSON.parse(JSON.stringify(response.data.results));;
            } catch (error) {
                console.error('Erreur lors de la récupération des signataires :', error);
                
                // Afficher une notification d'erreur
                Swal.fire({
                    icon: 'error',
                    title: 'Erreur de chargement',
                    text: 'Impossible de charger les signataires'
                });

                // Retourner un tableau vide pour éviter l'erreur de rendu
                return [];
            }
        },

        async addOrUpdateProduct(data: FormData, param?: number) {
            try {
                if (param) {
                    await new ApiAxios().updatePartialForm(`/signal-operators/${param}/`, data, param);
                    
                    Swal.fire({
                        position: "center",
                        icon: "success",
                        title: "Modification effectuée",
                        showConfirmButton: false,
                        timer: 2000
                    });
                } else {
                    await new ApiAxios().addForm('/signal-operators/', data);
                    
                    Swal.fire({
                        position: "center",
                        icon: "success",
                        title: "Enregistrement effectué",
                        showConfirmButton: false,
                        timer: 2000
                    });
                }

                // Réinitialiser et recharger les données
                this.$reset();
                await this.fetchSignators();
            } catch (error) {
                if (isAxiosError(error)) {
                    if (error.response?.data) {
                        // const responseData = error.response.data as { name?: string[] };
                        
                        // this.errors.nameError = responseData.name 
                        //     ? "Cet article existe déjà." 
                        //     : null;
                        
                        // this.errors.nameText = data.get('name') as string;
                    }
                }
                
                Swal.fire({
                    icon: 'error',
                    title: 'Erreur',
                    text: 'Une erreur est survenue lors de l\'enregistrement.'
                });
                
                return Promise.reject(error);
            }
        },

        async deleteItem(item: any, url: string) {
            try {
                const result = await Swal.fire({
                    title: "Êtes-vous sûr ?",
                    text: "Vous ne pourrez plus revenir en arrière !",
                    icon: "warning",
                    showCancelButton: true,
                    cancelButtonText: "Annuler",
                    confirmButtonColor: "#3085d6",
                    cancelButtonColor: "#d33",
                    confirmButtonText: "Oui, je le supprime !"
                });

                if (result.isConfirmed) {
                    await new ApiAxios().delete(`/${url}/${item.id}/`, item.id);
                    
                    // Mettre à jour la liste locale
                    this.items = this.items.filter((user: any) => user.id !== item.id);

                    Swal.fire({
                        title: "Supprimé !",
                        text: "Votre objet a bien été supprimé.",
                        icon: "success"
                    });
                }
            } catch (error) {
                console.error('Erreur lors de la suppression :', error);
                
                Swal.fire({
                    title: "Erreur !",
                    text: "Votre objet ne peut pas être supprimé.",
                    icon: "warning"
                });
                
                throw error;
            }
        }
    }
});