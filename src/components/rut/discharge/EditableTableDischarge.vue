<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch } from 'vue';
import { useDischargeStore } from '@/stores/rutStore/discharge/dischargeStore';
import { useUnitStore } from '@/stores/rutStore/unit/unitStore';
import {
    truncateText, notif, formatDate, showNotification, get_staffs, get_unite_type, get_areas, get_category_of_unite, get_full_unite
 } from '@/services/utils';
import { get_quantity , repartirBudgetAvecTauxPrecis} from '@/services/utilsMoment';
import CustomComBox from '@/components/forms/form-elements/autocomplete/CustomComBoxUnites.vue';


const themeColor = ref('rgb(var(--v-theme-secondary))');
const itemsSelected = ref<Item[]>([]);
const searchField = ref(['name', 'type_of_unit']);
const printPreviewDialog = ref(false);
const quantityDialog = ref(false);
const quantityItem = ref('');
const myIndex = ref(null);

const searchValue = ref('');
import { EyeIcon } from 'lucide-vue-next';

// Add these new refs
const viewDialog = ref(false);
const selectedUnited = ref(null);

const isLoading = ref(false);
const error = ref<string | null>(null);


import { useField, useForm } from 'vee-validate';

import type { Item } from 'vue3-easy-data-table';


const { addOrUpdateUnit, errors, } = useDischargeStore();
const store = useDischargeStore();
const unitStore = useUnitStore();


const { handleSubmit, handleReset, isSubmitting } = useForm({
    validationSchema: {
        
        unites(value: string | any[]) {
            if (value) return true;
            return "Séléctionner une unité.";
        },
        items(value: string | any[]) {
            if (!value) return true;
            return "Séléctionner une unité.";
        }
    //     g_staff(value: string | any[]) {
    //         if (value) return true;
    //         return "Choisissez un Etat-Major.";
    //     },

    //     area(value: string | any[]) {
    //         if (value) return true;
    //         return "Choisissez une Region-Militaire.";
    //     },

    //     effective(value: string | any[]) {
    //         if (!/^[0-9]*[1-9][0-9]*$/.test(value as any)) {
    //             // La chaîne ne contient que des chiffres et a une longueur de 9 caractères
    //             return "Entrer l'effectif de l'unité";
    //         }
    //         return true;
    //     },

    //     description(value: string | any[]) {
    //         if (value) return true;
    //         return true;
    //     }
    }
});


const unites        = useField('unites');
const items         = useField('items');
const quantity      = useField('quantity');
// const Data         = useField('Data');




const g_staffs = ref([
    { title: 'EMAT', value: 'emat' },
    { title: 'EMAA', value: 'emaa' },
    { title: 'EMAM', value: 'emam' },
    { title: 'HCGN-DJM', value: 'hcgn' }
]);

const areas = ref([
    { title: 'ZONE SPECIALE', value: 'speciale' },
    { title: '1ere RM', value: 'first' },
    { title: '2eme RM', value: 'second' },
    { title: '3eme RM', value: 'third' },
    { title: '4eme RM', value: 'fourth' }
]);

const type_of_unites = ref([
    { title: 'COURANT', value: 'current' },
    { title: 'MISSION', value: 'mission' },
    // { title: '4eme RM', value: 'single' }
]);

const category_of = ref([
    { title: 'UNITE', value: 'unit' },
    { title: 'SERVICE', value: 'service' },
    // { title: 'ECOLE', value: 'school' }
]);



// Add type filter
const typeFilter = ref('current');
const filteredUnits = computed(() => {

    let units = unitStore.unites
    
    // Filter by type if a type is selected
    if (typeFilter.value) {
        units = units?.filter((unit: any) => unit.type_of_unit === typeFilter.value);
    }
    
    // Filter by search value if present
    if (searchValue.value) {
        const searchTerm = searchValue.value.toLowerCase();
        units = units.filter((unit: any) => 
            unit.name.toLowerCase().includes(searchTerm) ||
            get_unite_type(unit.type_of_unit).toLowerCase().includes(searchTerm)
        );
    }
    
    return units;
});


