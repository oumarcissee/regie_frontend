<script setup lang="ts">
import { ref, computed, onMounted,  onUnmounted} from 'vue';
import { truncateText, itemChanged, ProductChanged} from '@/services/utils';
import fr from 'date-fns/locale/fr';
import { format } from 'date-fns';

const locale = fr; // or en, or es


import { useField, useForm } from 'vee-validate';

import type {  Orders } from '@/types/rut/OrdersType';

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
    // loadingProvider.value = false;
    await userStore.fetchProviders();
    loadingProvider.value = true;

    // loadingProducts.value = false;
    await useProduct.fetchItems();
    useProduct.items.forEach((item: { unite: string }) => {
        switch (item.unite) {
            case 'cardboard':
                item.unite = 'Carton(s)'
                break;
            case 'can':
                item.unite = 'Bidon(s)'
                break;
            case 'bag':
                item.unite = 'Sac(s)'
                break;
            default:
                item.unite = 'Pas de type'
                break;
        }
    });
    loadingProducts.value = true
    // console.log(providers.value)

    status.value.value = true

});

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

        status(value: string | any[]) {  
            
            return true;
        },
              
    },
});


const productsSubmit = handleSubmit(async (data: any, { setErrors }: any) => { 

    try {
        const product = useProduct.items.find((item: { id?: any }) => item?.id === data.products);
        const user = userStore.providers.find((item: { id?: any }) => item?.id === data.provider);
        //Ajout d'un nouveau produit
        productSelected.value.push({ user: user, product: product, quantity: parseInt(data.quantity) , status: data.status ? data.status : false});

        //  console.log(useProduct.items, "Avant");

        //Suppression l'lément de produit sélectioné
        const filterTable = useProduct.items.filter((item: { id: string; }) => item.id !== data.products);

        //Desactivation du champ user
        if (productSelected.value.length >= 0) isSelected.value = true;
        //Mettre à jour le tableau
        updateTableData()
        useProduct.items = filterTable;
        products.resetField()

    } catch (error) {
        console.log(error);
    }
})

// Ajoutez une fonction pour mettre à jour les données de myTable
const updateTableData = () => {
    const tableData = productSelected.value;
    productSelected.value = tableData;
};


const getOrders: any = computed(() => {
    return store.orders
})



const formData = new FormData();

const selected = ref<string | null | undefined | number >(null);

const refProduct = ref()


const provider  = useField("provider");
const products  = useField("products");
const quantity  = useField("quantity");
const status    = useField("status");
const quantityItem = ref("")


const submit = async () => {

    try {
        if (productSelected.value.length === 0 ) {
            return productsSubmit();
        } else {

            const formDataArray: Orders [] = []

            productSelected.value.forEach((item: any) => {
                formDataArray.push({
                    provider: item.user,
                    item: item.product,
                    quantity: item.quantity,
                    status: item.status
                })
            })
            productSelected.value = []

            console.log(formDataArray)
            await addOrUpdateOrder(formDataArray);
            close()
        }
        
    } catch (error) {
        console.log(error)
    }

  
    // try {

    //     formData.append('name', data.name);
    //     formData.append('price', data.price);
    //     formData.append('unite', data.unite);
    //     formData.append('rate_per_days', data.rate_per_days);
    //     formData.append('divider', data.divider);
    //     formData.append('description', data.description);
        
    //     if (editedIndex.value !== -1) {
    //         console.log(selected.value, "selected")
    //     //Si un élément est selectioné
    //         await addOrUpdateProduct(formData, editedIndex.value);
    //         await refreshTable()
    //     } else {
    //         if(!formData.get('image')) formData.set('image', data.image[0])
    //         await addOrUpdateProduct(formData);
    //         await refreshTable()
    //     }

    // } catch (error) {
    //     console.log(error);
    //     count.value++;
    //     if (count.value >= 5) {
    //         // Arrêter l'exécution du script ou effectuer une action appropriée
    //         console.log(error);
    //         return;
    //     }

    //     submit()
    //     return setErrors({ apiError: error });
    // }

};

// Fonction pour réinitialiser les champs
const refreshTable = async () => {
    await store.fetchOrders();
    close()
};

// const providers = ref([]);
const productSelected: Object | any = ref([]);
const isSelected  = ref(false);
const loadingProvider = ref(true);
const loadingProducts = ref(true);



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
    dialog.value = true;
    editedIndex.value = index.id;
   
};

// Suppression d'un element
const deletion = async (index: any) => {
    try {
        await store.deleteItem(index, 'items');
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
const remove = async (index: any) => {
    const item = productSelected.value.indexOf(index);
    if (item !== -1) {
        productSelected.value.splice(item, 1); // Supprime l'élément du tableau productSelected
    }
};


//Computed Property
const formTitle = computed(() => {
    return editedIndex.value === -1 ? 'Nouvelle Commande' : 'Editer une commande';
});

//Computed Property
const formButton = computed(() => {
    return editedIndex.value === -1 ? 'Enregistrer' : 'Modifier';
});



const searchField = ref(['ref','Destinateur', 'created_at']);
const searchValue = ref('');

const headers: Header[] = [
    { text: 'ID', value: 'id' },
    { text: 'Numéro', value: 'ref', sortable: true },
    { text: 'Destinateur', value: 'provider', sortable: true },
    { text: 'Créé le', value: 'created_at', sortable: true },
    { text: 'Modifié le', value: 'modified_at', sortable: true },
    { text: 'Statut', value: 'status' , sortable: true },
    { text: 'Action', value: 'operation' }
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
                                     <v-switch color="primary" v-model="status.value.value" label="Statut" ></v-switch>  
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
                                                            <v-img :lazy-src="item.product.image" :src="item.product.image" width="65px" class="rounded  img-fluid"></v-img>
                                                        </div>

                                                        <div class="ml-5">
                                                            <h4 class="text-h6 font-weight-semibold">{{ item.product.name }}</h4>
                                                            <span class="text-subtitle-1 d-block mt-1 textSecondary">{{truncateText(item.product.description, 20) }}</span>
                                                        </div>
                                                    </div>
                                                </td>

                                                 <td class="text-subtitle-1">{{ item.quantity }}</td>
                                                 <td class="text-subtitle-1" >{{ item.product.unite }}</td>
                                                
                                                <td>
                                                    <div class="d-flex align-center">
                                                        <v-tooltip text="Edit">
                                                            <template v-slot:activator="{ props }">
                                                                <v-btn icon flat @click="editQuantity(item)" v-bind="props"
                                                                    ><PencilIcon stroke-width="1.5" size="20" class="text-primary"
                                                                /></v-btn>
                                                            </template>
                                                        </v-tooltip>
                                                        <v-tooltip text="Delete">
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

        <template #item-id="{id}">
            <div class="player-wrapper">
                <h5 class="text-h5">{{ id }}</h5>
            </div>
        </template>
        <template #item-ref="{ ref }">
            <div class="player-wrapper">
                {{ ref }}
            </div>
        </template>
        <template #item-provider="{ provider}">
            <div class="player-wrapper">
                <h5 class="text-h5">{{ provider }}</h5>
            </div>
        </template>
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
                <v-tooltip text="Supprimer">
                    <template v-slot:activator="{ props }">
                        <v-btn icon flat @click="remove(item)"  v-bind="props"
                            ><TrashIcon stroke-width="1.5" size="20" class="text-error"
                        /></v-btn>
                    </template>
                </v-tooltip>
            </div>

            </div>
        </template>
    </EasyDataTable>

</template>


