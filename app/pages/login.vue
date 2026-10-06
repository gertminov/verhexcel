<script setup lang="ts">
const { fetch } = useUserSession()
const register = ref(false)
const form = reactive({ name: '', email: '', password: '' })
const error = ref('')

async function submit() {
  error.value = ''
  try {
    await $fetch(register.value ? '/api/register' : '/api/login', { method: 'POST', body: form })
    await fetch()
    await navigateTo('/times')
  } catch (e: any) {
    error.value = e.data?.message ?? 'Failed'
  }
}
</script>
<template>
  <OnyxPageLayout>
    <OnyxForm>
      
    </OnyxForm>
  </OnyxPageLayout>
  <form class="mx-auto flex max-w-xs flex-col gap-2 p-4" @submit.prevent="submit">
    <input v-if="register" v-model="form.name" placeholder="Name" required>
    <input v-model="form.email" type="email" placeholder="Email" required>
    <input v-model="form.password" type="password" placeholder="Password" required>
    <button type="submit">{{ register ? 'Register' : 'Log in' }}</button>
    <button type="button" @click="register = !register">{{ register ? 'Have an account?' : 'Need an account?' }}</button>
    <p v-if="error">{{ error }}</p>
  </form>
</template>