const selected = ref<string | null | undefined | number>(null);

const loading = ref(false);

// // Add this new method
const viewItem = (item: any) => {
    // console.log('Item clicked:', item); // Pour le debug
    selectedUnited.value = { ...item }; // Faire une copie de l'objet
    viewDialog.value = true;
};


const closeViewDialog = () => {
    viewDialog.value = false;
    selectedUnited.value = null;
};



const count = ref(0);
const pError = ref();

// Modifier la fonction submit
const submit = handleSubmit(async (values, { setErrors }: any ) => {
    
    try {
    const submitFormData = new FormData();
        
        pError.value = null
        errors.nameError = null
        errors.shortNameError = null

        
        submitFormData.append('name', values.name);
        submitFormData.append('short_name', values.short_name);
        submitFormData.append('g_staff', values.g_staff);
        submitFormData.append('area', values.area);
        submitFormData.append('type_of_unit', values.type_of_unit);
        submitFormData.append('effective', values.effective);
        submitFormData.append('category', values.category); // Categorie de l'unité
        submitFormData.append('description', values.description);
      
        isLoading.value = true;
        error.value = null;
        
        if (editedIndex.value !== -1) {
            await addOrUpdateUnit(submitFormData, editedIndex.value);
        } else {
            await addOrUpdateUnit(submitFormData);
        }
        handleReset();

        await refreshTable();
        dialog.value = false;
        showNotification(
            editedIndex.value === -1 ? 'Unite/service ajouté avec succès' : 'Unite/service modifié avec succès',
            'success'
        );
    } catch (err) {
        pError.value = error  
        count.value++;
        if (count.value <= 1)
            submit();

        return setErrors({ apiError: error });

        // showNotification('Erreur lors de l\'opération', 'error');
    } finally {
        isLoading.value = false;
    }
});

// Modifier la fonction refreshTable pour être plus robuste
const refreshTable = async () => {
    try {
        loading.value = true;
        await store.fetchDischarge();
        await store.fetchProducts();
        await store.fetchMenus();
        // Forcer la réactivité en créant une nouvelle référence
        store.boredereaux = [...store.boredereaux];
    } catch (error) {
        console.error('Erreur lors du rafraîchissement :', error);
        showNotification('Erreur lors du rafraîchissement des données', 'error');
    } finally {
        loading.value = false;
    }
};

const uniteSelected = ref();

const valid = ref(true);
const dialog = ref(false);


const editedIndex = ref(-1);

//Methods

// Ajouter une fonction de nettoyage
function close() {
    dialog.value = false;
    editedIndex.value = -1;
    effective.value = null;
    store.products = [];
    handleReset();
}

function openDialog() {
    dialog.value = true;
}

// Méthode pour modifier un élément
const editItem = (item: any) => {
    editedIndex.value = item.id;
    // Remplir le formulaire avec les donnéeses
    unites.value.value = item.unites;
    items.value.value  = item.items;

    dialog.value = true;
};

// PDF related methods
const openPrintPreview = () => {
    printPreviewDialog.value = true;
};

const remove = (item: any) => {
    if (store.products.length > 1) {
        store.products = [...store.products.filter((i: any) => i.ref !== item?.ref)];
    }
   
};


//Computed Property
const formTitle = computed(() => {
    return editedIndex.value === -1 ? 'Nouveau Bordereaux' : 'Editer un Bordereau';
});

//Computed Property
const formButton = computed(() => {
    return editedIndex.value === -1 ? 'Enregistrer' : 'Modifier';
});



const headers = [
    { text: "Unité", value: "short_name" , sortable:true},
    { text: "Région", value: "area", sortable:true },
    { text: "Type", value: "category", sortable: true },
    { text: "Crée le", value: "created_at",sortable:true},
    { text: "Effectif", value: "effective",sortable:true},
    { text: "Actions", value: "actions"}
];


const unitesFiltred = computed(() => {
    return unitStore.unites.filter((unit: any) => unit.type_of_unit === typeFilter.value)
});


// Add new ref for selected unite details
const selectedUniteDetails = ref(null);
const effective = ref(null);
const menusData = ref();

