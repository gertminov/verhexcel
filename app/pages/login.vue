<script setup lang="ts">
const { fetch } = useUserSession();
const form = reactive({ email: "", password: "" });
const error = useState(() => "");

async function submit() {
  error.value = "";
  try {
    await $fetch("/api/login", { method: "POST", body: form });
    await fetch();
    await navigateTo("/times");
  } catch (e: any) {
    error.value = e.data?.message ?? "Failed";
  }
}
</script>
<template>
  <AuthForm title="Login" :error="error" @submit="submit">
    <OnyxInput v-model="form.email" label="Email" type="email" />
    <OnyxInput v-model="form.password" label="Password" type="password" />
    <template #footer>
      <div class="mt-4">
        Not registered yet?
        <NuxtLink to="/register" class="text-sm mt-4">Register</NuxtLink>
      </div>
    </template>
  </AuthForm>
</template>
