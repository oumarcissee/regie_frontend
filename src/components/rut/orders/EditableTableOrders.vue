<script setup lang="ts">
import { ref, computed, onMounted,  onUnmounted} from 'vue';
import { useOrderStore } from '@/stores/rutStore/orders/orderStore';
import {truncateText} from '@/services/utils';
import fr from 'date-fns/locale/fr';
import { format } from 'date-fns';

const locale = fr; // or en, or es

import  type { VueCropperMethods }  from 'vue-cropperjs';
import VueCropper from 'vue-cropperjs';

import { useField, useForm } from 'vee-validate';

import type {  Items } from '@/types/rut/ProductsType';

import contact from '@/_mockApis/apps/contact';

import type { Header, Item } from 'vue3-easy-data-table';
import 'vue3-easy-data-table/dist/style.css';

import { useProviderStore } from '@/stores/rutStore/providerStore';
const store = useProviderStore();


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
    await refreshTable()
});

const getItems: any = computed(() => {
    return store.items
})

let form : Items  = Object()

const formData = new FormData();

const imageSrc = ref('');

const selected = ref<string | null | undefined | number >(null);
let cropper = ref<VueCropperMethods | null>(null);

function setImage(e: Event) {
  dialogImg.value = true
  const target = e.target as HTMLInputElement;
  const file = (target.files as FileList)[0];

  if (!file || file.type.indexOf('image/') === -1) {
        dialogImg.value = false
        return;
  }

  const reader = new FileReader();
  reader.onload = (event) => {
    if (event.target && event.target.result) {
      imageSrc.value = event.target.result.toString();
      if (cropper.value) {
          cropper.value.replace(imageSrc.value);

      }
    }
  };

  reader.readAsDataURL(file);
}


function handleImage() {
  if (cropper.value) {
      const canvas = cropper.value.getCroppedCanvas({
        width: 400,
        height: 400,
      }).toBlob((blob: any) => {
        const timestamp = new Date().getTime(); // Obtient un timestamp unique
        const fileName = `cropped_image_${timestamp}.jpg`; // Nom du fichier avec timestamp
        formData.append('image', blob, fileName); // Ajoute le blob avec le nom de fichier unique
       
    }, 'image/jpg');

    
    dialogImg.value = false; 
  }
}



const dialogImg = ref(false) as any;



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
    await store.fetchUsers();
    close()
};

const uniteSelected = ref();

const changed = (value: string | any[]) => {
    uniteSelected.value = value
    return value
}


const unites = ref([
    {title: 'Sac(s)',    value: 'bag'},
    {title: 'Bidon(s)', value: 'can' },
    {title: 'Carton(s)', value: 'cardboard'},
])


const valid = ref(true);
const dialog = ref(false);

const search = ref('');
const rolesbg = ref(['primary', 'secondary', 'error', 'success', 'warning']);
const desserts = ref(contact);
const editedIndex = ref(-1);


//Methods
const filteredList = computed(() => {
    return getItems.filter((item: any) => {
        return item.name.toLowerCase().includes(search.value.toLowerCase());
    });
});



function close() {
    dialog.value = false;
    editedIndex.value = -1
    handleReset();
}

function closeImg() {
    dialogImg.value = false;
   
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
    return editedIndex.value === -1 ? 'Nouvel Article' : 'Editer un Article';
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
    <v-row>
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
                        <v-icon class="mr-2">mdi-account-multiple-plus</v-icon>Ajouter un article
                    </v-btn>
                </template>
                <v-card>
                    <v-card-title class="pa-4 bg-secondary d-flex align-center justify-space-between">
                        <span class="title text-white">{{ formTitle }}</span>
                        <v-icon @click="close()" class="ml-auto">mdi-close</v-icon>
                    </v-card-title>
                    

                    <v-card-text>
                        <v-form ref="form" v-model="valid" lazy-validation>
                            <v-row>
                                <v-col cols="12" sm="6">
                                    <v-text-field 
                                        variant="outlined" 
                                        v-model="name.value.value"
                                        :error-messages="name.errorMessage.value"  
                                        label="Libéllé"
                                    >
                                    </v-text-field>
                                </v-col>
                                <v-col cols="12" sm="6">
                                    <v-file-input
                                        chips
                                        label="Importer une image"
                                        variant="outlined"
                                        accept=".jpeg,.jpg,.png"
                                        v-model="image.value.value"
                                        :error-messages="image.errorMessage.value" 
                                        @change="setImage"
                                    ></v-file-input>
                                       <!-- Cropper -->
                                   
                                </v-col>
                                <v-col cols="12" sm="6">
                                    <v-text-field
                                        variant="outlined"
                                        v-model="price.value.value"
                                        :error-messages="price.errorMessage.value" 
                                        label="Prix unitaire" 
                                    ></v-text-field>
                                </v-col>
                                <v-col cols="12" sm="6">
                                    <v-text-field
                                        variant="outlined"
                                        v-model="rate_per_days.value.value"
                                        :error-messages="rate_per_days.errorMessage.value" 
                                        label="Le taux par jour"
                                    ></v-text-field>
                                </v-col>
                                <v-col cols="12" sm="6">
                                    <v-text-field
                                        variant="outlined"
                                        v-model="divider.value.value"
                                        :error-messages="divider.errorMessage.value" 
                                        label="Le diviseur"
                                       
                                    ></v-text-field>
                                </v-col>
                                <v-col cols="12" sm="6">
                                    <v-select  
                                        label="Unité"
                                        :items="unites" 
                                        @update:modelValue="changed" 
                                        single-line variant="outlined" 
                                        v-model="unite.value.value" 
                                        :error-messages="unite.errorMessage.value">
                                    </v-select>
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
            </v-dialog>
        </v-col>
    </v-row>

    <EasyDataTable
        :headers="headers"
        :items="getItems"
        table-class-name="customize-table"
        :theme-color="themeColor"
        :search-field="searchField"
        :search-value="searchValue"
        :rows-per-page="5"
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


