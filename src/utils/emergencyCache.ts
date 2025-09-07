import { ref, computed } from 'vue'

class EmergencyComputedCache {
  private cache = ref(new Map())
  private computing = ref(new Set())

  // Cache com timeout para evitar travamento
  createTimeoutComputed<T>(
    name: string,
    computeFn: () => T,
    timeoutMs = 100
  ) {
    return computed(() => {
      // Se já tem no cache, retorna imediatamente
      if (this.cache.value.has(name)) {
        console.log(`⚡ Cache hit: ${name}`)
        return this.cache.value.get(name)
      }

      // Se já está computando, retorna valor padrão
      if (this.computing.value.has(name)) {
        console.log(`⏳ Already computing: ${name}`)
        return this.getDefaultValue(name)
      }

      // Inicia computação com timeout
      this.computeWithTimeout(name, computeFn, timeoutMs)
      return this.getDefaultValue(name)
    })
  }

  private async computeWithTimeout<T>(
    name: string,
    computeFn: () => T,
    timeoutMs: number
  ) {
    this.computing.value.add(name)

    try {
      // Promise race entre computação e timeout
      const result = await Promise.race([
        new Promise<T>(resolve => {
          console.time(`⚡ Emergency compute: ${name}`)
          const result = computeFn()
          console.timeEnd(`⚡ Emergency compute: ${name}`)
          resolve(result)
        }),
        new Promise<T>((_, reject) => {
          setTimeout(() => reject(new Error(`Timeout: ${name}`)), timeoutMs)
        })
      ])

      this.cache.value.set(name, result)
      console.log(`✅ Cached successfully: ${name}`)

    } catch (error) {
      console.warn(`⚠️ ${name} timed out or failed:`, error)
      // Em caso de timeout, usar valor padrão
      this.cache.value.set(name, this.getDefaultValue(name))
    } finally {
      this.computing.value.delete(name)
    }
  }

  private getDefaultValue(name: string) {
    // Valores padrão para evitar quebrar a UI
    const defaults = {
      'Prescription': [],
      'Current Indent': { level: 0, indent: '' },
      'Patient Visit': [],
      'LastPatientVisitDetails': null,
      'Last Start Episode': null
    }

    return defaults[name] || null
  }

  // Força invalidação do cache
  invalidate(name: string) {
    this.cache.value.delete(name)
    console.log(`🗑️ Cache invalidated: ${name}`)
  }

  // Pré-carrega dados em background
  async preload(name: string, computeFn: () => any) {
    if (!this.cache.value.has(name) && !this.computing.value.has(name)) {
      console.log(`🔄 Preloading: ${name}`)
      await this.computeWithTimeout(name, computeFn, 1000)
    }
  }
}

export const emergencyCache = new EmergencyComputedCache()
