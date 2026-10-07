<script setup lang="ts">
const { user, loggedIn } = useUserSession();
</script>
<template>
  <OnyxAppLayout>
    <template #navBar>
      <OnyxNavBar app-name="Verhexcel">
        <template v-if="loggedIn" >
          <OnyxNavItem link="/times" label="Times" />
          <OnyxNavItem link="/absence" label="Absence" />
          <OnyxNavItem link="/export" label="Export" />
        </template>
        <template #globalContextArea>
          <div class="mx-4">
            {{ user?.name }}
          </div>
        </template>
      </OnyxNavBar>
    </template>
    <NuxtPage />
  </OnyxAppLayout>
</template>
