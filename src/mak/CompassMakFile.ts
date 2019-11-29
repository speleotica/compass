import {
  CompassMakDirective,
  formatCompassMakDirective,
} from './CompassMakDirective'

export type CompassMakFile = {
  directives: Array<CompassMakDirective>
}

export function formatCompassMakFile({ directives }: CompassMakFile): string
export function formatCompassMakFile(
  { directives }: CompassMakFile,
  options: { write: (data: string) => any }
): void
export function formatCompassMakFile(
  { directives }: CompassMakFile,
  options?: { write: (data: string) => any }
): string | void {
  if (options && options.write) {
    const { write } = options
    directives.forEach(d => write(formatCompassMakDirective(d)))
    return
  }
  return directives.map(formatCompassMakDirective).join('')
}