// Update the unitedChanged function to handle selection
const unitedChanged = async (value: any) => {
    if (!value) {
        selectedUniteDetails.value = null;
        return;
    }
    loading.value = true;
    isLoading.value = true;

    
    // Find the selected unite in the unites array
    const selectedUnite = store.unitedSelected =  unitStore.unites.find((unite: { short_name: any; }) => unite.short_name === value);
    if (selectedUnite) {
        selectedUniteDetails.value 
        
        effective.value = selectedUnite.effective; 
        //Gestion des operations dans le store.
        await store.fetchProducts(selectedUnite.effective);

        menusData.value = await repartirBudgetAvecTauxPrecis(store.menus, effective.value);
        
    }

    isLoading.value = false;
    loading.value = false;

};

const productsHeaders = [
    { text: "Article", value: "item" , sortable:true},
    { text: "Taux", value: "rate_per_days", sortable:true },
    { text: "Quantité", value: "item.quantite",sortable:true},
    { text: "Unités", value: "unite",sortable:true},
    { text: "Forfait", value: "forfait", sortable: true },
    { text: "Actions", value: "actions"}
];



const editQuantity = (newQuantity: any) => {
    quantityDialog.value = true;
    myIndex.value = newQuantity;

    if (myIndex.value) {
        myIndex.value = parseInt(quantityItem.value) > 0 ? parseInt(quantityItem.value) : 1;
    }

    myIndex.value = store.products.find((p: { ref: any; }) => p.ref === newQuantity.ref);
  
};

// Update the submitQuantity function
const submitQuantity = () => {

    if (myIndex.value.item.forfait) {
        const productIndex = store.products.findIndex((p: { ref: any; }) => p.ref === myIndex.value.ref);
        if (productIndex !== -1) {
            const newQuantity = parseInt(quantityItem.value) || 0;

            if(newQuantity){
                const updatedProduct = {
                    ...store.products[productIndex],
                    item: {
                        ...store.products[productIndex].item,
                        quantite: newQuantity
                    }
                };

                // Update the product with new quantity
                
                // Update store
                store.products = [
                    ...store.products.slice(0, productIndex),
                    updatedProduct,
                    ...store.products.slice(productIndex + 1)
                ];
            } 
        }
    } else {
        const productIndex = store.products.findIndex((p: { ref: any; }) => p.ref === myIndex.value.ref);
        if (productIndex !== -1) {
            const newQuantity = parseInt(quantityItem.value) || 0;
            
            // Update the product with new quantity
            const updatedProduct = {
                ...store.products[productIndex],
                item: {
                    ...store.products[productIndex].item,
                    quantite: newQuantity + store.products[productIndex].item.quantite
                }
            };
            
            // Update store
            store.products = [
                ...store.products.slice(0, productIndex),
                updatedProduct,
                ...store.products.slice(productIndex + 1)
            ];
        }
    }

    // Reset values
    quantityItem.value = '';
    myIndex.value = null;
    quantityDialog.value = false;
};



// Add new ref for controlling all products
const allProductsEnabled = ref(false);

// Interfaces
interface Product {
  ref: string;
  forfait: boolean;
  quantity?: number;
}

const emit = defineEmits(['update:modelValue']);

// Functions
const handleToggle = async (product: any) => {
    try {
        const currentProduct = store.products.find((p: { ref: any; }) => p.ref === product.ref);
        const newValue = !currentProduct.item.forfait;
        
        const productIndex = store.products.findIndex((p: { ref: any; }) => p.ref === product.ref);
        if (productIndex !== -1) {
            // Calculate base quantity
            const baseQuantity = effective.value 
                ? get_quantity(currentProduct.rate_per_days, effective.value, currentProduct.divider) 
                : 0;

            const updatedProduct = {
                ...store.products[productIndex],
                item: {
                    ...store.products[productIndex].item,
                    forfait: newValue,
                    quantite: newValue ? baseQuantity : baseQuantity
                }
            };

            // Update store
            store.products = [
                ...store.products.slice(0, productIndex),
                updatedProduct,
                ...store.products.slice(productIndex + 1)
            ];
            
            emit('update:modelValue', newValue);
        }
    } catch (error) {
        console.error('Error toggling status:', error);
    }
};
// Computed
const initialAllProductsState = computed(() => {
  return store.products.every((product: { forfait: boolean; }) => product.forfait);
});

