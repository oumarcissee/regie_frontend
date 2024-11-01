<script setup lang="ts">

import { useField, useForm } from 'vee-validate';
import { onMounted, ref , onUnmounted} from 'vue';


import type { UserCreateOptions } from '@/types/rut/ProvidersType';

import {getItemSelected, setItemSelected } from '@/services/utils';

import { useProdiverStore } from '@/stores/providerStore';

const { errors, add } = useProdiverStore()

onMounted(async () => {
    if (getItemSelected()) {
        username.value.value   = await getItemSelected()?.username
        email.value.value      = await getItemSelected()?.email
        first_name.value.value = await getItemSelected()?.first_name
        last_name.value.value  = await getItemSelected()?.last_name
        phone_number.value.value = await getItemSelected()?.phone_number
        address.value.value    = await getItemSelected()?.address
        matricule.value.value  = await getItemSelected()?.matricule
        role.value.value = await getItemSelected()?.role
        roleSelected.value = await getItemSelected()?.role
    } 
});

// Fonction pour réinitialiser les champs
const resetFields = async () => {
    if (getItemSelected()) setItemSelected(null);

    username.value.value = '';
    email.value.value = '';
    first_name.value.value = '';
    last_name.value.value = '';
    phone_number.value.value = '';
    address.value.value = '';
    matricule.value.value = '';
    role.value.value = '';

    roleSelected.value = '';
};

// Utiliser onUnmounted pour appeler la fonction de réinitialisation
onUnmounted(async() => {
    await resetFields();
});


const { handleSubmit, handleReset , isSubmitting} = useForm({
    validationSchema: {
        username(value: string | any[]) {
            // if (value?.length >= 4) return true;
            // return "Le nom d'utilisateur doit avoir au moins 4 caractères.";
        if (value?.length <= 4 || !value) {
                return "Le nom d'utilisateur doit être au moins 4 lettres.";
            } else if(errors.usernameError && errors.usernameText === value){

                return errors.usernameError
            }

            return true;
        },

        email(value: string | any[]) {
            if (value?.length <= 2 || !value) {
                return "L'adresse doit être valide.";
            } else if (!(/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(value as any))) {
                return "L'adresse doit être valide.";
            } else if (errors.emailError && errors.emailText === value) {
                return errors.emailError
            }

            return true;
        },
        
        first_name(value: string | any[]) {
            if (value?.length >= 2) return true;
            return "Le prénom doit avoir au moins 2 caractères.";
        },
        
        role(value: string | any[]) {
            if (value) return true
            return "Choisissez un rôle.";  
        },
        matricule(value: string | any[]) {
            if (roleSelected.value !== 'FOURNISSEUR') {
                if (!value?.length || value?.length < 2) {
                    return "Le matricule est obligatoire.";
                }
            } 
            return true;
        },

        last_name(value: string | any[]) {
            if (value?.length >= 2) return true;
            return "Le nom doit avoir au moins 2 caractères.";
        },

        phone_number(value: string | any[]) {
            // Vérifier si la valeur est une chaîne de caractères
            // Utiliser une expression régulière pour vérifier si la chaîne contient exactement 9 chiffres
            if (!(/^\d{9}$/.test(value as any))) {
                // La chaîne ne contient que des chiffres et a une longueur de 9 caractères
                return "Le numéro doit être exactement de 9 chiffres.";
            } else if (errors.phone_numberError && errors.phone_numberText === value) {
                return errors.phone_numberError
            }

            return true;
        },

        address(value: string | any[]) {
            if (value?.length >= 3) return true;
            return true
        },
              
    },
});


const valid = ref(false);


const email         = useField("email");
const username      = useField("username");
const first_name    = useField("first_name");
const last_name     = useField("last_name");
const phone_number  = useField("phone_number");
const address       = useField("address");
const matricule     = useField("matricule")
const role          = useField("role");

const roles = ref([
    {title:'MAGASINIER (A)',    value: 'kepper_a'},
    {title:'FOURNISSEUR',       value: 'provider'},
])


const pError = ref();

const roleSelected = ref();


const changed = (value: string | any) => {
    roleSelected.value = value
    return value
}
let irreur : number = 0;

