<script setup lang="ts">
import { ref, computed, onMounted,  onUnmounted} from 'vue';
import { truncateText, currentUser, currentProduct, currentMonth, get_full_unite} from '@/services/utils';


import { useField, useForm } from 'vee-validate';


import type { Header, Item } from 'vue3-easy-data-table';
import 'vue3-easy-data-table/dist/style.css';

import { useOrderStore } from '@/stores/rutStore/orders/orderStore';
import { useProviderStore } from '@/stores/rutStore/providerStore';
import { useProductsList } from '@/stores/rutStore/products/productsListStore';

const   useProduct  = useProductsList()
const   userStore = useProviderStore()
const   store = useOrderStore();

import CustomComBox from '@/components/forms/form-elements/autocomplete/CustomComBox.vue';
import CustomComBoxProduct from '@/components/forms/form-elements/autocomplete/CustomComBoxProduct.vue';


const { addOrUpdateOrder, errors } = useOrderStore();


onMounted(async () => {
    await store.fetchOrders();
    //Les lignes de commande
    store.fetchOrdersLine();

    // loadingProvider.value = false;
    await userStore.fetchProviders();
    loadingProvider.value = true;

    // loadingProducts.value = false;
    await useProduct.fetchItems();
   
    loadingProducts.value = true
    // console.log(providers.value)


});

const getStatus = (value: any) => {
    status.value = value
    return value
}

const { handleSubmit, handleReset , isSubmitting} = useForm({
    validationSchema: {
        
        provider(value: string | any[]) {
            if (value) return true
            return "Selectionnez un fournisseur.";  
        },
        products(value: string | any[]) {
            if (!value) {
                return "Selectionnez un article.";  
            }
            return true
        },
        quantity(value: string | any[]) {  
            if (!(/^\d+$/.test(value as any))) {
                // La chaîne ne contient que des chiffres et a une longueur de 9 caractères
                return "Entrer la quantité en chiffre entier.";
            }
            return true;
        },
              
    },
});

let increment = 0;
const productsSubmit = handleSubmit(async (data: any, { setErrors }: any) => { 
        increment++
    
    try {
        const product = useProduct.items.find((item: { id?: any }) => item?.id === data.products);
        // const user = userStore.providers.find((item: { id?: any }) => item?.id === data.provider);

        //Ajout d'un nouveau produit
        productSelected.value.push({ id: increment, item: product, quantity: parseInt(data.quantity) });

        //Desactivation du champ user
        if (productSelected.value.length >= 0) isSelected.value = true;
        //Mettre à jour le tableau
        updateTableData();
        // console.log(productSelected.value)
        useProduct.items = useProduct.items.filter((item: { id: string; }) => item.id !== data.products);
        products.resetField();

    } catch (error) {
        console.log(error);
    }
})

//La fonction pour mettre à jour les données de myTable
const updateTableData = () => {
    productSelected.value = productSelected.value;
};


//Affichage des commandes en fonction de mois 
const getOrders: any = computed(() => {
    return store.orders.filter((item: any)  => item.created_at.includes(currentMonth.value) || item.modified_at.includes(currentMonth.value));
})

const formData = new FormData();

const selected = ref<string | null | undefined | number >(null);

const refProduct = ref()


const provider  = useField("provider");
const products  = useField("products");
const quantity = useField("quantity");

const status = ref(false);

const quantityItem = ref("");


const submit = async () => {

    try {
        if (productSelected.value.length === 0) {
            //Si rin n'est selectioné
            return productsSubmit();
        } else {

            const order = {
                provider: provider.value.value,
                status: status.value,
            };

            const data = {
                order: order,
                orderLine: productSelected.value
            }

            if (editedIndex.value != -1) {

                //Recuperation des articles liées à la commande
                const ordersLine = store.ordersLine.filter((item: { order?: any }) => item?.order?.id === editedIndex.value);
                // console.log(ordersLine)
                //filtrer les articles non selectonés
                const itemIds = ordersLine.map((item: any) => item.item.id);
                useProduct.items.filter((item: any) => !itemIds.includes(item.id));

                //Modification de la commmande courante
                // close();

                // console.log(data,data.orderLine[0].order.id)
                // return;
                await addOrUpdateOrder(data, data.orderLine[0].order.id);
                

            } else {
                //Ajout d'une nouvelle de la commande
                await addOrUpdateOrder(data);
            }
            await refreshTable();
        }
        
    } catch (error) {
        console.log(error)
    }

};