const toggleAllProducts = (value: boolean) => {
  allProductsEnabled.value = value;
  store.products = store.products.map((product: any) => ({
    ...product,
    forfait: value
  }));
};

// Lifecycle hooks
onMounted(async () => {
  try {
        isLoading.value = true;
        unitStore.fetchUnites();
        await store.fetchDischarge();
        await store.fetchMenus();
        allProductsEnabled.value = initialAllProductsState.value;
  } catch (err) {
    error.value = 'Error loading data';
  } finally {
    isLoading.value = false;
  }
});




</script>
<template>

    <div class="d-flex align-center gap-4 mb-4">
        <!-- Zone de recherche -->
        <v-text-field 
            density="compact" 
            v-model="searchValue" 
            label="Rechercher par nom" 
            variant="outlined"
            placeholder="Entrez un nom..."
            prepend-inner-icon="mdi-magnify"
            clearable
            class="flex-grow-1"
            hide-details
        ></v-text-field>
        
        <!-- Filtre par type -->
        <v-select
            density="compact"
            v-model="typeFilter"
            :items="type_of_unites"
            label="Filtrer par type"
            variant="outlined"
            clearable
            hide-details
            style="min-width: 200px;"
        ></v-select>

        <!-- Bouton d'ajout -->
       <v-btn 
            v-if="!itemsSelected.length"
            color="primary" 
            prepend-icon="mdi-account-multiple-plus"
            @click="openDialog()"
            class="ml-auto"
        >
            Ajouter un boredereau
        </v-btn>
 

        <v-btn v-else="itemsSelected.length" icon variant="text" @click="openPrintPreview()" flat class="ml-auto">
            <PrinterIcon size="20" />
        </v-btn>
    </div>

    <template >

        Enregistrement des denrées
        <v-row class="align-center">
            <!-- Colonne pour le bouton -->
            <v-col cols="12" md="4" class="d-flex justify-end">
                <v-dialog v-model="dialog" persistent
                                fullscreen :scrim="false" transition="dialog-bottom-transition"                        >
                    <v-card>
                        <v-card-title class="pa-4 bg-secondary d-flex align-center justify-space-between">
                            <span class="title text-white">{{ formTitle }}</span>
                            <v-icon @click="close()" class="ml-auto">mdi-close</v-icon>
                        </v-card-title>

                        <v-card-text>
                            <v-form ref="form" v-model="valid" @submit.prevent="submit">
                              
                                <v-row>
                                    <v-col cols="12" sm="8" >
                                        
                                        <v-col cols="12">
                                              <!-- Filtre par type -->
                                            <v-select
                                                density="compact"
                                                v-model="typeFilter"
                                                :items="type_of_unites"
                                                label="Filtrer par type de bordereau"
                                                variant="outlined"
                                                hide-details
                                                style="min-width: 200px;"
                                               :disabled="!effective ? false : true"
                                            ></v-select>
    
                                            <!-- Bouton d'ajout -->

                                         </v-col>
                                        <v-col cols="12">
                                            <CustomComBox
                                                :items="editedIndex === -1 ? unitesFiltred : unitStore.unites"
                                                label="Selecionner une unité"
                                                title="short_name"
                                                v-model="unites.value.value"
                                                :error-messages="unites.errorMessage.value"
                                                @update:modelValue="unitedChanged"
                                            />
                                        
                                        </v-col>
    
                                        
                                        <v-col cols="12" >
                                            <v-row>
                                                <v-col cols="12" sm="6">
                                                    Effectif: <span class="text-h5 text-white">{{ effective }}</span> Hommes
                                                </v-col>
                                                
                                              
                                                <v-col cols="12" sm="6">
                                                    
                                                    <!-- <v-btn color="primary" variant="outlined" size="large" block flat @click="productsSubmit">
                                                        Ajouter
                                                    </v-btn> -->
                                                </v-col>
                                            </v-row>
                                        </v-col>
                                        
                                        <v-col cols="12" sm="12">
                                            <!-- Replace v-table with EasyDataTable -->
                                            <v-row>
                                                    <v-col cols="12" sm="12">
    
                                                        <EasyDataTable
                                                            :headers="productsHeaders"
                                                            :items="store.products"
                                                            :loading="loading"
                                                            :theme-color="themeColor"
                                                            table-class-name="customize-table"
                                                            :search-field="searchField"
                                                            :search-value="searchValue"
                                                            :rows-per-page="7"
                                                            v-model:items-selected="itemsSelected"
                                                            buttons-pagination
                                                            show-index
                                                        >

                                                         <!-- Add before the existing templates -->
                                                            

                                                            <!-- Update the forfait column template -->
                                                            <template #item-forfait="{ raw }">
                                                                <div class="d-flex align-center justify-center">
                                                                    <v-switch
                                                                        color="primary"
                                                                        :model-value="raw.forfait"
                                                                        @change="() => handleToggle(raw)"
                                                                        hide-details
                                                                        dense
                                                                        :disabled="!effective ? true : false"
                                                                    ></v-switch>
                                                                </div>
                                                            </template>
                                                            <template #item-item="{ item }">
                                                                <div class="d-flex align-center">
                                                                    <div class="hoverable">
                                                                        <v-img :lazy-src="item.image" :src="item.image" width="65px" class="rounded img-fluid"></v-img>
                                                                    </div>
                                                                    <div class="ml-5">
                                                                        <h4 class="text-h6 font-weight-semibold">{{ item.name }}</h4>
                                                                        <span class="text-subtitle-1 d-block mt-1 textSecondary">
                                                                            {{ truncateText(item.description, 20) }}
                                                                        </span>
                                                                    </div>
                                                                </div>
                                                            </template>

                                                            <template #unite="{ unite }">
                                                                <div class="d-flex align-center">
                                                                 
                                                                        <h4 class="text-h6 font-weight-semibold">{{unite }}</h4>
                                                                    
                                                                </div>
                                                            </template>
                                                          
                    
                                                            <template #item-actions="{ raw }">
                                                                <div class="d-flex align-center">
                                                                    <!-- <v-tooltip text="View">
                                                                        <template v-slot:activator="{ props }">
                                                                            <v-btn icon flat @click="viewItem(raw)" v-bind="props">
                                                                                <EyeIcon stroke-width="1.5" :size="20" class="text-success" />
                                                                            </v-btn>
                                                                        </template>
                                                                    </v-tooltip> -->
                                                                    <v-tooltip text="Modifier la quantité">
                                                                        <template v-slot:activator="{ props }">
                                                                            <v-btn icon flat @click="editQuantity(raw)" v-bind="props"
                                                                            :disabled="!effective ? true : false"

                                                                            >
                                                                                <PencilIcon stroke-width="1.5" size="20" class="text-primary" />
                                                                            </v-btn>
                                                                        </template>
                                                                    </v-tooltip>
                                                                    <v-tooltip text="Retirer">
                                                                        <template v-slot:activator="{ props }">
                                                                            <v-btn icon flat @click="remove(raw)" v-bind="props">
                                                                                <TrashIcon stroke-width="1.5" size="20" class="text-error" />
                                                                            </v-btn>
                                                                        </template>
                                                                    </v-tooltip>
                                                                </div>
                                                            </template>
                                                        </EasyDataTable>
                                                        
                                                          
                                                    </v-col>
                                                    <v-col cols="12" sm="12">
                                                    

                                                    </v-col>
                                            </v-row>
    
                                        </v-col>

                                    </v-col>

                                    <v-col cols="12" sm="4">

                                        <v-col cols="12">
                                              <!-- Filtre par type -->
                                            <v-select
                                                density="compact"
                                                v-model="typeFilter"
                                                :items="type_of_unites"
                                                label="Filtrer par type de bordereau"
                                                variant="outlined"
                                                hide-details
                                                style="min-width: 200px;"
                                               :disabled="!effective ? false : true"
                                            ></v-select>
    
                                            <!-- Bouton d'ajout -->

                                         </v-col>
                                        <v-col cols="12">
                                            <CustomComBox
                                                :items="editedIndex === -1 ? unitesFiltred : unitStore.unites"
                                                label="Selecionner une unité"
                                                title="short_name"
                                                v-model="unites.value.value"
                                                :error-messages="unites.errorMessage.value"
                                                @update:modelValue="unitedChanged"
                                            />
                                        
                                        </v-col>
    
                                        
                                        <v-col cols="12" >
                                            <v-row>
                                                Enregistrement des dépenses
                                            </v-row>
                                        </v-col>
                                        <v-card v-if="effective" elevation="0" class="mt-6 border">
                                            <v-table class="month-table">
                                                <thead>
                                                    <tr>
                                                        <th class="text-h6">Désignation</th>
                                                        <!-- <th class="text-h6">Type</th> -->
                                                        <th class="text-h6">Montant</th>
                                                        <th class="text-h6">Pourcentage</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    <tr v-for="item in menusData?.repartition" :key="item.name" class="month-item">
                                                        <td>
                                                            <div class="d-flex align-center">
                                                                <v-avatar size="42" rounded="md">
                                                                    <img :src="item.image" alt="avatar" height="42" />
                                                                </v-avatar>
                                                                <div class="ml-4">
                                                                    <h6 class="text-subtitle-1 font-weight-bold">{{ item.name }}</h6>
                                                                    <div class="text-subtitle-1 text-medium-emphasis mt-1">{{ item.description }}</div>
                                                                </div>
                                                                
                                                            </div>
                                                        </td>
                                                        <!-- <td>
                                                            <div class="d-flex align-center">
                                                                <div class="d-flex">
                                                                    <v-chip
                                                                       
                                                                        rounded="lg"
                                                                        class="mr-2"
                                                            
                                                                        size="small"
                                                                    >
                                                                        {{ item.status }}
                                                                    </v-chip>
                                                                </div>
                                                            </div>
                                                        </td> -->
                                                        <td>
                                                            <div class="text-subtitle-1 text-medium-emphasis">{{ item.montantAlloue }}</div>
                                                        </td>
                                                        <td>
                                                            <div class="d-flex align-center">
                                                                <v-progress-linear color="primary" rounded="sm" :model-value="item.progress"></v-progress-linear>
                                                                <span class="text-subtitle-1 text-medium-emphasis ml-5">{{item.progress}}%</span>
                                                            </div>    
                                                        </td>
                                                       
                                                    </tr>
                                                </tbody>
                                            </v-table>
                                        </v-card>
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
                            >
                                {{ formButton }}
                            </v-btn>
                        </v-card-actions>

                    </v-card>
                </v-dialog>
            </v-col>
        </v-row>
    </template>

  <!-- Replace v-table with EasyDataTable -->
    <EasyDataTable
        :headers="headers"
        :items="filteredUnits"
        :loading="loading"
        :theme-color="themeColor"
        table-class-name="customize-table"
        :search-field="searchField"
        :search-value="searchValue"
        :rows-per-page="8"
        v-model:items-selected="itemsSelected"
        buttons-pagination
        show-index
    >
        <!-- Custom template for Article column -->
        <template #item-name="{ name }">
            <div class="d-flex align-center">
                <div class="ml-5">
                    <h4 class="text-h6 font-weight-semibold">{{ name }}</h4>
                   
                </div>
            </div>
        </template>
        <!-- Custom template for Article column -->
        <template #item-category="{ category }">
            <div class="d-flex align-center">
                <div class="ml-5">
                    <h4 class="text-h6 font-weight-semibold">{{ get_category_of_unite(category)}}</h4>
                </div>
            </div>
        </template>

        <template #item-area="{ area }">
            <div class="d-flex align-center">
                <div class="ml-5">
                    <h4 class="text-h6 font-weight-semibold">{{ get_areas(area)}}</h4>
                   
                </div>
            </div>
        </template>
     
        <template #item-created_at="{ created_at }">
            <div class="d-flex align-center">
                <div class="ml-5">
                    <h4 class=" ">{{ formatDate(created_at) }}</h4>
                </div>
            </div>
        </template>

        <template #item-modified_at="{ modified_at }">
            <div class="d-flex align-center">
                <div class="ml-5">
                    <h4 class=" ">{{ formatDate(modified_at) }}</h4>
                </div>
            </div>
        </template>

          <!-- Custom template for Actions column -->
        <template #item-actions="{ raw }">
            <div class="d-flex align-center">
                <v-tooltip text="Voir">
                    <template v-slot:activator="{ props }">
                        <v-btn icon flat @click="viewItem(raw)" v-bind="props">
                            <EyeIcon stroke-width="1.5" :size="20" class="text-success" />
                        </v-btn>
                    </template>
                </v-tooltip>
                <v-tooltip text="Editer">
                    <template v-slot:activator="{ props }">
                        <v-btn icon flat @click="editItem(raw)" v-bind="props">
                            <PencilIcon stroke-width="1.5" size="20" class="text-primary" />
                        </v-btn>
                    </template>
                </v-tooltip>
                <v-tooltip text="Supprimer">
                    <template v-slot:activator="{ props }">
                        <v-btn icon flat @click="remove(raw)" v-bind="props">
                            <TrashIcon stroke-width="1.5" size="20" class="text-error" />
                        </v-btn>
                    </template>
                </v-tooltip>
            </div>
        </template>
    
    </EasyDataTable>
    

