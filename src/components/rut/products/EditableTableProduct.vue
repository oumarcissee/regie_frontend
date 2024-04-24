<script setup lang="ts">
import { ref, computed, onMounted, watchEffect, watch, type Ref, onUnmounted} from 'vue';
import { useProductsList } from '@/stores/rutStore/products/productsListStore';
import {getItemSelected, setItemSelected } from '@/services/utils';

import  type { VueCropperMethods }  from 'vue-cropperjs';
import VueCropper from 'vue-cropperjs';

import 'cropperjs/dist/cropper.css';

import { useField, useForm } from 'vee-validate';

import type {  Items } from '@/types/rut/ProductsType';

import contact from '@/_mockApis/apps/contact';
import { router } from '@/router';
import { round } from 'lodash';


const { fetchProducts, getProducts, addOrUpdateProduct, errors} = useProductsList();


onMounted(async () => {
    if (getItemSelected()) {
        name.value.value = getItemSelected()?.name;
        image.value.value = getItemSelected()?.image;
        price.value.value = getItemSelected()?.price;
        unite.value.value = getItemSelected()?.unite;
        rate_per_days.value.value = getItemSelected()?.rate_per_days;
        divider.value.value = getItemSelected()?.divider;
        description.value.value = getItemSelected()?.description;

        
    } 
});

// Fonction pour réinitialiser les champs
const resetFields = async () => {
    if (getItemSelected()) setItemSelected(null);
    name.value.value = null;
    image.value.value = null;
    price.value.value = null;
    unite.value.value = null;
    rate_per_days.value.value = null;
    divider.value.value = null;
    description.value.value = null;
};

// Utiliser onUnmounted pour appeler la fonction de réinitialisation
onUnmounted(async() => {
    await resetFields();
});

let form : Items  = Object()

const formData = new FormData();

const imageSrc = ref('');

let cropImg = ref<string | null>(null);
const data = ref<string | null | undefined>(null);
let cropper = ref<VueCropperMethods | null>(null);
let input = ref<HTMLInputElement | null>(null);
const croppedFile = ref<File | null>(null);


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