const submit = handleSubmit(async (data: any, { setErrors }: any) => {
    
    const formData : UserCreateOptions = {
        username: data.username,
        matricule: data.matricule,
        first_name: data.first_name,
        last_name: data.last_name,
        address: data.address,
    };

    switch (data.role) {
        case 'FOURNISSEUR':
            formData.role = 'provider';
            break;
        case 'MAGASINIER (A)':
            formData.role = 'kepper_a';
        break;
        case 'RUT':
            formData.role = 'manager_a';
        break;
        case 'MAGASINIER (B)':
            formData.role = 'manager_b';
        break;

        default:
            formData.role = data.role;
            break;
    }
    
    formData.phone_number = data.phone_number;
    formData.email = data.email;

    if (!getItemSelected()) {
        formData.password = formData.phone_number + "mqslkdjw@;";
    }
    

    try {
        pError.value = null
        errors.usernameError = null
        errors.emailError = null

        if (getItemSelected()) {
            return await add(formData, getItemSelected().id)
        }
    
        return await add(formData);

    } catch (error) {
        pError.value = error  
        irreur++;

        submit()

        return setErrors({ apiError: error });
    }

});


</script>
<template>
    <v-form @submit.prevent="submit()" v-slot="{ errors }">
        <v-row>

            <v-col cols="12" sm="4">
                <v-label class="mb-2 font-weight-medium">Nom d'utilisateur</v-label>
                <v-text-field variant="outlined" placeholder="Nom d'utilisateur" color="primary"
                 :error-messages="username.errorMessage.value" v-model="username.value.value"></v-text-field>
                <v-label class="mb-2 font-weight-medium">Prénoms</v-label>
                <v-text-field variant="outlined" placeholder="Prénom"  color="primary" 
                :error-messages="first_name.errorMessage.value" v-model="first_name.value.value"></v-text-field>
            </v-col>
            <v-col cols="12" sm="4">
                <v-label class="mb-2 font-weight-medium">Email</v-label>
                <v-text-field variant="outlined" placeholder="E-mail" color="primary" :error-messages="email.errorMessage.value" v-model="email.value.value"></v-text-field>
                <v-label class="mb-2 font-weight-medium">Nom</v-label>
                <v-text-field variant="filled" placeholder="Nom" color="primary" :error-messages="last_name.errorMessage.value" v-model="last_name.value.value"></v-text-field>
            </v-col>

             <v-col cols="12" sm="4">
                
                <v-label class="mb-2 font-weight-medium">Rôle</v-label>
                <v-select  :items="roles" @update:model-value="changed" single-line variant="outlined" v-model="role.value.value" :error-messages="role.errorMessage.value"></v-select>

                <v-label class="mb-2 font-weight-medium">Téléphone</v-label>
                <v-text-field variant="outlined" placeholder="6xxxxxxx" color="primary" :error-messages="phone_number.errorMessage.value" v-model="phone_number.value.value"></v-text-field>
            </v-col>
            
            <v-col cols="12" sm="4">
                <v-label class="mb-2 font-weight-medium">Adresse</v-label>
                <v-text-field variant="outlined" placeholder="Sonfonia" color="primary" :error-messages="address.errorMessage.value" v-model="address.value.value"></v-text-field>
                
            </v-col>

             <v-col cols="12" sm="4" v-if="role.value.value !== 'FOURNISSEUR'">
                <v-label class="mb-2 font-weight-medium">Matricule</v-label>
                <v-text-field variant="outlined" placeholder="Matricule" color="primary" :error-messages="matricule.errorMessage.value" v-model="matricule.value.value"
               ></v-text-field>
            </v-col>

            <v-btn size="large" :loading="isSubmitting" color="primary" :disabled="valid" block type="submit" flat>Ajouter</v-btn>  

            <!-- <div v-if="errors.apiError " class="mt-2">
                <v-alert color="error">{{ errors.apiError }} </v-alert>
            </div>
            
            <div v-else-if="pError" class="mt-2">
                <v-alert color="error">{{ pError }} </v-alert>
            </div> -->

        </v-row>
    </v-form>
</template>
