<script lang="ts" setup>

import type {InsertTimeEntry, TimeEntry, TimesQuery} from "~/shared/types/time-entry.ts";
import type {TimeRange} from "sit-onyx";

const userId = 7
const savedTimes = await useFetch('/api/times', {
  query: {
    from: "2026-09-01",
    to: "2026-10-31",
    userId
  } satisfies TimesQuery
})


const selectedDate = useState<Date>(() => new Date())

function toISOString(date: Date) {
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`
}

const emptyTimeEntry: InsertTimeEntry = {start: '', end: '', userId: userId, date: toISOString(selectedDate.value)}

const serverTimes: TimeEntry[] = savedTimes.data.value ?? []


const times = useState<InsertTimeEntry[]>(() => getTimesForDay(selectedDate.value))


function getTimesForDay(date: Date) {
 return  [...getForDay(date, serverTimes), emptyTimeEntry]
}

function handleDateChange(date: Date) {
  times.value = getTimesForDay(date)
}

function getHoursForDay(date: Date) {
  const entry = getForDay(date, serverTimes)
      .map(t => parseHours(t.start, t.end))
      .reduce(sumHours, 0)
  return entry > 0 ? entry : undefined
}

function getForDay(date: Date, timesList: InsertTimeEntry[]) {
  const dateString = toISOString(date)
  return timesList.filter(t => t.date == dateString)
}

function handleEndChange(idx: number, value?: string | TimeRange,) {
  if (value && idx == times.value.length - 1)
    times.value.push({...emptyTimeEntry})
}

function parseHours(from: string, to: string) {
  const h = parseFloat(to) - parseFloat(from)
  return Number.isNaN(h) ? 0 : h
}

function sumHours(acc: number, hours: number) {
  return acc + hours
}

type SimpleTimeEntry = { start: string, end: string }

function breaks(entries: SimpleTimeEntry[]) {
  const result: number[] = []
  for (let i = 1; i < entries.length; i++) {
    const previous = entries[i - 1]!
    const current = entries[i]!
    result.push(parseHours(previous.end, current.start))
  }
  return result
}

const workingTime = computed(() => times.value.map(t => parseHours(t.start, t.end)).reduce(sumHours, 0))
const breakTime = computed(() => breaks(times.value).reduce(sumHours, 0))
</script>

<template>

  <OnyxPageLayout no-padding class="px-4 md:px-8 py-4">
    <div>
      <OnyxCalendar v-model="selectedDate" @update:modelValue="handleDateChange" size="small" selectionMode="single" style="max-width: 500px;">
        <template #day="{ date, size }">
          <div class="w-full flex justify-center items-center">
            <span class="h-4">
          {{ getHoursForDay(date) }}
            </span>
          </div>
        </template>
      </OnyxCalendar>
    </div>
    <div class="pt-4 grow">
      <div class="flex gap-4 justify-between">
        <span>
        Time: {{ workingTime }}
        </span>
        <span>
        Break: {{ breakTime }}
        </span>
      </div>
      <div class="flex flex-col gap-2">
        <template v-for="(time, index) in times" :key="time.start + time.end">
          <div class="flex gap-4">
            <OnyxUnstableTimePicker v-model="time.start" label="start" class="flex-1"/>
            <OnyxUnstableTimePicker v-model="time.end" label="end" class="flex-1"
                                    @update:modelValue="(e) => handleEndChange( index, e)"/>
          </div>
        </template>
      </div>
    </div>
    <template #footer>
      <div class="">
        <OnyxButton label="Save" class="w-full">Save</OnyxButton>
      </div>
    </template>
  </OnyxPageLayout>

</template>

