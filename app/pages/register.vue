<script setup lang="ts">
const { fetch } = useUserSession();
const form = reactive({ name: "", email: "", password: "", invite: "" });
const error = ref("");

async function submit() {
  error.value = "";
  try {
    await $fetch("/api/register", { method: "POST", body: form });
    await fetch();
    await navigateTo("/times");
  } catch (e: any) {
    error.value = e.data?.message ?? "Failed";
  }
}
</script>
<template>
  <div class="min-h-screen flex flex-col justify-center px-4">
    <h2 class="py-4">Register</h2>
    <OnyxForm class="flex flex-col gap-4" @submit.prevent="submit">
      <OnyxInput v-model="form.name" label="Name" />
      <OnyxInput v-model="form.email" label="Email" type="email" />
      <OnyxInput v-model="form.password" label="Password" type="password" />
      <OnyxInput v-model="form.invite" label="Invite code" />
      <OnyxButton label="Register" type="submit">Register</OnyxButton>
    </OnyxForm>
  </div>
</template>
