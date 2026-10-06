<script lang="ts" setup>

import type {InsertTimeEntry} from "~/shared/types/time-entry.ts";
import type {TimeRange} from "sit-onyx";

const userId = 7
const savedTimes = await useFetch('/api/times', {query: {start: "2026-09-01", end: "2026-10-31", userId}})


const today = new Date().toISOString().slice(0, 10)
const emptyTimeEntry: InsertTimeEntry = {start: '', end: '', userId: userId, date: today}

const defaultValue: InsertTimeEntry[] = savedTimes.data.value && savedTimes.data.value.length > 0 ? savedTimes.data.value : [
  emptyTimeEntry
]

const times = useState<InsertTimeEntry[]>(() => defaultValue)


function getEvent(date: Date) {
  const dateString = date.toISOString().slice(0, 10)
  const entry =  times.value.find(t => t.date == dateString )
}

function handleEndChange( idx: number, value?: string| TimeRange,) {
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
      <OnyxCalendar size="small" selectionMode="single" style="max-width: 500px;">
        <template #day="{ date, size }">
          <div class="w-full flex justify-center items-center">
            <span class="h-4">
          {{ getEvent(date) }}
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
        <template v-for="(time, index) in times" :key="index">
          <div class="flex gap-4">
            <OnyxUnstableTimePicker v-model="time.start" label="start" class="flex-1" />
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

