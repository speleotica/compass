import { CompassMakDirectiveType } from './CompassMakDirective'

export type CompassUtmZoneDirective = {
  type: CompassMakDirectiveType.UtmZone
  utmZone: number
}

export function formatCompassUtmZoneDirective({
  type,
  utmZone,
}: CompassUtmZoneDirective): string {
  return `${type}${utmZone};\r\n`
}
