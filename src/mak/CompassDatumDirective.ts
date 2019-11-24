import { CompassMakDirectiveType } from './CompassMakDirective'

export type CompassDatumDirective = {
  type: CompassMakDirectiveType.Datum
  datum: string
}

export function formatCompassDatumDirective({
  type,
  datum,
}: CompassDatumDirective): string {
  return `${type}${datum};\r\n`
}
