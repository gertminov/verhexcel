<script setup lang="ts">
defineProps<{ title: string; error?: string }>();
defineEmits<{ submit: [] }>();
</script>
<template>
  <div class="min-h-screen flex flex-col justify-center px-4">
    <div class="w-full max-w-md mx-auto">
      <h2 class="py-4">{{ title }}</h2>
      <OnyxForm class="flex flex-col gap-4" @submit.prevent="$emit('submit')">
        <slot />
        <OnyxButton class="w-full mt-4" :label="title" type="submit" />
      </OnyxForm>
      <div class="h-4">{{ error }}</div>
      <slot name="footer" />
    </div>
  </div>
</template>
