import { defineStore } from 'pinia';
import { useAuthStore } from '@/stores/auth';
// project imports
import { isAxiosError, currentMoment, showNotification, filterAndOrderObjects, get_full_unite } from '@/services/utils';
import { get_quantity } from '@/services/utilsMoment';

import ApiAxios from '@/services/ApiAxios';
import Swal from 'sweetalert2'

import { ref } from 'vue';

const { getUniqueMonth } = useAuthStore();

// import { router } from '@/router';


export const useDischargeStore = defineStore({
    id: 'useDischarge',
    state: () => ({
        url: {
            line_discharge: 'line-discharges',
            discharge: 'discharges',
            product: 'products',
            spend: 'spends',
        },
        boredereaux: [] as any,
        bordereauxLines: [] as any,
        areas: [] as any,
        menus: [] as any,
        products: [] as any,
        weight: 0 ,
        unitedSelected: null as any,
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
        },
        getTotalWeight(state) {
            return (state.weight/1000).toFixed(2) + " tonnes";
        }
    },
    actions: {
        async fetchMenus() {
            try {
                const response = await new ApiAxios().find(`/${this.url.spend}/`);
                this.menus = response?.data?.results 
                return this.menus;

            } catch (error) {
                console.log(error);
                return false;
            }
        },

        async fetchProducts(effective: any = null, offset: number = 0, forfait: boolean = false) {
            try {
                const response = await new ApiAxios().find(`/items/`);
                const products = filterAndOrderObjects(response.data.results);

                this.products = products.map((item: any) => {
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

                const response = await new ApiAxios().find(`/${this.url.discharge}/`);
                // this.boredereaux = response?.data?.results;
                
                // Formater les données pour EasyDataTable
                this.boredereaux = (response?.data?.results || []).map((slip: any) => ({
                    ref: slip.ref || 'N/A',
                    items: this.bordereauxLines.filter((line: { discharge: any }) => line.discharge?.id === slip.id),
                    area: slip.area || 'N/A',
                    image: slip.image ,
                    type_of_unit: slip.type_of_unit || 'N/A',
                    category: slip.category || 'N/A',
                    status: slip.status || 0,
                    g_staff: slip.g_staff || 'N/A',
                    description: slip.description || 'Aucune description',
                    created_at: slip.created_at || null,
                    modified_at: slip.modified_at || null,
                   
                    actions: slip,
                    raw: slip // Keep raw data for actions
                }));

                console.log(this.boredereaux);
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
                
                    const resDischarge = await new ApiAxios().add(`/${this.url.discharge}/`, { category: data.slip.category });
                    //Ajoute des lignes des bordereaux
                    data.products.forEach(async (item: any) => {
                        const res = await new ApiAxios().add(`/${this.url.line_discharge}/`, {
                            discharge: resDischarge.data.id,
                            unit: data.lineSlip.unite,
                            offset: item.raw.offset,
                            forfait: item.raw.forfait,
                            item: item.raw.id,
                        });
                        // console.log(res);
                    });

                   //Enregistrement de la date
                    const archiveResponse = await new ApiAxios().add('/archives/', {discharge: resDischarge.data.id});
                    getUniqueMonth(); //                     

                    this.$reset();
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
