import { exec, spawn, type ChildProcess } from 'node:child_process'
import { promisify } from 'node:util'

const execAsync = promisify(exec)

const colors = {
  blue: (text: string) => `\x1b[34m${text}\x1b[0m`,
  green: (text: string) => `\x1b[32m${text}\x1b[0m`,
  yellow: (text: string) => `\x1b[33m${text}\x1b[0m`,
  red: (text: string) => `\x1b[31m${text}\x1b[0m`,
  cyan: (text: string) => `\x1b[36m${text}\x1b[0m`,
} as const

interface ServiceConfig {
  name: string
  start: string[]
  stop: string[]
  healthCheck?: () => Promise<boolean>
  dependencies?: string[]
  requiredServices?: string[]
  postStartInfo?: () => Promise<void>
}

class ServiceError extends Error {
  constructor(
    message: string,
    public readonly details?: string,
  ) {
    super(message)
    this.name = 'ServiceError'
  }
}

const checkDockerRunning = async (): Promise<boolean> => {
  try {
    await execAsync('docker info')
    return true
  } catch {
    return false
  }
}

const showSupabaseStatus = async (): Promise<void> => {
  try {
    const { stdout } = await execAsync(
      'cd packages/supabase && npx supabase status',
    )
    console.log(colors.cyan('\nSupabase Status:'))
    console.log(stdout)
  } catch {
    console.log(colors.yellow('\nCould not fetch Supabase status'))
  }
}

const services: ServiceConfig[] = [
  {
    name: 'supabase',
    start: [
      'cd',
      'packages/supabase',
      '&&',
      'npx',
      'supabase',
      'start',
      '--ignore-health-check',
    ],
    stop: ['cd', 'packages/supabase', '&&', 'npx', 'supabase', 'stop'],
    healthCheck: async () => {
      try {
        await execAsync('curl http://localhost:54321/rest/v1/ -f', {})
        return true
      } catch {
        return false
      }
    },
    requiredServices: ['docker'],
    postStartInfo: showSupabaseStatus,
  },
  {
    name: 'docker-services',
    start: ['docker', 'compose', 'up', '-d'],
    stop: ['docker', 'compose', 'down'],
    dependencies: ['supabase'],
    requiredServices: ['docker'],
  },
]

class ServiceManager {
  private processes: Map<string, ChildProcess> = new Map()

  private async checkRequirements(service: ServiceConfig): Promise<void> {
    if (!service.requiredServices?.includes('docker')) return

    const isDockerRunning = await checkDockerRunning()
    if (!isDockerRunning) {
      throw new ServiceError(
        'Docker is not running',
        'Docker Desktop is required and must be running.\n' +
          '1. Install Docker Desktop from https://www.docker.com/products/docker-desktop\n' +
          '2. Start Docker Desktop\n' +
          '3. Wait for Docker Desktop to fully start\n' +
          '4. Try again',
      )
    }
  }

  private executeCommand = ({
    command,
    args,
  }: {
    command: string
    args: string[]
  }): Promise<void> => {
    return new Promise((resolve, reject) => {
      const process = spawn(command, args, {
        shell: true,
        stdio: 'inherit',
      })

      this.processes.set(command, process)

      process.on('error', (error) => {
        this.processes.delete(command)
        reject(new ServiceError(`Failed to execute ${command}`, error.message))
      })

      process.on('close', (code) => {
        this.processes.delete(command)
        if (code === 0) {
          resolve()
        } else {
          reject(
            new ServiceError(
              `Command failed: ${command}`,
              `Process exited with code ${code}`,
            ),
          )
        }
      })
    })
  }

  private async startService(service: ServiceConfig): Promise<void> {
    console.log(colors.blue(`Starting ${service.name}...`))

    try {
      await this.checkRequirements(service)

      if (service.dependencies) {
        for (const dep of service.dependencies) {
          const depService = services.find((s) => s.name === dep)
          if (depService) {
            await this.startService(depService)
          }
        }
      }

      if (!service.start.length) {
        throw new ServiceError(`No start command defined for ${service.name}`)
      }

      const [command, ...args] = service.start
      if (!command) {
        throw new ServiceError(`No start command defined for ${service.name}`)
      }
      await this.executeCommand({ command, args })

      if (service.healthCheck) {
        let healthy = false
        let attempts = 0
        const maxAttempts = 30
        while (!healthy && attempts < maxAttempts) {
          healthy = await service.healthCheck()
          if (!healthy) {
            if (attempts === maxAttempts - 1) {
              throw new ServiceError(
                `Health check failed for ${service.name}`,
                `Service did not become healthy after ${maxAttempts} attempts`,
              )
            }
            await new Promise((resolve) => setTimeout(resolve, 1000))
            attempts++
          }
        }
      }

      if (service.postStartInfo) {
        await service.postStartInfo()
      }

      console.log(colors.green(`✓ ${service.name} started`))
    } catch (error) {
      if (error instanceof ServiceError) {
        throw error
      }
      throw new ServiceError(
        `Failed to start ${service.name}`,
        error instanceof Error ? error.message : String(error),
      )
    }
  }

  private async stopService(service: ServiceConfig): Promise<void> {
    console.log(colors.yellow(`Stopping ${service.name}...`))
    try {
      if (!service.stop.length) {
        throw new ServiceError(`No stop command defined for ${service.name}`)
      }

      const [command, ...args] = service.stop
      if (!command) {
        throw new ServiceError(`No stop command defined for ${service.name}`)
      }
      await this.executeCommand({ command, args })
      console.log(colors.green(`✓ ${service.name} stopped`))
    } catch (error) {
      // Continue stopping other services even if one fails
      console.error(
        colors.red(
          `Failed to stop ${service.name}: ${
            error instanceof Error ? error.message : String(error)
          }`,
        ),
      )
    }
  }

  public async startAll(): Promise<void> {
    try {
      for (const service of services) {
        await this.startService(service)
      }
      console.log(colors.green('\n✓ All services started successfully'))
    } catch (error) {
      if (error instanceof ServiceError) {
        console.error(
          colors.red(
            `\n✗ ${error.message}${error.details ? '\n\n' + error.details : ''}`,
          ),
        )
      } else {
        console.error(
          colors.red(
            `\n✗ Unexpected error: ${
              error instanceof Error ? error.message : String(error)
            }`,
          ),
        )
      }
      // Try to stop services that might have started
      await this.stopAll()
      process.exit(1)
    }
  }

  public async stopAll(): Promise<void> {
    let hasError = false
    // Stop in reverse order
    for (const service of [...services].reverse()) {
      try {
        await this.stopService(service)
      } catch (error) {
        hasError = true
        console.error(
          colors.red(
            `Failed to stop ${service.name}: ${
              error instanceof Error ? error.message : String(error)
            }`,
          ),
        )
      }
    }

    if (hasError) {
      console.log(
        colors.yellow('\n⚠ Some services may not have stopped properly'),
      )
    } else {
      console.log(colors.green('\n✓ All services stopped successfully'))
    }
  }
}

export const serviceManager = new ServiceManager()
