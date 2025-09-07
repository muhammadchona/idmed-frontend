import { computed } from 'vue'

export function timedComputed(name, computeFn) {
  return computed(() => {
    const start = performance.now()

    const result = computeFn()

    const end = performance.now()
    const duration = end - start

    // Log apenas se demorar mais que threshold
    if (duration > 5) { // 5ms threshold
      console.warn(`⚠️  Computed "${name}" demorou ${duration.toFixed(2)}ms`)
    }

    return result
  })
}

// Versão mais detalhada
export function profiledComputed(name, computeFn, options = {}) {
  const {
    threshold = 5,
    logAlways = false,
    trackMemory = false
  } = options

  let executionCount = 0
  let totalTime = 0
  let maxTime = 0

  return computed(() => {
    const start = performance.now()
    const memoryBefore = trackMemory && performance.memory
      ? performance.memory.usedJSHeapSize
      : 0

    const result = computeFn()

    const end = performance.now()
    const duration = end - start
    const memoryAfter = trackMemory && performance.memory
      ? performance.memory.usedJSHeapSize
      : 0

    executionCount++
    totalTime += duration
    maxTime = Math.max(maxTime, duration)

    if (duration > threshold || logAlways) {
      console.group(`📊 Computed "${name}" Performance`)
      console.log(`Duration: ${duration.toFixed(2)}ms`)
      console.log(`Executions: ${executionCount}`)
      console.log(`Average: ${(totalTime / executionCount).toFixed(2)}ms`)
      console.log(`Max: ${maxTime.toFixed(2)}ms`)

      if (trackMemory && memoryAfter > memoryBefore) {
        console.log(`Memory: +${((memoryAfter - memoryBefore) / 1024 / 1024).toFixed(2)}MB`)
      }

      console.groupEnd()
    }

    return result
  })
}
