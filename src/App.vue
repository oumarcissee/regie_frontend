<template>
  <RouterView></RouterView>
</template>

<script setup lang="ts">
import { RouterView } from "vue-router";
</script>

<style >
/* .cropper-view-box, .cropper-face {
  border-radius: 50%;
} */



.content {
  display: flex;
  justify-content: space-between;
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
  height: 100%;
  background: #ccc;
}

.cropped-image img {
  max-width: 100%;
}
</style>

