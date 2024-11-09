<script setup lang="ts">
import { ref } from 'vue';
import { getCurrentUser } from '@/services/utils';


const { items, label, title, isDisabled } = defineProps({
  items: Array as any,
  itemSelected: Array as any,
  isDisabled: Boolean,
  label: String,
  title: String,

})




</script>
<template>
  <v-autocomplete
      @update:modelValue="getCurrentUser" 
      :disabled="isDisabled"
      :items="items"
      :item-title="title"
      :label="label"
      item-value="id"
      color="blue-grey-lighten-2"
      variant="outlined"
      density="compact"
      chips
    >
      <template v-slot:chip="{ props, item }">
        <v-chip
          v-bind="props"
          :prepend-avatar="(item as any).raw.image"
          :text="(item as any).raw.first_name + ' ' + (item as any).raw.last_name"
        ></v-chip>

      </template>

      <template v-slot:item="{ props, item }">
        <v-list-item
          v-bind="props"
          :prepend-avatar="(item as any).raw.image"
          :subtitle="(item as any).raw.first_name"
          :title="(item as any).raw.last_name"
        ></v-list-item>
      </template>
  </v-autocomplete>
</template>
