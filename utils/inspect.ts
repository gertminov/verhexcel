import { watch, type WatchSource } from "vue";

// Logs `source` immediately and on every change (deep). Returns the stop handle.
export function inspect<T>(source: WatchSource<T>, label = "inspect") {
  return watch(
    source,
    (value, old) => console.log(`[${label}]`, old, "->", value),
    { immediate: true, deep: true },
  );
}
