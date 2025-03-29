<script setup lang="ts">


const { items, name,label, isDisabled } = defineProps({
  items: Array as any,
  itemSelected: Array as any,
  isDisabled: Boolean,

  label: String as any,
  name: String,

})

</script>
<template>
  <v-autocomplete
      :disabled="isDisabled"
      :items="items"
      :label="label"
      item-value="id"
      item-title="name"
      color="blue-grey-lighten-2"
      variant="outlined"
      density="compact"
      chips
    >
      <template v-slot:chip="{ props, item }">
        <v-chip
          v-bind="props"
          :prepend-avatar="(item as any).raw.image"
          :text="(item as any).raw.name"
        ></v-chip>

      </template>

      <template v-slot:item="{ props, item }">
        <v-list-item
          v-bind="props"
          :prepend-avatar="(item as any).raw.image"
          :title="(item as any).raw.name"
          :subtitle="(item as any).raw.description"
        ></v-list-item>
      </template>
  </v-autocomplete>
</template>