function cropImage() {
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



function getCropBoxData() {
  data.value = JSON.stringify(cropper.value?.getCropBoxData(), null, 4);
}

function getData() {
  data.value = JSON.stringify(cropper.value?.getData(), null, 4);
}

function move(offsetX: number, offsetY: number | undefined) {
  cropper.value?.move(offsetX, offsetY);
}

function reset() {
  cropper.value?.reset();
}

function rotate(deg: number) {
  cropper.value?.rotate(deg);
}

function setCropBoxData() {
  if (!data.value) return;
  cropper.value?.setCropBoxData(JSON.parse(data.value));
}

function setData() {
  if (!data.value) return;
  cropper.value?.setData(JSON.parse(data.value));
}


function showFileChooser() {
  input.value?.click();
}

function zoom(percent: number) {
  cropper.value?.relativeZoom(percent);
}




const dialogImg = ref(false) as any;


const getContacts: any = computed(() => {
    return getProducts;
});


const { handleSubmit, handleReset , isSubmitting} = useForm({
    validationSchema: {
        name(value: string | any[]) {
        if (value?.length <= 4 || !value) {
                return "Le libéllé doit avoir au moins 4 lettres.";
            } else if(errors.nameError && errors.nameText === value){

                return errors.nameError
            }

            return true;
        },

        image(value: string | any[]) {
    
            if (!value || value[0]?.type.indexOf('image/') === -1) {
                return "Veillez selectionez une image";
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

const name              = useField("name");
const image             = useField("image");
const price             = useField("price");
const unite             = useField("unite");
const rate_per_days     = useField("rate_per_days");
const divider           = useField("divider");
const description       = useField("description")

const count = ref(0);

const submit = handleSubmit(async (data: any, { setErrors }: any) => {
   try {
        form = {
            name: data.name,
            image: croppedFile.value ? croppedFile.value : data.image[0],
            price: data.price,
            unite: data.unite,
            rate_per_days: data.rate_per_days,
            divider: data.divider,
        };

        
        formData.append('name', data.name);
        formData.append('price', data.price);
        formData.append('unite', data.unite);
        formData.append('rate_per_days', data.rate_per_days);
        formData.append('divider', data.divider);
        formData.append('description', data.description);
    

        //Si un élément est selectioné
        if(getItemSelected()) return await addOrUpdateProduct(formData, getItemSelected().custom_id);
        //Si y'a aucun élément n'est selectioné
        return await addOrUpdateProduct(formData)

    } catch (error) {
 
        count.value++;
        if (count.value >= 5) {
            // Arrêter l'exécution du script ou effectuer une action appropriée
            console.log('Le nombre maximum de tentatives de soumission a été dépassé.');
            return;
        }

        submit()
        return setErrors({ apiError: error });
    }

});

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
    return desserts.value.filter((user: any) => {
        return user.userinfo.toLowerCase().includes(search.value.toLowerCase());
    });
});



function close() {
    dialog.value = false;
}

function closeImg() {
    dialogImg.value = false;
   
}

// Méthode pour modifier un élément
const editItem = (index: any) => {
    dialog.value = true;
    setItemSelected(index)
    // return router.push({name: 'EditProvider', params:{param: index.id}})
};

//Suppression d'un element
// const remove = async (index: any) => {
//     try {
//         await store.deleteItem(index, 'u/users');
//         await refreshTable(); // Rafraîchir les données après la suppression
//     } catch (error) {
//         console.error('Erreur lors de la suppression :', error);
//     }
// };

// const refreshTable = async () => {
//     await store.fetchUsers();
// };


//Computed Property
const formTitle = computed(() => {
    return editedIndex.value === -1 ? 'Nouvel Article' : 'Editer un Article';
});


</script>
<template>
    <v-row>
        <v-col cols="12" lg="4" md="6">
            <v-text-field density="compact" v-model="search" label="Rechercher des articles" variant="outlined"></v-text-field>
        </v-col>
        <v-col cols="12" lg="8" md="6" class="text-right ">
            <!-- Dialogue img -->
            <v-dialog v-model="dialogImg" max-width="1000" >
                <v-card>
                    <v-card-title class="pa-4 bg-secondary d-flex align-center justify-space-between">
                        <span class="title text-white">Recadrement de l'image</span>
                        <v-icon @click="closeImg()" class="ml-auto">mdi-close</v-icon>
                    </v-card-title>

                    <v-card-text>
                        <v-row>      
                          <v-col cols="12" >
          
                            <div class="content">
                              <section class="cropper-area">
                                <div class="img-cropper">
                                  <VueCropper
                                    ref="cropper"
                                    :aspect-ratio="16 / 9"
                                    :src="imageSrc"
                                    preview=".preview"
                                  />
                                </div>
                                
                              </section>
                      
                            </div>
                                
                          </v-col> 

                          <!-- <v-col cols="12" sm="4">
                               <section class="preview-area">
                                <p>Visualiser</p>
                                <div class="preview" />
                                <p>Image coupée</p>
                                <div class="cropped-image">
                                  <img
                                    v-if="cropImg"
                                    :src="cropImg"
                                    alt="Cropped Image"
                                  />
                                  <div v-else class="crop-placeholder" />
                                </div>
                              </section>
                          </v-col>  -->

                        </v-row>

                    </v-card-text>

                    <v-card-actions class="pa-4">
                        
                        <v-btn
                            color="secondary"
                            variant="flat"
                            block
                            @click="cropImage"
                            >Recadrer l'image</v-btn
                        >
                    </v-card-actions>
                </v-card>
            </v-dialog>
            <!-- End dialogue img -->

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
                                        ref="input"
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
                            >Enregistrer</v-btn
                        >
                    </v-card-actions>
                </v-card>
            </v-dialog>
        </v-col>
    </v-row>
    <v-table class="mt-5">
        <thead>
            <tr>
                <th class="text-subtitle-1 font-weight-semibold">Id</th>
                <th class="text-subtitle-1 font-weight-semibold">UserInfo</th>
                <th class="text-subtitle-1 font-weight-semibold">Phone</th>
                <th class="text-subtitle-1 font-weight-semibold">Joining Date</th>
                <th class="text-subtitle-1 font-weight-semibold">Role</th>
                <th class="text-subtitle-1 font-weight-semibold">Actions</th>
            </tr>
        </thead>
        <tbody>
            <tr v-for="item in filteredList" :key="item.id">
                <td class="text-subtitle-1">{{ item.id }}</td>
                <td>
                    <div class="d-flex align-center py-4">
                        <div>
                            <v-img :src="item.avatar" width="45px" class="rounded-circle img-fluid"></v-img>
                        </div>

                        <div class="ml-5">
                            <h4 class="text-h6 font-weight-semibold">{{ item.userinfo }}</h4>
                            <span class="text-subtitle-1 d-block mt-1 textSecondary">{{ item.usermail }}</span>
                        </div>
                    </div>
                </td>
                <td class="text-subtitle-1">{{ item.phone }}</td>
                <td class="text-subtitle-1">{{ item.jdate }}</td>
                <td>
                    <v-chip :color="item.rolestatus" size="small" label>{{ item.role }}</v-chip>
                </td>
                <td>
                    <div class="d-flex align-center">
                        <v-tooltip text="Edit">
                            <template v-slot:activator="{ props }">
                                <v-btn icon flat @click="editItem(item)" v-bind="props"
                                    ><PencilIcon stroke-width="1.5" size="20" class="text-primary"
                                /></v-btn>
                            </template>
                        </v-tooltip>
                        <v-tooltip text="Delete">
                            <template v-slot:activator="{ props }">
                                <v-btn icon flat @click="" v-bind="props"
                                    ><TrashIcon stroke-width="1.5" size="20" class="text-error"
                                /></v-btn>
                            </template>
                        </v-tooltip>
                    </div>
                </td>
            </tr>
        </tbody>
    </v-table>
</template>


