import { defineStore } from 'pinia';
// project imports
import ApiAxios from '@/services/ApiAxios';

import axios from '@/utils/axios';



import type { UsersStateProps } from '@/types/rut/ProvidersType';
import { filter, map, sum } from 'lodash';


export const useProviderStore = defineStore({
    id: 'rutProviders',
    state: (): UsersStateProps => ({
        users: [],

        item: '',
      
        cart: [],
        gender: '',
        category: [],
        price: '',
        subTotal: 0,
        discount: 5,
        total: 0,
        addresses: [],
        color: 'All',
        
    }),
    getters: {},
    actions: {
        // Fetch followers from action
        async fetchUsers() {
            try {
                const response = await new ApiAxios().find('/u/get-users/');
                console.log(response);
                this.users = response.data?.results;
                
            } catch (error) {
                alert(error);
                return Promise.reject(error);
            }
        },

        async fetchAddress() {
            try {
                const data = await axios.get('/api/address/list');
                this.addresses = data.data;
            } catch (error) {
                alert(error);
                console.log(error);
            }
        },
        //select gender
        SelectGender(items: any) {
            this.gender = items;
        },
        sortByColor(itemcolor: string) {
            this.color = itemcolor;
        },
        //select category
        SelectCategory(items: any) {
            this.category = items;
        },
        //select Price
        SelectPrice(items: any) {
            this.price = items;
        },
        //AddToCart
        AddToCart(item: any) {
            const product = item;
            this.cart = [...this.cart, product];
        },
        //qty
        incrementQty(item: any) {
            const productId = item;
            const updateCart = map(this.cart, (product: any) => {
                if (product.id === productId) {
                    return {
                        ...product,
                        qty: product.qty + 1
                    };
                }
                return product;
            });
            this.cart = updateCart;
            this.subTotal = sum(this.cart.map((product: any) => product.salePrice * product.qty));
            this.discount = Math.round(this.subTotal * (5 / 100));
            this.total = this.subTotal - this.discount;
        },
        //qty
        decrementQty(item: any) {
            const productId = item;
            const updateCart = map(this.cart, (product: any) => {
                if (product.id === productId) {
                    return {
                        ...product,
                        qty: product.qty - 1
                    };
                }
                return product;
            });
            this.cart = updateCart;
            this.subTotal = sum(this.cart.map((product: any) => product.salePrice * product.qty));
            this.subTotal = sum(this.cart.map((product: any) => product.salePrice * product.qty));
            this.discount = Math.round(this.subTotal * (5 / 100));
            this.total = this.subTotal - this.discount;
        },
        // delete Cart
        deleteCart(item: any) {
            const updateCart = filter(this.cart, (p) => p.id !== item);
            this.cart = updateCart;
        },
        //subtotal
        getsubTotal() {
            this.subTotal = sum(this.cart.map((product: any) => product.salePrice * product.qty));
        },
        //total
        getTotal() {
            this.total = this.subTotal - this.discount;
        },
        //discount
        getDiscount() {
            this.discount = Math.round(this.subTotal * (5 / 100));
        },

        //Reset Filter
        filterReset(){}


     
       
       
       
    }
});