// Fonction pour réinitialiser les champs
const refreshTable = async () => {
    await store.fetchOrders();
    //Les lignes des commandes
    store.fetchOrdersLine();
    close()
};

// les champs de l'utilisateur
let userSeletected: Object;

// const providers = ref([]);
let productSelected: Object | any = ref([]);
const isSelected  = ref(false);
const loadingProvider = ref(false);
const loadingProducts = ref(false);



const valid = ref(true);
const dialog = ref(false);
const QuantityDialog = ref(false)

const editedIndex = ref(-1);


function close() {
    dialog.value = false;
    editedIndex.value = -1
    productSelected.value = [];
    isSelected.value = false
    handleReset();
}

// Méthode pour modifier un élément
const editItem = (index: any) => {
    dialog.value      = true;
    editedIndex.value = index.id;
    isSelected.value  = true;

    //Selection de fournisseur.
    provider.value.value = index.provider.id;
    status.value = index.status;

    //Recuperation des articles liées à la commande
    const ordersLine = store.ordersLine.filter((item: { order?: any }) => item?.order?.id === index.id);
    productSelected.value = ordersLine;

    //filtrer les articles non selectonés
    const itemIds = ordersLine.map((item: any) => item.item.id);
    useProduct.items = useProduct.items.filter((item: any) => !itemIds.includes(item.id));

    updateTableData();
};

// Suppression d'un element
const deletion = async (index: any) => {
    try {
        await store.deleteItem(index, 'orders');
        await refreshTable(); // Rafraîchir les données après la suppression
    } catch (error) {
        console.error('Erreur lors de la suppression :', error);
    }
};

// Méthode pour modifier un élément
const myIndex = ref()
const editQuantity = (index: any) => {
    QuantityDialog.value = true;

    myIndex.value = index;
    
    quantityItem.value = index.quantity;
};

//le changement de quantité
const submitQuantity  = () => {
    myIndex.value.quantity = parseInt(quantityItem.value) > 0 ? quantityItem.value : 1;
    updateTableData()

    quantityItem.value = "";
    QuantityDialog.value = false;
}

// Suppression d'un element
const remove = async (item: any) => {
    // console.log(item)
    //Suppression de l'élement supprimé
    productSelected.value = productSelected.value.filter((i: any) => i.id !== item?.id);

    console.log(productSelected.value);//

    //Mettre à jour le tableau
    useProduct.items.push(item.item); // Add the removed item back to the product list
    updateTableData();
};

//Computed Property
const formTitle = computed(() => {
    return editedIndex.value === -1 ? 'Nouvelle Commande' : 'Editer une commande';
});

//Computed Property
const formButton = computed(() => {
    return editedIndex.value === -1 ? 'Enregistrer' : 'Modifier';
});


const searchField = ref(['ref','last_name', 'created_at']);
const searchValue = ref('');

const headers: Header[] = [
    { text: 'Référence', value: 'ref' },
    { text: '', value: 'image', sortable: true },
    { text: 'Destinateur', value: 'last_name', sortable: true },
    { text: 'Contact', value: 'contact', sortable: true },
    { text: 'Fait le', value: 'created_at', sortable: true },
    { text: 'Modifié le', value: 'modified_at', sortable: true },
    { text: 'Statut', value: 'status' , sortable: true },
    { text: 'Actions', value: 'operation' }
];



const themeColor = ref('rgb(var(--v-theme-secondary))');

const itemsSelected = ref<Item[]>([]);

