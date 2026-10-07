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
  <div class="min-h-screen flex flex-col justify-center px-4">
    <h2 class="py-4">Login</h2>
    <OnyxForm class="flex flex-col gap-4" @submit.prevent="submit">
      <OnyxInput v-model="form.email" label="Email" type="email" />
      <OnyxInput v-model="form.password" label="Password" type="password" />
      <OnyxButton class="w-full mt-4" label="Login" type="submit"
        >Login</OnyxButton
      >
    </OnyxForm>
    <div class="h-4">
      {{ error }}
    </div>
    <div class="mt-4">
      Not registered yet?
      <NuxtLink to="/register" class="text-sm mt-4">Register</NuxtLink>
    </div>
  </div>
</template>
