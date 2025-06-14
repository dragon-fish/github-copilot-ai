export class CommandsController {
  readonly registry: Map<string, (...args: any[]) => any> = new Map()

  register(name: string, fn: (...args: any[]) => any) {
    if (this.registry.has(name)) {
      console.warn(
        `Command "${name}" is already registered. Overwriting the existing command.`
      )
    }
    this.registry.set(name, fn)
    return this
  }

  execute<T = any>(name: string, ...args: any[]): T | PromiseLike<T> {
    const command = this.registry.get(name)
    if (!command) {
      throw new Error(`Command "${name}" not found.`)
    }
    return command(...args)
  }

  exist(name: string) {
    return this.registry.has(name)
  }

  list() {
    return Array.from(this.registry.keys())
  }
}
