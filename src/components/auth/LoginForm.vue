<script setup lang="ts">
import { ref } from 'vue';
import { useAuthStore } from '@/stores/auth';
import { Form, useField, useForm } from 'vee-validate';

/*Social icons*/
import google from '@/assets/images/svgs/google-icon.svg';
import facebook from '@/assets/images/svgs/facebook-icon.svg';


const { handleSubmit, handleReset } = useForm({
  validationSchema: {
    username(value: string | any[]) {
      if (value?.length >= 4) return true;
      return "Le nom d'utilisateur doit avoir au moins 4 caractères.";
    },

    password(value: string | any[]) {
      if (value?.length >= 4) return true;
      return "Le mot de passe doit avoir au moins 4 caractères.";
    },
  },
});

const checkbox = ref(false);
const valid = ref(false);
const show1 = ref(false);

const username = useField("username");
const password = useField("password");

const UserError = ref()



const submit = handleSubmit(async (data: any, {setErrors}: any) => {
    const authStore = useAuthStore();
  
    try {
        UserError.value = null
        return await authStore.login(data.username, data.password);
    } catch (error) {
        UserError.value = error
        return setErrors({ apiError: error });
    }

});

</script>

<template>
    <v-row class="d-flex mb-3">
        <v-col cols="6" sm="6" >
            <v-btn variant="outlined" size="large" class="border text-subtitle-1" block>
                <img :src="google" height="16" class="mr-2" alt="google" />
                <span class="d-sm-flex d-none mr-1">Continuer avec</span>Google
            </v-btn>
        </v-col>
        <v-col cols="6" sm="6">
            <v-btn variant="outlined" size="large" class="border text-subtitle-1" block>
                <img :src="facebook" width="25" height="25" class="mr-1" alt="facebook" />
                <span class="d-sm-flex d-none mr-1">Continuer avec</span>FB
            </v-btn>
        </v-col>
    </v-row>
    <div class="d-flex align-center text-center mb-6">
        <div class="text-h6 w-100 px-5 font-weight-regular auth-divider position-relative">
            <span class="bg-surface px-5 py-3 position-relative">or Continuer avec</span>
        </div>  
    </div>
    <Form @submit="submit()" v-slot="{ errors, isSubmitting }" class="mt-5">
        <v-label class="text-subtitle-1 font-weight-semibold pb-2 text-lightText">Identifiant</v-label>
        <VTextField
            v-model="username.value.value"
            :error-messages="username.errorMessage.value"
            placeholder="Nom d'utilisateur"
            class="mb-8"
            required
            hide-details="auto"
        ></VTextField>
        <v-label class="text-subtitle-1 font-weight-semibold pb-2 text-lightText">Mot de passe</v-label>
        <VTextField
            v-model="password.value.value"
            :error-messages="password.errorMessage.value"
            placeholder="Mot de passe"
            required
            hide-details="auto"
            type="password"
            class="pwdInput"
        ></VTextField>
        <div class="d-flex flex-wrap align-center my-3 ml-n2">
            <v-checkbox v-model="checkbox" :rules="[(v:any) => !!v || 'You must agree to continue!']" required hide-details color="primary">
                <template v-slot:label class="">Souvenez-vous de ce appareil</template>
            </v-checkbox>
            <div class="ml-sm-auto">
                <RouterLink to="" class="text-primary text-decoration-none text-body-1 opacity-1 font-weight-medium"
                    >Mot de passe oublié ?</RouterLink
                >
            </div>
        </div>
        <v-btn size="large" :loading="isSubmitting" color="primary" :disabled="valid" block type="submit" flat>Connexion</v-btn>
        <div v-if="errors.apiError " class="mt-2">
            <v-alert color="error">{{ errors.apiError }} </v-alert>
        </div>
        <div v-else-if="UserError" class="mt-2">
            <v-alert color="error">{{UserError }} </v-alert>
        </div>
    </Form>
</template>
