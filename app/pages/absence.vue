<script lang="ts" setup>
import type {DateRange} from "sit-onyx";
import {absenceTypes} from "~~/server/db/schema";
import type {SaveAbsencesBody} from "~/shared/types/absence.ts";
import {toISODate} from "~~/utils/date.ts";

const selectedRange = useState<DateRange>(() => ({start: new Date(), end: new Date()}));
const type = ref<SaveAbsencesBody["type"]>(null);
const typeOptions = absenceTypes.map((t) => ({value: t, label: t}));

async function save() {
  const {start, end = start} = selectedRange.value;
  await $fetch("/api/absences", {
    method: "PUT",
    body: {
      from: toISODate(new Date(start)),
      to: toISODate(new Date(end)),
      type: type.value,
    } satisfies SaveAbsencesBody,
  });
}
</script>

<template>
  <OnyxPageLayout no-padding class="px-4 md:px-8 py-4">
    <div>
      <div>
        <OnyxCalendar
            v-model="selectedRange"
            small
            selectionMode="range"
            class="w-full max-w-xl"
        />
      </div>
      <div class="mt-4">
        <OnyxSelect
            v-model="type"
            label="Absence type"
            list-label="Absence types"
            :options="typeOptions"
        />
      </div>
    </div>
    <template #footer>
      <div class="px-8">
        <OnyxButton label="Save" @click="save" class="w-full max-w-xl"/>
      </div>
    </template>
  </OnyxPageLayout>
</template>
