<script setup lang="ts">
import { ref, computed, onMounted, watchEffect, watch, type Ref, onUnmounted} from 'vue';
import { useProductsList } from '@/stores/rutStore/products/productsListStore';

import  type { VueCropperMethods }  from 'vue-cropperjs';
import VueCropper from 'vue-cropperjs';

import 'cropperjs/dist/cropper.css';

import { useField, useForm } from 'vee-validate';

import type {  Items } from '@/types/rut/ProductsType';

import contact from '@/_mockApis/apps/contact';


const { fetchProducts, getProducts, errors } = useProductsList();





let imgSrc = ref('@/assets/images/berserk.jpg');
let cropImg = ref<string | null>(null);
let data = ref<string | null>(null);
let cropper = ref<VueCropperMethods | null>(null);
let input = ref<HTMLInputElement | null>(null);


function setImage(e: Event) {
  dialogImg.value = true
  const target = e.target as HTMLInputElement;
  const file = (target.files as FileList)[0];

  if (!file || file.type.indexOf('image/') === -1) {
    alert('Please select an image file');
    return;
  }

  const reader = new FileReader();
  reader.onload = (event) => {
    if (event.target && event.target.result) {
      imgSrc.value = event.target.result.toString();
      if (cropper.value) {
        cropper.value.replace(imgSrc.value);
      }
    }
  };

  reader.readAsDataURL(file);
}



function cropImage() {
  if (cropper.value) {
    const canvas = cropper.value.getCroppedCanvas();
    if (canvas) {
      cropImg.value = canvas.toDataURL();
    }
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





//************************************************************************************************







const img = ref(null) as any;

const dialogImg = ref(false) as any;

const selectedImage = ref(null);
const reader = new FileReader();
const imageInput = ref(null);
const imageSrc = ref("");


reader.onload = (e: any) => {
    imageSrc.value = e.target?.result as string;
};

// Méthode pour gérer le changement de fichier
const onFileChange = (event: any) => {
    dialogImg.value = true
    const file = event.target.files?.[0] || event.dataTransfer.files?.[0];

    if (file) {
        imageSrc.value = URL.createObjectURL(file);
        selectedImage.value = file;
    }

};

watchEffect(() => {
    if (selectedImage.value) {
        imageSrc.value = URL.createObjectURL(selectedImage.value);
        // reader.readAsDataURL(selectedImage.value);
    } else {
        imageSrc.value = "";
    }
})

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
            if (!value) {
                return "Selectonner une image.";
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

let count: any = ref(0)

const submit = handleSubmit(async (data: any, { setErrors }: any) => {
   try {
        const formData : Items = {
            name: data.name,
            image: data.image[0],
            price: data.price,
            unite: data.unite,
            rate_per_days: data.rate_per_days,
            divider: data.divider,
        };

    } catch (error) {
 
        count++;
        if(count.value > 5) return
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
    {title: 'Carton(s)', value: 'Cardboard'},
])


const valid = ref(true);
const dialog = ref(false);

const search = ref('');
const rolesbg = ref(['primary', 'secondary', 'error', 'success', 'warning']);
const desserts = ref(contact);
const editedIndex = ref(-1);
const editedItem = ref({
    id: '',
    avatar: '1.jpg',
    userinfo: '',
    usermail: '',
    phone: '',
    jdate: '',
    role: '',
    rolestatus: ''
});
const defaultItem = ref({
    id: '',
    avatar: '1.jpg',
    userinfo: '',
    usermail: '',
    phone: '',
    jdate: '',
    role: '',
    rolestatus: ''
});



//Methods
const filteredList = computed(() => {
    return desserts.value.filter((user: any) => {
        return user.userinfo.toLowerCase().includes(search.value.toLowerCase());
    });
});

function editItem(item: any) {
    editedIndex.value = desserts.value.indexOf(item);
    editedItem.value = Object.assign({}, item);
    dialog.value = true;
}
function deleteItem(item: any) {
    const index = desserts.value.indexOf(item);
    confirm('Are you sure you want to delete this item?') && desserts.value.splice(index, 1);
}

function close() {
    dialog.value = false;
    setTimeout(() => {
        editedItem.value = Object.assign({}, defaultItem.value);
        editedIndex.value = -1;
    }, 300);
}

function closeImg() {
    dialogImg.value = false;
    setTimeout(() => {
        editedItem.value = Object.assign({}, defaultItem.value);
        editedIndex.value = -1;
    }, 300);
}
function save() {
    if (editedIndex.value > -1) {
        Object.assign(desserts.value[editedIndex.value], editedItem.value);
    } else {
        desserts.value.push(editedItem.value);
    }
    close();
}

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
        <v-col cols="12" lg="8" md="6" class="text-right">
            <!-- Dialogue img -->
            <v-dialog v-model="dialogImg" max-width="800">
                <v-card>
                    <v-card-title class="pa-4 bg-secondary d-flex align-center justify-space-between">
                        <span class="title text-white">Recadrement de l'image</span>
                        <v-icon @click="closeImg()" class="ml-auto">mdi-close</v-icon>
                    </v-card-title>

                    <v-card-text>
                        <v-row>      
                          <v-col cols="12" sm="8">
          
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

                          <v-col cols="12" sm="4">
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
                          </v-col> 

                        </v-row>


                    </v-card-text>

                    <v-card-actions class="pa-4">
                        
                        <v-btn
                            color="secondary"
                            variant="flat"
                            block
                            >Valider</v-btn
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
                                        accept="image/*"
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
                            :disabled="editedItem.userinfo == '' || editedItem.usermail == ''"
                            variant="flat"
                            @click="save"
                            block
                            >Save</v-btn
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
                                <v-btn icon flat @click="deleteItem(item)" v-bind="props"
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


<style >
.cropper-view-box, .cropper-face {
  border-radius: 50%;
}


input[type="file"] {
  display: none;
}


.content {
  display: flex;
  justify-content: space-between;
}

.cropper-area {
  width: 614px;
}



.preview-area {
  width: 307px;
}

.preview-area p {
  font-size: 1.25rem;
  margin: 0;
  margin-bottom: 1rem;
}

.preview-area p:last-of-type {
  margin-top: 1rem;
}

.preview {
  width: 100%;
  height: calc(372px * (9 / 16));
  overflow: hidden;
}

.crop-placeholder {
  width: 100%;
  height: 200px;
  background: #ccc;
}

.cropped-image img {
  max-width: 100%;
}
</style>
