import {
  CompassMakDirective,
  formatCompassMakDirective,
  parseCompassMakDirective,
} from './CompassMakDirective'
import { SegmentParser } from 'parse-segment'

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
  if (options?.write) {
    const { write } = options
    directives.forEach((d) => write(formatCompassMakDirective(d)))
    return
  }
  return directives.map(formatCompassMakDirective).join('')
}

export function parseCompassMakFile(parser: SegmentParser): CompassMakFile {
  const directives: CompassMakDirective[] = []
  while (
    (parser.skip(/\s*/), !parser.isAtEnd() && parser.currentChar() !== '\u001a')
  ) {
    directives.push(parseCompassMakDirective(parser))
  }
  return { directives }
}
