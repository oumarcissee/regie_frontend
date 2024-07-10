<template>
  <v-container>
    <v-card>
      <v-card-title>Signature Request</v-card-title>
      <v-card-text>
        <v-form @submit.prevent="handleSubmit">
          <v-text-field v-model="form.name" label="Name" required></v-text-field>
          <v-text-field v-model="form.delivery_mode" label="Delivery Mode" required></v-text-field>
          <v-text-field v-model="form.timezone" label="Timezone" required></v-text-field>
          <v-btn type="submit" color="primary">Initiate Signature Request</v-btn>
        </v-form>
      </v-card-text>
    </v-card>
  </v-container>
</template>

<script lang="ts">
import axios from 'axios';
import FormData from 'form-data';
import fs from 'fs';

export default {
  data() {
    return {
      form: {
        name: 'Signature request example',
        delivery_mode: 'email',
        timezone: 'Europe/Paris',
      },
      BASE_URL: 'https://api-sandbox.yousign.app/v3',
      API_KEY: 'REPLACE_WITH_YOUR_API_KEY',
      signatureRequestId: null,
      documentId: null,
    };
  },
  methods: {
    async request(endpoint = '', options = {}, headers = {}) {
      const url = `${this.BASE_URL}/${endpoint}`;
      const config = {
        url,
        headers: {
          Authorization: `Bearer ${this.API_KEY}`,
          ...headers,
        },
        ...options,
      };

      try {
        const res = await axios(config);
        return res.data;
      } catch (e) {
        throw new Error('Error on API call');
      }
    },
    async initiateSignatureRequest() {
      const body = {
        name: this.form.name,
        delivery_mode: this.form.delivery_mode,
        timezone: this.form.timezone,
      };
      const options = {
        method: 'POST',
        data: JSON.stringify(body),
      };
      const headers = {
        'Content-type': 'application/json',
      };
      const response = await this.request('signature_requests', options, headers);
      this.signatureRequestId = response.id;
    },
    async uploadDocument() {
      const form = new FormData();
      form.append('file', fs.createReadStream('test.pdf'), {
        filename: 'test.pdf',
      });
      form.append('nature', 'signable_document');
      form.append('parse_anchors', 'true');

      const options = {
        method: 'POST',
        data: form,
      };
      const headers = form.getHeaders();
      const response = await this.request(`signature_requests/${this.signatureRequestId}/documents`, options, headers);
      this.documentId = response.id;
    },
    async addSigner() {
      const body = {
        info: {
          first_name: 'John',
          last_name: 'Doe',
          email: 'john.doe@example.com',
          phone_number: '+33601234567',
          locale: 'fr',
        },
        signature_level: 'electronic_signature',
        signature_authentication_mode: 'no_otp',
        fields: [
          {
            document_id: this.documentId,
            type: 'signature',
            page: 1,
            x: 77,
            y: 581,
          },
        ],
      };
      const options = {
        method: 'POST',
        data: JSON.stringify(body),
      };
      const headers = {
        'Content-type': 'application/json',
      };
      await this.request(`signature_requests/${this.signatureRequestId}/signers`, options, headers);
    },
    async activateSignatureRequest() {
      const options = {
        method: 'POST',
      };
      await this.request(`signature_requests/${this.signatureRequestId}/activate`, options);
    },
    async handleSubmit() {
      try {
        await this.initiateSignatureRequest();
        await this.uploadDocument();
        await this.addSigner();
        await this.activateSignatureRequest();
        alert('Signature request initiated successfully');
      } catch (error) {
        console.error(error);
        alert('An error occurred');
      }
    },
  },
};
</script>

<style scoped>
/* Add your styles here */
</style>