</script>
<template>
    <v-row class="mb-4">
        <v-col cols="12" lg="4" md="6">
             <v-text-field
                type="text"
                variant="outlined"
                placeholder="Rechercher une commande"
                v-model="searchValue"
                density="compact"
                hide-details
                prepend-inner-icon="mdi-magnify"
            />
        </v-col>
        <v-col cols="12" lg="8" md="6" class="text-right ">      
            <v-dialog v-model="dialog" max-width="800" persistent class="dialog-mw">
                <template v-slot:activator="{ props }">
                    <v-btn color="primary" v-bind="props" flat class="ml-auto">
                        <v-icon class="mr-2">mdi-account-multiple-plus</v-icon>Ajouter une commande
                    </v-btn>
                </template>
                 <!-- Formulaire de commande -->
                <v-card>
                    <v-card-title class="pa-4 bg-secondary d-flex align-center justify-space-between">
                        <span class="title text-white">{{ formTitle }}</span>
                        <v-icon @click="close()" class="ml-auto">mdi-close</v-icon>
                    </v-card-title>
                    
                    <v-card-text>
                        <v-form ref="form" v-model="valid" lazy-validation>
                            <v-row>
                                <v-col cols="12" >
                                    <CustomComBox 
                                        :items="userStore.getProviders" 
                                        label="Selectionner un fournisseur (Client)" 
                                        title="last_name"
                                        v-model="provider.value.value" 
                                        :error-messages="provider.errorMessage.value"
                                        :isDisabled="isSelected"
                                    />
                                </v-col>
                                
                                <v-col cols="12" sm="6">
                                     <CustomComBoxProduct
                                        ref="refProduct"
                                        :items="useProduct.getProducts"
                                        label="Selectionner un article" 
                                        title="name"
                                        v-model="products.value.value" 
                                        :error-messages="products.errorMessage.value"
                                      />
                                </v-col>
                                <v-col cols="12" sm="6">
                                     <v-row>
                                        
                                        <v-col cols="12" sm="6">
                                            <v-text-field
                                                variant="outlined"
                                                v-model="quantity.value.value"
                                                :error-messages="quantity.errorMessage.value" 
                                                label="La quantité"
                                            ></v-text-field>
                                        </v-col>

                                        <v-col cols="12" sm="6">

                                            <!-- Méthode pour modifier un élément -->
                                            <v-btn 
                                                color="primary" 
                                                variant="outlined"
                                                size="large" block flat
                                                @click="productsSubmit"
                                            >
                                            Ajouter
                                        </v-btn>
                                        </v-col>
                                    </v-row>
                                </v-col>
                                <v-col cols="12">
                                    <v-switch color="primary" @update:modelValue="getStatus" v-model="status"  label="Statut" ></v-switch>  
                                </v-col>
                                
                                <v-col cols="12" sm="12">

                                    <v-table class="mt-5" id="myTable">
                                        <thead>
                                            <tr>
                                                <th class="text-subtitle-1 font-weight-semibold">N°</th>
                                                <!-- <th class="text-subtitle-1 font-weight-semibold">Réference</th> -->
                                                <th class="text-subtitle-1 font-weight-semibold">Article</th>
                                                <th class="text-subtitle-1 font-weight-semibold">Quantité</th>
                                                <th class="text-subtitle-1 font-weight-semibold">Unité</th>
                                               
                                                <th class="text-subtitle-1 font-weight-semibold">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            <tr v-if="!productSelected">
                                                <td colspan="4" class="text-subtitle-1 text-center">Aucun article</td>
                                            </tr>
                                            <tr v-else v-for="(item, index) in productSelected" :key="index">
                                                <td class="text-subtitle-1">{{ index+1}}</td>
                                                <!-- <td class="text-subtitle-1">{{ item.product.ref }}</td> -->
                                                    
                                                <td class="text-subtitle-1">

                                                    <div class="d-flex align-center py-4">
                                                         <div class="hoverable">        
                                                            <v-img :lazy-src="item?.item?.image" :src="item?.item?.image" :title="item.item.name" width="65px" class="rounded  img-fluid"></v-img>
                                                        </div>

                                                        <div class="ml-5">
                                                            <h4 class="text-h6 font-weight-semibold">{{ item.item.name }}</h4>
                                                            <span class="text-subtitle-1 d-block mt-1 textSecondary">{{truncateText(item.item.description, 20) }}</span>
                                                        </div>
                                                    </div>
                                                </td>

                                                 <td class="text-subtitle-1">{{ item.quantity }}</td>
                                                 <td class="text-subtitle-1" >{{ get_full_unite(item.item.unite)}}</td>
                                                
                                                <td>
                                                    <div class="d-flex align-center">
                                                        <v-tooltip text="Editer">
                                                            <template v-slot:activator="{ props }">
                                                                <v-btn icon flat @click="editQuantity(item)" v-bind="props"
                                                                    ><PencilIcon stroke-width="1.5" size="20" class="text-primary"
                                                                /></v-btn>
                                                            </template>
                                                        </v-tooltip>
                                                        <v-tooltip text="Retirer">
                                                            <template v-slot:activator="{ props }">
                                                                <v-btn icon flat @click="remove(item)" v-bind="props"
                                                                    ><TrashIcon stroke-width="1.5" size="20" class="text-error"
                                                                /></v-btn>
                                                            </template>
                                                        </v-tooltip>
                                                    </div>
                                                </td>
                                            </tr>
                                           
                                        </tbody>
                                    </v-table>  

                                </v-col>
                            </v-row>
                        </v-form>
                    </v-card-text>

                    <v-card-actions class="pa-4">
                        
                        <v-btn
                            color="secondary"
                            variant="flat"
                            @click="submit"
                            block
                            :loading="isSubmitting"
                            >{{formButton}}</v-btn
                        >
                    </v-card-actions>
                </v-card>
                <!-- END Formulaire de commande -->
            </v-dialog>

            <v-dialog v-model="QuantityDialog" max-width="300" persistent class="dialog-mw">     
                <v-card>
                    <v-card-title class="pa-4 bg-secondary d-flex align-center justify-space-between">
                        <span class="title text-white">Nouvelle Quantité</span>
                    </v-card-title>
                    
                    <v-card-text>
                        <v-form ref="form" v-model="valid" lazy-validation>
                            <v-row>
                                <v-col cols="12">
                                    <v-text-field
                                        variant="outlined"
                                        v-model="quantityItem"
                                        label="La quantité"
                                        type="number"
                                        block
                                    ></v-text-field>
                                </v-col>
                            </v-row>
                        </v-form>
                    </v-card-text>

                    <v-card-actions class="pa-4">                 
                        <v-btn
                            color="secondary"
                            variant="flat"
                            @click="submitQuantity"
                            block
                            >Modifier</v-btn
                        >
                    </v-card-actions>
                </v-card>
            </v-dialog>
        </v-col>
    </v-row>

    <EasyDataTable
        :headers="headers"
        :items="getOrders"
        table-class-name="customize-table"
        :theme-color="themeColor"
        :search-field="searchField"
        :search-value="searchValue"
        :rows-per-page="8"
        v-model:items-selected="itemsSelected"
        >

      
        <template #item-ref="{ ref }">
            <div class="player-wrapper">
                {{ ref }}
            </div>
        </template>

        <template #item-image="{ image }">
            <div class="player-wrapper">
                <img alt="user" width="70" class="rounded-circle img-fluid" :src="image" />
            </div>
        </template>

        <template #item-last_name="{first_name, last_name}">
            <div class="player-wrapper">
                <h5 class="text-h5">{{ last_name }}</h5>
                <span class="text-subtitle-1 d-block mt-1 textSecondary">{{ first_name }}</span>
            </div>
        </template>

        <template #item-contact="{contact, email}">
            <div class="player-wrapper">
                <h5 class="text-h5">{{ contact }}</h5>
                <span class="text-subtitle-1 d-block mt-1 textSecondary">{{ email }}</span>
            </div>
        </template>



        <!-- <template #item-user="{ user}">
            <div class="player-wrapper">
                <h5 class="text-h5">{{ user }}</h5>
            </div>
        </template> -->
        <template #item-created_at="{ created_at }">
            <div class="player-wrapper">
                <h5 class="text-h5">{{created_at}}</h5>
                
            </div>
        </template>

        <template #item-modified_at="{ modified_at }">
            <div class="player-wrapper">
                <h5 class="text-h5">{{modified_at}}</h5>  
            </div>
        </template>
        <template #item-status="{ status }">
            <div class="player-wrapper">
                <v-chip color="success" v-if="status" size="small"> Activé </v-chip>
                <v-chip color="error" v-else size="small"> Desactivé</v-chip>
            </div>
        </template>

        <template #item-operation="item">
            <div class="operation-wrapper"><div class="d-flex align-center">
                <v-tooltip text="Editer">
                    <template v-slot:activator="{ props }">
                        <v-btn icon flat @click="editItem(item)" v-bind="props"
                            ><PencilIcon stroke-width="1.5" size="20" class="text-primary"
                        /></v-btn>
                    </template>
                </v-tooltip>

                 <v-tooltip text="Voir">
                    <template v-slot:activator="{ props }">
                        <v-btn icon flat @click="" v-bind="props"
                            ><ListIcon stroke-width="1.5" size="20" class="text-primary"
                        /></v-btn>
                    </template>
                </v-tooltip>
                <v-tooltip text="Supprimer">
                    <template v-slot:activator="{ props }">
                        <v-btn icon flat @click="deletion(item)"  v-bind="props"
                            ><TrashIcon stroke-width="1.5" size="20" class="text-error"
                        /></v-btn>
                    </template>
                </v-tooltip>
               
            </div>

            </div>
        </template>
    </EasyDataTable>

</template>


