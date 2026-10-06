<script setup lang="ts">
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
      </OnyxNavBar>
    </template>
      <NuxtPage />
  </OnyxAppLayout>
</template>