<!-- Add the View Dialog -->
   <!-- Remplacez le dialogue de visualisation existant par celui-ci -->
<template>
  <v-dialog v-model="viewDialog" fullscreen
      :scrim="false"
      transition="dialog-bottom-transition" >
    <v-card>
      <v-card-title class="pa-4 bg-primary d-flex align-center justify-space-between">
        <span class="text-h5 text-white">Détails de l'unité</span>
        <v-icon @click="closeViewDialog" class="ml-auto text-white" size="large">mdi-close</v-icon>
      </v-card-title>

      <v-card-text class="pa-4" v-if="selectedUnited">
        <v-container fluid>
          <v-row>
            <!-- Informations principales -->
            <v-col cols="12" md="6">
              <v-card class="mb-4" elevation="2">
                <v-card-text>
                  <h3 class="text-h5 mb-4">Informations principales</h3>
                  <v-list density="comfortable">
                    <v-list-item>
                      <template v-slot:prepend>
                        <v-icon color="primary" size="large">mdi-identifier</v-icon>
                      </template>
                      <v-list-item-title class="text-body-1 font-weight-medium">Référence</v-list-item-title>
                      <v-list-item-subtitle class="text-subtitle-1">{{ selectedUnited.ref }}</v-list-item-subtitle>
                    </v-list-item>
                    
                    <v-list-item>
                      <template v-slot:prepend>
                        <v-icon color="primary" size="large">mdi-office-building</v-icon>
                      </template>
                      <v-list-item-title class="text-body-1 font-weight-medium">Nom complet</v-list-item-title>
                      <v-list-item-subtitle class="text-subtitle-1">{{ selectedUnited.name }}</v-list-item-subtitle>
                    </v-list-item>

                    <v-list-item>
                      <template v-slot:prepend>
                        <v-icon color="primary" size="large">mdi-format-letter-case</v-icon>
                      </template>
                      <v-list-item-title class="text-body-1 font-weight-medium">Nom abrégé</v-list-item-title>
                      <v-list-item-subtitle class="text-subtitle-1">{{ selectedUnited.short_name }}</v-list-item-subtitle>
                    </v-list-item>
                  </v-list>
                </v-card-text>
              </v-card>
            </v-col>

            <!-- Informations organisationnelles -->
            <v-col cols="12" md="6">
              <v-card class="mb-4" elevation="2">
                <v-card-text>
                  <h3 class="text-h5 mb-4">Détails organisationnels</h3>
                  <v-list density="comfortable">
                    <v-list-item>
                      <template v-slot:prepend>
                        <v-icon color="success" size="large">mdi-army</v-icon>
                      </template>
                      <v-list-item-title class="text-body-1 font-weight-medium">État-Major</v-list-item-title>
                      <v-list-item-subtitle class="text-subtitle-1">{{ get_staffs(selectedUnited.g_staff, true) }}</v-list-item-subtitle>
                    </v-list-item>

                    <v-list-item>
                      <template v-slot:prepend>
                        <v-icon color="success" size="large">mdi-map-marker</v-icon>
                      </template>
                      <v-list-item-title class="text-body-1 font-weight-medium">Région Militaire</v-list-item-title>
                      <v-list-item-subtitle class="text-subtitle-1">{{ get_areas(selectedUnited.area, true) }}</v-list-item-subtitle>
                    </v-list-item>

                    <v-list-item>
                      <template v-slot:prepend>
                        <v-icon color="success" size="large">mdi-account-group</v-icon>
                      </template>
                      <v-list-item-title class="text-body-1 font-weight-medium">Effectif</v-list-item-title>
                      <v-list-item-subtitle class="text-subtitle-1">{{ selectedUnited.effective }}</v-list-item-subtitle>
                    </v-list-item>
                  </v-list>
                </v-card-text>
              </v-card>
            </v-col>

            <!-- Dates et description -->
            <v-col cols="12">
              <v-card elevation="2">
                <v-card-text>
                  <h3 class="text-h5 mb-4">Informations complémentaires</h3>
                  
                  <div class="d-flex mb-4">
                    <div class="flex-grow-1">
                      <v-icon color="info" size="large">mdi-calendar</v-icon>
                      <span class="ml-2 text-subtitle-1">Créé le: {{ formatDate(selectedUnited.created_at) }}</span>
                    </div>
                    <div>
                      <v-icon color="warning" size="large">mdi-calendar-clock</v-icon>
                      <span class="ml-2 text-subtitle-1">Modifié le: {{ formatDate(selectedUnited.modified_at) }}</span>
                    </div>
                  </div>

                  <v-divider class="mb-4"></v-divider>

                  <div>
                    <div class="text-h6 font-weight-bold mb-2">
                      <v-icon color="deep-purple" size="large">mdi-text-box</v-icon>
                      <span class="ml-2">Description</span>
                    </div>
                    <v-card class="pa-4 bg-grey-lighten-4">
                      <p class="text-body-1">{{ selectedUnited.description || 'Aucune description disponible' }}</p>
                    </v-card>
                  </div>
                </v-card-text>
              </v-card>
            </v-col>
          </v-row>
        </v-container>
      </v-card-text>
    </v-card>
  </v-dialog>
