<template>
  <div>
    <div class="header">
      <h2>Vue CropperJS</h2>
      <a href="https://github.com/Agontuk/vue-cropperjs">Github</a>
    </div>
    <hr />

    <input
      ref="input"
      type="file"
      name="image"
      accept="image/*"
      @change="setImage"
    />

    <div class="content">
      <section class="cropper-area">
        <div class="img-cropper">
          <vue-cropper
            ref="cropper"
            :aspect-ratio="16 / 9"
            :src="imgSrc"
            preview=".preview"
          />
        </div>
        <div class="actions">
          <a
            href="#"
            role="button"
            @click.prevent="zoom(0.2)"
          >
            Zoom In
          </a>
          <a
            href="#"
            role="button"
            @click.prevent="zoom(-0.2)"
          >
            Zoom Out
          </a>
          <a
            href="#"
            role="button"
            @click.prevent="move(-10, 0)"
          >
            Move Left
          </a>
          <a
            href="#"
            role="button"
            @click.prevent="move(10, 0)"
          >
            Move Right
          </a>
          <a
            href="#"
            role="button"
            @click.prevent="move(0, -10)"
          >
            Move Up
          </a>
          <a
            href="#"
            role="button"
            @click.prevent="move(0, 10)"
          >
            Move Down
          </a>
          <a
            href="#"
            role="button"
            @click.prevent="rotate(90)"
          >
            Rotate +90deg
          </a>
          <a
            href="#"
            role="button"
            @click.prevent="rotate(-90)"
          >
            Rotate -90deg
          </a>
          
          <a
            href="#"
            role="button"
            @click.prevent="cropImage"
          >
            Crop
          </a>
          <a
            href="#"
            role="button"
            @click.prevent="reset"
          >
            Reset
          </a>
          <a
            href="#"
            role="button"
            @click.prevent="getData"
          >
            Get Data
          </a>
          <a
            href="#"
            role="button"
            @click.prevent="setData"
          >
            Set Data
          </a>
          <a
            href="#"
            role="button"
            @click.prevent="getCropBoxData"
          >
            Get CropBox Data
          </a>
          <a
            href="#"
            role="button"
            @click.prevent="setCropBoxData"
          >
            Set CropBox Data
          </a>
          <a
            href="#"
            role="button"
            @click.prevent="showFileChooser"
          >
            Upload Image
          </a>
        </div>

        <!-- <textarea v-model="data" /> -->
      </section>
      <section class="preview-area">
        <p>Preview</p>
        <div class="preview" />
        <p>Cropped Image</p>
        <div class="cropped-image">
          <img
            v-if="cropImg"
            :src="cropImg"
            alt="Cropped Image"
          />
          <div v-else class="crop-placeholder" />
        </div>
      </section>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import VueCropper, { type VueCropperMethods } from 'vue-cropperjs';
import 'cropperjs/dist/cropper.css';
import image from '@/assets/images/berserk.jpg';

let imgSrc = ref(image);
let cropImg = ref<string | null>(null);
let data = ref<string | null>(null);
let cropper = ref<VueCropperMethods | null>(null);
let input = ref<HTMLInputElement | null>(null);


function setImage(e: Event) {
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



</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style>
body {
  font-family: Arial, Helvetica, sans-serif;
  width: 1024px;
  margin: 0 auto;
}

input[type="file"] {
  display: none;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 0 5px 0;
}

.header h2 {
  margin: 0;
}

.header a {
  text-decoration: none;
  color: black;
}

.content {
  display: flex;
  justify-content: space-between;
}

.cropper-area {
  width: 614px;
}

.actions {
  margin-top: 1rem;
}

.actions a {
  display: inline-block;
  padding: 5px 15px;
  background: #0062CC;
  color: white;
  text-decoration: none;
  border-radius: 3px;
  margin-right: 1rem;
  margin-bottom: 1rem;
}

textarea {
  width: 100%;
  height: 100px;
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