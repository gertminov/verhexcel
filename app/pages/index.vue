<script lang="ts" setup>
const {loggedIn} = useUserSession();
if (loggedIn.value) {
  await navigateTo("/times");
}
</script>

<template>
  <div class="m-4 grow">
    <h1 class="mx-auto text-center">Welcome to Verhexcel</h1>
    <div class="mt-8 flex justify-center">
      <OnyxButton label="Login" link="/login"/>
    </div>
  </div>
</template>
