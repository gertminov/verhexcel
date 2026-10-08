<script setup lang="ts">
const { user, loggedIn } = useUserSession();
</script>
<template>
  <OnyxAppLayout>
    <template #navBar>
      <OnyxNavBar app-name="Verhexcel" logoUrl="favicon.svg">
        <template v-if="loggedIn" >
          <OnyxNavItem link="/times" label="Zeiten" />
          <OnyxNavItem link="/absence" label="Abwesenheit" />
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
