<script setup lang="ts">


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
          :text="(item as any).raw.short_name"
        ></v-chip>

      </template>

      <template v-slot:item="{ props, item }">
        <v-list-item
          v-bind="props"
          :prepend-avatar="(item as any).raw.image"
          :title="(item as any).raw.short_name + ' : Effectif ('  + (item as any).raw.effective +')'"
          :subtitle="(item as any).raw.name"
        ></v-list-item>
      </template>
  </v-autocomplete>
</template>
