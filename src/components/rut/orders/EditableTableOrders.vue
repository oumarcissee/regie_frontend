<script setup lang="ts">
import { ref, computed, onMounted,  onUnmounted} from 'vue';
import { truncateText, itemChanged} from '@/services/utils';
import fr from 'date-fns/locale/fr';
import { format } from 'date-fns';

const locale = fr; // or en, or es


import { useField, useForm } from 'vee-validate';

import type {  Items } from '@/types/rut/ProductsType';

import type { Header, Item } from 'vue3-easy-data-table';
import 'vue3-easy-data-table/dist/style.css';

import { useOrderStore } from '@/stores/rutStore/orders/orderStore';
import { useProviderStore } from '@/stores/rutStore/providerStore';
const  userStore = useProviderStore()
const store = useOrderStore();

import CustomComBox from '@/components/forms/form-elements/autocomplete/CustomComBox.vue';


const { addOrUpdateProduct, errors } = useOrderStore();

const { handleSubmit, handleReset , isSubmitting} = useForm({
    validationSchema: {
        name(value: string | any[]) {
        if (value?.length <= 4 || !value) {
                return "Le libéllé doit avoir au moins 4 lettres.";
            } else if(errors.nameError && errors.nameText === value){
                return errors.nameError;
            }
            return true;
        },

        image(value: string | any[]) {
            if (editedIndex.value === -1) {
                if (!value || value[0]?.type.indexOf('image/') === -1) {
                    return "Veillez selectionez une image";
                }
                
            }
            return true;
        },
        
        price(value: string | any[]) {
            if (!(/^[0-9]*[1-9][0-9]*$/.test(value as any))) {
                // La chaîne ne contient que des chiffres et a une longueur de 9 caractères
                return "Entrer le prix de l'article avec des chiffres.";
            }
            return true;
        },
        
        unite(value: string | any[]) {
            if (value) return true
            return "Choisissez l'unité.";  
        },
        rate_per_days(value: string | any[]) {  
            if (!(/^\d+\.\d+$/.test(value as any))) {
                // La chaîne ne contient que des chiffres et a une longueur de 9 caractères
                return "Entrer le taux (en nombre decimal).";
            }
            
            return true;
        },

        divider(value: string | any[]) {
            if (!(/^[0-9]*[1-9][0-9]*$/.test(value as any))) {
                // La chaîne ne contient que des chiffres et a une longueur de 9 caractères
                return "Entrer le diviseur.";
            }
            return true;
        },


        description(value: string | any[]) {
            if (value) return true;
            return true
        },
              
    },
});



onMounted(async () => {
    await userStore.fetchProviders();
    providers.value = userStore.getProviders
    // console.log(providers.value)

    // await refreshTable();
});

const getOrders: any = computed(() => {
    return store.orders
})

let form : Items  = Object()

const formData = new FormData();

const selected = ref<string | null | undefined | number >(null);


const name              = useField("name");
const image             = useField("image");
const price             = useField("price");
const unite             = useField("unite");
const rate_per_days     = useField("rate_per_days");
const divider           = useField("divider");
const description       = useField("description");

const count = ref(0);

const submit = handleSubmit(async (data: any, { setErrors }: any) => {

    try {

        formData.append('name', data.name);
        formData.append('price', data.price);
        formData.append('unite', data.unite);
        formData.append('rate_per_days', data.rate_per_days);
        formData.append('divider', data.divider);
        formData.append('description', data.description);
        
        if (editedIndex.value !== -1) {
            console.log(selected.value, "selected")
        //Si un élément est selectioné
            await addOrUpdateProduct(formData, editedIndex.value);
            await refreshTable()
        } else {
            if(!formData.get('image')) formData.set('image', data.image[0])
            await addOrUpdateProduct(formData);
            await refreshTable()
        }

    } catch (error) {
        console.log(error);
        count.value++;
        if (count.value >= 5) {
            // Arrêter l'exécution du script ou effectuer une action appropriée
            console.log(error);
            return;
        }

        submit()
        return setErrors({ apiError: error });
    }

});

// Fonction pour réinitialiser les champs
const refreshTable = async () => {
    await store.fetchOrders();
    close()
};

const providers = ref([]);



const unites = ref([
    {title: 'Sac(s)',    value: 'bag'},
    {title: 'Bidon(s)', value: 'can' },
    {title: 'Carton(s)', value: 'cardboard'},
])


const valid = ref(true);
const dialog = ref(false);

const editedIndex = ref(-1);


function close() {
    dialog.value = false;
    editedIndex.value = -1
    handleReset();
}


// Méthode pour modifier un élément
const editItem = (index: any) => {
    dialog.value = true;
    editedIndex.value = index.id;

    name.value.value = index.name;
    price.value.value = index.price;
    unite.value.value = index.unite;
    rate_per_days.value.value = index.rate_per_days;
    divider.value.value = index.divider;
    description.value.value = index.description;
   
};

// Suppression d'un element
const remove = async (index: any) => {
    try {
        await store.deleteItem(index, 'items');
        await refreshTable(); // Rafraîchir les données après la suppression
    } catch (error) {
        console.error('Erreur lors de la suppression :', error);
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

const srcs = {
  1: 'https://cdn.vuetifyjs.com/images/lists/1.jpg',
  2: 'https://cdn.vuetifyjs.com/images/lists/2.jpg',
  3: 'https://cdn.vuetifyjs.com/images/lists/3.jpg',
  4: 'https://cdn.vuetifyjs.com/images/lists/4.jpg',
  5: 'https://cdn.vuetifyjs.com/images/lists/5.jpg',
}


const  proudcuts  = [

    { name: 'Britta Holt', group: 'Group 2', avatar: srcs[4] },
    { name: 'Jane Smith ', group: 'Group 2', avatar: srcs[5] },
    { name: 'John Smith', group: 'Group 2', avatar: srcs[1] },
    { name: 'Sandra Williams', group: 'Group 2', avatar: srcs[3] },
]



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
            <v-dialog v-model="dialog" max-width="800">
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
                                        :items="providers" 
                                        :itemSelected="itemsSelected" 
                                        label="Selectionner un fournisseur (Client)" 
                                        title="last_name"
                                    />
                                </v-col>
                                
                                <v-col cols="12" sm="6">
                                     <CustomComBox :items="proudcuts"/>
                                </v-col>
                                <v-col cols="12" sm="6">
                                     <v-row>
                                        
                                        <v-col cols="12" sm="6">
                                            <v-text-field
                                                variant="outlined"
                                                v-model="rate_per_days.value.value"
                                                :error-messages="rate_per_days.errorMessage.value" 
                                                label="La quantité"
                                            ></v-text-field>
                                        </v-col>

                                        <v-col cols="12" sm="6">

                                            <v-btn color="primary" variant="outlined" size="large" block flat>
                                            Ajouter
                                        </v-btn>
                                            
                                        </v-col>
                                    </v-row>
                                </v-col>
                                <v-col cols="12">
                                     <v-switch color="primary" :model-value="true" label="Statut" ></v-switch>  
                                </v-col>
                                
                                <v-col cols="12" sm="12">
                                     <VTextarea
                                        label="Description"
                                        auto-grow
                                        placeholder="Salut, avez-vous quel que chose a dire?"
                                        rows="2"
                                        color="primary"
                                        row-height="25"
                                        shaped
                                        v-model="description.value.value" 
                                        :error-messages="description.errorMessage.value"
                                    ></VTextarea>
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


