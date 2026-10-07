<script setup lang="ts">
const { user} = useUserSession()
</script>
<template>
  <OnyxAppLayout>
    <template #navBar>
      <OnyxNavBar
          appName="Verhexcel"
          mobile
      >

        <OnyxNavItem link="/times" label="Times" />
        <OnyxNavItem link="/export" label="Export" />
        <template #globalContextArea>
          <div class="mx-4">
            {{user?.name}}
          </div>
        </template>
      </OnyxNavBar>
    </template>
      <NuxtPage />
  </OnyxAppLayout>
</template>
