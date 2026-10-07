<script lang="ts" setup>
definePageMeta({
  middleware: ["auth"],
});

const year = ref(new Date().getFullYear());
</script>

<template>
  <div class="m-4 flex items-end justify-center gap-4">
    <OnyxInput v-model="year" label="Jahr" type="number" />
    <OnyxButton
      label="Excel herunterladen"
      @click="navigateTo(`/api/export?year=${year}`, { external: true })"
    />
  </div>
</template>