</template>

    <v-dialog v-model="quantityDialog" max-width="300" class="dialog-mw">
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
                        <v-btn color="secondary" variant="flat" @click="submitQuantity" block>Modifier</v-btn>
                    </v-card-actions>
                </v-card>
    </v-dialog>

    <!-- Snackbar pour les notifications -->
    <v-snackbar
        v-model="notif.snackbar.value"
        :color="notif.snackbarColor.value"
        :timeout="3000"
        location="top"
    >
        {{ notif.snackbarMessage }}
        
        <template v-slot:actions>
            <v-btn
                color="white"
                variant="text"
                @click="notif.snackbar.value = false"
            >
                Fermer
            </v-btn>
        </template>
    </v-snackbar>

    <!-- Loading Overlay -->
    <v-overlay
        :model-value="isLoading"
        class="align-center justify-center"
    >
        <v-progress-circular
            color="primary"
            indeterminate
            size="64"
        ></v-progress-circular>
    </v-overlay>

    <!-- Error Alert -->
    <!-- <v-alert
        v-if="error"
        type="error"
        closable
        class="mb-4"
        @click:close="error = null"
    >
        {{ error }}
    </v-alert> -->


</template>

<style scoped>
/* ... (previous styles remain the same) */
/* .v-list-item-title {
    color: rgba(0, 0, 0, 0.87);
}

.v-list-item-subtitle {
    color: rgba(0, 0, 0, 0.6);
    font-size: 1rem;
    margin-top: 4px;
} */
</style>