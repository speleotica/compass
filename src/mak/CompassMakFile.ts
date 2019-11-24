import {
  CompassMakDirective,
  formatCompassMakDirective,
} from './CompassMakDirective'

export type CompassMakFile = {
  directives: Array<CompassMakDirective>
}

export function formatCompassMakFile({ directives }: CompassMakFile): string {
  return directives.map(formatCompassMakDirective).join('')
}
