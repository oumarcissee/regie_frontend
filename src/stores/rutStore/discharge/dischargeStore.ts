import { defineStore } from 'pinia';
import { useAuthStore } from '@/stores/auth';
// project imports
import { isAxiosError, currentMoment, showNotification, filterAndOrderObjects, get_full_unite } from '@/services/utils';
import { get_quantity } from '@/services/utilsMoment';

import ApiAxios from '@/services/ApiAxios';
import Swal from 'sweetalert2'

import { ref } from 'vue';

const authStore = useAuthStore();
// import { router } from '@/router';


export const useDischargeStore = defineStore({
    id: 'useDischarge',
    state: () => ({
        url: {
            line_discharge: 'line-discharges',
            discharge: 'discharges',
            product: 'products',
            spend: 'other-spends',
            unit: 'unites'
        },
        boredereaux: [] as any,
        bordereauxLines: [] as any,
        areas: [] as any,
        menus: [] as any,
        products: [] as any,
        weight: 0 ,
        unitedSelected: null as any,
        dialog: false,
        finalQuantity: 0,

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
        },
        getTotalWeight(state) {
            return (state.weight/1000).toFixed(2) + " tonnes";
        }
    },
    actions: {
        async fetchMenus() {
            try {
                const response = await new ApiAxios().find(`/spends/`);
                this.menus = response?.data?.results 
                return this.menus;

            } catch (error) {
                console.log(error);
                return false;
            }
        },


        async fetchProducts(effective: any = null, data?: [], offset: number = 0, forfait: boolean = false) {
            try {
                this.products = [];

                if (data) {
                    // console.log(data);
                    // return;
                    // await filterAndOrderObjects(data);

                    this.products = data.map((item: any, index: number) => {
                        // console.log(item, index);
                        // return;
                        const baseQuantity = effective ? get_quantity(item.item.rate_per_days, effective, item.item.divider) : 0;

                        this.finalQuantity = item.offset && item.forfait ? baseQuantity + item.offset : baseQuantity;

                        if (item.offset && item.forfait) {
                            this.finalQuantity   = item.offset;
                           
                        } else if (item.offset && !item.forfait) {
                            
                            this.finalQuantity = baseQuantity + item.offset;
                        }


                        return {
                            ref: item.item.ref,
                            rate_per_days: item.item.rate_per_days,
                            status: false,
                            price: item.item.price,
                            unite: get_full_unite(item.item.unite),
                            divider: item.item.divider,
                            item: {
                                name: item.item.name,
                                image: item.item.image,
                                description: item.item.description,
                                created_at: new Date(item.item.created_at),
                                modified_at: new Date(item.item.modified_at),
                                forfait: item.forfait,
                                quantite: this.finalQuantity ,
                                offset: item.offset,
                            },
                            actions: item.item,
                            raw: item.item
                        };
                    });

                } else {
                    
                    const response = await new ApiAxios().find(`/items/`);
                    // const products = await filterAndOrderObjects(response.data.results);
    
                    this.products = response.data.results.map((item: any) => {
                        const baseQuantity = effective ? get_quantity(item.rate_per_days, effective, item.divider) : 0;
                        const finalQuantity = offset && forfait ? baseQuantity + offset : baseQuantity;
    
                        return {
                            ref: item.ref,
                            rate_per_days: item.rate_per_days,
                            status: false,
                            price: item.price,
                            unite: get_full_unite(item.unite),
                            divider: item.divider,
                            item: {
                                name: item.name,
                                image: item.image,
                                description: item.description,
                                created_at: new Date(item.created_at),
                                modified_at: new Date(item.modified_at),
                                forfait: false,
                                quantite: finalQuantity,
                                offset: offset,
                            },
                            actions: item,
                            raw: item
                        };
                    });
                }
            } catch (error) {
                console.error("Error fetching products:", error);
            }

        },
        //Modification de la quantité d'un produit
        updateProductQuantity(ref: string, newQuantity: number) {
            const productIndex = this.products.findIndex((p: { ref: string }) => p.ref === ref);
            if (productIndex !== -1) {
                this.products[productIndex].item.quantite = this.products[productIndex].item.forfait && newQuantity ? newQuantity : this.products[productIndex].item.quantite + newQuantity;
                this.products[productIndex].item.offset = newQuantity;
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
        /**
         * 
         * @returns Les lignes de de bordereau
        */
        async fetchAllDischLines() {
            try {
                const response = await new ApiAxios().find(`/${this.url.line_discharge}/`);
                // Formater les données pour EasyDataTable
                this.bordereauxLines = response?.data?.results;
                return true;

            } catch (error) {
                console.log(error);
                return false;
            }
        },
    
        async fetchDischarge() {
            try {
                await this.fetchAllDischLines();
                
                const response = await new ApiAxios().find(`/${this.url.discharge}/`);

                // Recuperation des dépenses
                const spends = await new ApiAxios().find(`/${this.url.spend}/`);
                // console.log(spends.data?.results.);
                // this.boredereaux = response?.data?.results;
                
                // Formater les données pour EasyDataTable
                this.boredereaux = (response?.data?.results || []).map((slip: any) => {
                    // Assigner des valeurs par défaut si nécessaire
                    slip.ref = slip.ref || 'N/A';
                    slip.category = slip.category || 'N/A';
                    slip.unit = slip.unit || 'N/A';
                    slip.area = slip.unit?.area || 'N/A'; // Utilisez l'opérateur optionnel pour éviter les erreurs si `unit` est null/undefined

                    // Trouver l'effectif correspondant dans les archives
                    slip.effective = authStore.archives.data.results.find(
                        (archive: { discharge: any }) => archive?.discharge?.id === slip?.id
                    )?.effective || 0;

                    // Filtrer les lignes de bordereau et les dépenses
                    slip.items = this.bordereauxLines.filter(
                        (line: { discharge: any }) => line.discharge?.id === slip.id
                    );
                    slip.spends = spends.data?.results.filter(
                        (spend: { discharge: any }) => spend.discharge?.id === slip.id
                    ) || [];

                    slip.menus = this.menus.filter((item: { type_menu: string }) => item.type_menu === 'food');;

                    // Assigner des valeurs par défaut pour les dates et le statut
                    slip.status = slip.status || 0;
                    slip.created_at = slip.created_at || null;
                    slip.modified_at = slip.modified_at || null;

                    // Ajouter des propriétés supplémentaires pour les actions
                    slip.actions = slip;
                    slip.raw = slip; // Conserver les données brutes pour les actions

                    // Retourner l'objet modifié
                    return slip;
                });

                return true;

            } catch (error) {
                console.log(error);
                return false;
            }
        },

        //Ajout d'un élement
        async addOrUpdateDischarge(data: any,spends?:any, param?: any) {
            try {
                if (param) {
                    const response = await new ApiAxios().updatePartialForm(`/${this.url}/${param}/`, data, param);
                } else {

                   
                    //Ajout d'un bordereau
                    const resDischarge = await new ApiAxios().add(`/${this.url.discharge}/`,{
                        unit: data.unit,
                        category: data.slip.category
                    });
                    //Changement de l'état de l'unité
                    new ApiAxios().updatePartialForm(`/${this.url.unit}/${data.unit}/`,{ is_created:  true});
                    //Ajoute des lignes des bordereaux
                    data.products.forEach(async (item: any) => {
                        const res = await new ApiAxios().add(`/${this.url.line_discharge}/`, {
                            discharge: resDischarge.data.id,
                            offset: item?.item?.offset,
                            forfait: item?.item?.forfait,
                            item: item.raw.id,
                        });
                        // console.log(res);
                    });
                    //Ajout des dépenses
                    data.otherDepenses.forEach(async (item: any) => {
                        const res = await new ApiAxios().add(`/${this.url.spend}/`, {
                            discharge: resDischarge.data.id,
                            name: item.name,
                            amount: item.amount,
                        });
                    });

                   // Après l'ajout d'archive
                    const archiveResponse = await new ApiAxios().add('/archives/', { discharge: resDischarge.data.id, effective: data.slip.effective });

                    // Rechargez complètement les archives du authStore
                    const authStore = useAuthStore();
                    await authStore.getUniqueMonth();

                    // Puis continuez
                    this.$reset();
                    await this.fetchDischarge();
                }
                return true;
            } catch (error: any) {
                // Vérification du type d'erreur
                console.log(error)
             
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
                         //Changement de l'état de l'unité
                        new ApiAxios().updatePartialForm(`/${this.url.unit}/${item.unit.id}/`,{ is_created:  false});
                        Swal.fire({
                            title: "Supprimé!",
                            text: "Votre bordéreau a bien été supprimé.",
                            icon: "success"
                        });
                        //
                        this.boredereaux = this.boredereaux?.filter((user: any) => user.id !== item.id);
                        return true;
                    } catch (error) {
                        console.log(error);
                        Swal.fire({
                            title: "Erreur!",
                            text: "Votre bordéreau ne peut pas être supprimé.",
                            icon: "warning"
                        });
                        return false;
                    }

                }

            });
        }
    }
});
