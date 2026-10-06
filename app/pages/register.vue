<script setup lang="ts">
const { fetch } = useUserSession()
const form = reactive({ name: '', email: '', password: '' })
const error = ref('')

async function submit() {
  error.value = ''
  try {
    await $fetch( '/api/register', { method: 'POST', body: form })
    await fetch()
    await navigateTo('/times')
  } catch (e: any) {
    error.value = e.data?.message ?? 'Failed'
  }
}
</script>
<template>
  <div class="min-h-screen  flex flex-col justify-center px-4  ">
    <h2 class="py-4">Register</h2>
    <OnyxForm class="flex flex-col gap-4" @submit.prevent="submit">
      <OnyxInput label="Name" v-model="form.name" />
      <OnyxInput label="Email" type="email" v-model="form.email" />
      <OnyxInput label="Password" type="password" v-model="form.password" />
      <OnyxButton label="Register" type="submit">Register</OnyxButton>
    </OnyxForm>
  </div>
</template>
