<script lang="ts" setup>

import type {DateRange} from "sit-onyx";
import {inspect} from "~~/utils/inspect.ts";

const selectedRange = useState<DateRange>(() => ({start: new Date(), end: new Date()}));
inspect(selectedRange)
</script>

<template>
  <OnyxPageLayout>
    <div>
      <div>
        <OnyxCalendar
            v-model="selectedRange"
            small
            selectionMode="range"
            class="w-full max-w-xl"
        />
      </div>
      <div>
        <OnyxSelect label="Absence type"/>
      </div>
    </div>
    <template #footer>
      <OnyxButton label="Save"></OnyxButton>
    </template>
  </OnyxPageLayout>
</template>

