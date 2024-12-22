export interface ScriptOptions {
  async?: boolean
  defer?: boolean
  id?: string
  retries?: number
  retryDelay?: number
  cleanup?: boolean
  attributes?: Record<string, string>
}

type LoadState = 'loading' | 'loaded' | 'error'

class ScriptLoader {
  private loadedScripts = new Map<
    string,
    {
      script: HTMLScriptElement
      status: LoadState
      promise?: Promise<void>
    }
  >()

  private createScript = ({
    src,
    async = true,
    defer = false,
    attributes = {},
  }: {
    src: string
    async?: boolean
    defer?: boolean
    attributes?: Record<string, string>
  }): HTMLScriptElement => {
    const script = document.createElement('script')
    script.src = src
    script.async = async
    script.defer = defer

    Object.entries(attributes).forEach(([key, value]) => {
      script.setAttribute(key, value)
    })

    return script
  }

  async loadScript(
    src: string,
    {
      async = true,
      defer = false,
      id,
      retries = 3,
      retryDelay = 1000,
      cleanup = false,
      attributes = {},
    }: ScriptOptions = {},
  ): Promise<void> {
    const scriptId = id || src
    const existing = this.loadedScripts.get(scriptId)

    // Return existing load promise or result if script is already loading/loaded
    if (existing) {
      if (existing.status === 'loaded') return
      if (existing.promise) return existing.promise
      if (existing.status === 'error') {
        existing.script.remove()
        this.loadedScripts.delete(scriptId)
      }
    }

    let retryCount = 0
    let script = this.createScript({ src, async, defer, attributes })

    const load = async (): Promise<void> => {
      return new Promise((resolve, reject) => {
        const handleLoad = () => {
          if (cleanup) {
            script.removeEventListener('load', handleLoad)
            script.removeEventListener('error', handleError)
          }
          resolve()
        }

        const handleError = () => {
          if (cleanup) {
            script.removeEventListener('load', handleLoad)
            script.removeEventListener('error', handleError)
          }

          if (retryCount < retries) {
            retryCount++
            script.remove()
            script = this.createScript({ src, async, defer, attributes })

            setTimeout(() => {
              try {
                document.head.appendChild(script)
              } catch (error) {
                reject(
                  new Error(`Failed to retry script load: ${src}`, {
                    cause: error,
                  }),
                )
              }
            }, retryDelay)

            return
          }

          script.remove()
          this.loadedScripts.delete(scriptId)
          reject(
            new Error(`Failed to load script after ${retries} retries: ${src}`),
          )
        }

        script.addEventListener('load', handleLoad)
        script.addEventListener('error', handleError)

        try {
          document.head.appendChild(script)
        } catch (error) {
          reject(
            new Error(`Failed to append script to document: ${src}`, {
              cause: error,
            }),
          )
        }
      })
    }

    const promise = load()
    this.loadedScripts.set(scriptId, { script, status: 'loading', promise })

    try {
      await promise
      this.loadedScripts.set(scriptId, { script, status: 'loaded' })
    } catch (error) {
      this.loadedScripts.delete(scriptId)
      throw error
    }
  }

  removeScript = (id: string): void => {
    const loadState = this.loadedScripts.get(id)
    if (loadState) {
      loadState.script.remove()
      this.loadedScripts.delete(id)
    }
  }

  isScriptLoaded = (id: string): boolean => {
    return this.loadedScripts.get(id)?.status === 'loaded'
  }
}

export const scriptLoader = new ScriptLoader()
