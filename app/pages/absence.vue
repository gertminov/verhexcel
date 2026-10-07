<script lang="ts" setup>
import type {DateRange, DateValue} from "sit-onyx";
import {absenceTypes} from "~~/server/db/schema";
import type {AbsencesQuery, SaveAbsencesBody} from "~/shared/types/absence.ts";
import {toISODate} from "~~/utils/date.ts";

definePageMeta({
  middleware: ["auth"],
});

const viewMonth = useState<DateValue>(() => new Date());
const query = computed<AbsencesQuery>(() => {
  const d = new Date(viewMonth.value);
  return {
    from: toISODate(new Date(d.getFullYear(), d.getMonth(), 1)),
    to: toISODate(new Date(d.getFullYear(), d.getMonth() + 1, 0)),
  };
});
const savedAbsences = await useFetch("/api/absences", {query});
const absenceByDate = computed(
  () => new Map(savedAbsences.data.value?.map((a) => [a.date, a.type])),
);

const selectedRange = useState<DateRange>(() => ({start: new Date(), end: new Date()}));
const type = ref<SaveAbsencesBody["type"]>(null);
const typeLabels: Record<(typeof absenceTypes)[number], string> = {
  U: "Urlaub",
  UH: "Urlaub ½ Tag",
  K: "Krank",
  KR: "Krank Restzeit",
  G: "Gleittag",
};
const typeOptions = absenceTypes.map((t) => ({value: t, label: `${t} – ${typeLabels[t]}`}));

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
  await savedAbsences.refresh();
  selectedRange.value = {start: new Date(), end: new Date()};
  type.value = null
}
</script>

<template>
  <OnyxPageLayout no-padding class="px-4 md:px-8 py-4">
    <div>
      <div>
        <OnyxCalendar
            v-model="selectedRange"
            v-model:view-month="viewMonth"
            small
            selectionMode="range"
            class="w-full max-w-xl"
        >
          <template #day="{ date }">
            <div class="w-full flex justify-center items-center relative">
              <span class="h-1 -top-1 absolute text-gray-400 text-xs">
                {{ absenceByDate.get(toISODate(date)) }}
              </span>
            </div>
          </template>
        </OnyxCalendar>
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
