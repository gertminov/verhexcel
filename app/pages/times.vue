<script lang="ts" setup>
import type { TimeEntry, TimesQuery } from "#shared/types/time-entry.ts";
import { type DateValue, type TimeRange, useToast } from "sit-onyx";
import { filterByDay, getNextWorkingDay, toISODate } from "~~/utils/date.ts";
import {
  calcBreaks,
  parseHours,
  type SimpleTimeEntry,
  sumHours,
} from "~~/utils/time.ts";

definePageMeta({
  middleware: ["auth"],
});

const viewMonth = useState<DateValue>(() => new Date());
const selectedDate = useState<Date>(() => new Date());

const query = computed<TimesQuery>(() => {
  const d = new Date(viewMonth.value);
  const year = d.getFullYear();
  const month = d.getMonth();
  return {
    from: toISODate(new Date(year, month, 1)),
    to: toISODate(new Date(year, month + 1, 0)),
  };
});
const savedTimes = await useFetch("/api/times", { query });
const savedAbsences = await useFetch("/api/absences", { query });
const absenceByDate = computed(
  () => new Map(savedAbsences.data.value?.map((a) => [a.date, a.type])),
);
const getAbsence = (date: Date) => absenceByDate.value.get(toISODate(date));
const isAbsent = (date: Date) => {
  const type = getAbsence(date);
  return !!type && type != "UH" && type != "KR";
};

const emptyTimeEntry: () => SimpleTimeEntry = () => ({
  start: "",
  end: "",
  date: toISODate(selectedDate.value),
});

const serverTimes = computed<TimeEntry[]>(() => savedTimes.data.value ?? []);

const times = useState<SimpleTimeEntry[]>(() =>
  getTimesForDay(selectedDate.value, serverTimes.value),
);

const workingTime = computed(() =>
  times.value.map((t) => parseHours(t.start, t.end)).reduce(sumHours, 0),
);
const breakTime = computed(() => calcBreaks(times.value).reduce(sumHours, 0));

function getTimesForDay(date: Date, timesList: SimpleTimeEntry[]) {
  return [...filterByDay(date, timesList), emptyTimeEntry()];
}

function getHoursForDay(date: Date) {
  const entry = filterByDay(date, serverTimes.value)
    .map((t) => parseHours(t.start, t.end))
    .reduce(sumHours, 0);

  return entry > 0 ? entry.toFixed(2) : undefined;
}

function handleEndTimeChange(idx: number, value?: string | TimeRange) {
  if (value && idx == times.value.length - 1)
    times.value.push({ ...emptyTimeEntry() });
}

async function handleSave() {
  let next = getNextWorkingDay(selectedDate.value);
  while (isAbsent(next)) next = getNextWorkingDay(next);
  selectedDate.value = next;
  viewMonth.value = next
}

const toast = useToast();

watch(selectedDate, async (newDate, oldDate) => {
  try {
    await saveDay(oldDate, times.value);
  } catch (e: any) {
    toast.show({
      headline: `Saving ${toISODate(oldDate)} failed`,
      description: e.data?.message ?? e.message,
      color: "danger",
    });
  }
  times.value = getTimesForDay(newDate, serverTimes.value);
});

async function saveDay(date: Date, timeEntries: SimpleTimeEntry[]) {
  await $fetch("/api/times", {
    method: "PUT",
    body: {
      date: toISODate(date),
      entries: timeEntries.filter((t) => t.start && t.end),
    },
  });
  await savedTimes.refresh();
}
</script>

<template>
  <OnyxPageLayout no-padding class="px-4 md:px-8 py-4">
    <div class="flex justify-center">
      <OnyxCalendar
        v-model="selectedDate"
        v-model:view-month="viewMonth"
        size="small"
        selection-mode="single"
        :disabled="isAbsent"
        class="w-full max-w-xl"
      >
        <template #day="{ date }">
          <div class="w-full flex justify-center items-center relative">
            <span class="h-1 -top-1 absolute text-gray-400 text-sm">
              {{ [getAbsence(date), getHoursForDay(date)].filter(Boolean).join(" ") }}
            </span>
          </div>
        </template>
      </OnyxCalendar>
    </div>
    <div class="pt-4 grow max-w-xl mx-auto">
      <div class="flex gap-4 justify-between">
        <span> Time: {{ workingTime.toFixed(2) }} </span>
        <span> Break: {{ breakTime.toFixed(2) }} </span>
      </div>
      <div class="flex flex-col gap-2">
        <template
          v-for="(time, index) in times"
          :key="selectedDate.getTime() + index"
        >
          <div class="flex gap-4">
            <OnyxUnstableTimePicker
              v-model="time.start"
              label="start"
              class="flex-1"
            />
            <OnyxUnstableTimePicker
              v-model="time.end"
              label="end"
              class="flex-1"
              @update:model-value="(e) => handleEndTimeChange(index, e)"
            />
          </div>
        </template>
      </div>
    </div>
    <template #footer>
      <div class="max-w-xl mx-auto">
        <OnyxButton label="Save" class="w-full" @click="handleSave()"
          >Save</OnyxButton
        >
      </div>
    </template>
  </OnyxPageLayout>
</template>
