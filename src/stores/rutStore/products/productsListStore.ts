import { defineStore } from 'pinia';
// project imports
import { isAxiosError } from '@/services/utils';
import { router } from '@/router';

import ApiAxios from '@/services/ApiAxios';
import Swal from 'sweetalert2'



export const useProductsList = defineStore({
    id: 'productsListStore',
    state: () => ({
        products: [],
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
        async fetchProducts() {
            try {
                const response = await new ApiAxios().find(`/items/`);
                console.log(response, "Dans try");
                this.products = response.data
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
                    router.push({ name: 'Providers' })
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
                    console.log(response.data);
                    router.push({ name: 'Providers' })
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
                // this.store = response.data;
                // localStorage.setItem('user', JSON.stringify(response.data));
                
            } catch (error) {
                if (isAxiosError(error)) {
                    console.log(error, "Dans le catch")
                    if (error.response && error.response.data) {
                        console.log(error.response.data);
            
                        const responseData = error.response.data as { name: string[]};

                        this.errors.nameError = responseData.name ? responseData.name[0] : null;
                        this.errors.nameText  = data.name
                      
                    }
                }
                return Promise.reject("Autres erreur");
            }
        }
        
    }
});
