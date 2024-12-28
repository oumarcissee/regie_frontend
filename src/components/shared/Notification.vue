<script setup lang="ts">

// Définition des props avec leurs types
interface Props {
  isLoading: boolean;
  data: any[];
  showSnackbar?: boolean;
  snackbar: {
    value: boolean;
  };
  snackbarColor: {
    value: string;
  };
  snackbarMessage: string;

}

// Utilisation de defineProps avec le type générique
const props = defineProps<Props>();
</script>

<template>
  <!-- Snackbar pour les notifications -->
  <v-snackbar
    v-model="snackbar.value"
    :color="snackbarColor.value"
    :timeout="3000"
    location="top"
  >
    {{ snackbarMessage }}
    
    <template #actions>
      <v-btn
        color="white"
        variant="text"
        @click="snackbar.value = false"
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
    />
  </v-overlay>
</template>