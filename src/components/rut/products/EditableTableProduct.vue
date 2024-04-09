<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useProductsList } from '@/stores/rutStore/products/productsListStore';

import { useField, useForm } from 'vee-validate';

import type {  Items } from '@/types/rut/ProductsType';

import contact from '@/_mockApis/apps/contact';

const {fetchProducts,getProducts, errors} = useProductsList();

onMounted(async () => {
    await fetchProducts();
});

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
            <v-text-field density="compact" v-model="search" label="Rechercher des articles" hide-details variant="outlined"></v-text-field>
        </v-col>
        <v-col cols="12" lg="8" md="6" class="text-right">
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
                                        v-model="image.value.value"
                                        :error-messages="image.errorMessage.value" 
                                    ></v-file-input>
                    
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
