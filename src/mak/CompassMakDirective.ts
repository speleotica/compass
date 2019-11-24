import {
  CompassBaseLocationDirective,
  formatCompassBaseLocationDirective,
} from './CompassBaseLocationDirecive'
import {
  CompassDatFileDirective,
  formatCompassDatFileDirective,
} from './CompassDatFileDirective'
import {
  CompassDatumDirective,
  formatCompassDatumDirective,
} from './CompassDatumDirective'
import {
  CompassFileParametersDirective,
  formatCompassFileParametersDirective,
} from './CompassFileParametersDirective'
import {
  CompassUtmConvergenceAngleDirective,
  formatCompassUtmConvergenceAngleDirective,
} from './CompassUtmCovergenceAngleDirective'
import {
  CompassUtmZoneDirective,
  formatCompassUtmZoneDirective,
} from './CompassUtmZoneDirective'

export enum CompassMakDirectiveType {
  BaseLocation = '@',
  DatFile = '#',
  Datum = '&',
  UtmConvergenceAngle = '%',
  UtmZone = '$',
  FileParameters = '!',
}

export type CompassMakDirective =
  | CompassBaseLocationDirective
  | CompassDatFileDirective
  | CompassDatumDirective
  | CompassFileParametersDirective
  | CompassUtmConvergenceAngleDirective
  | CompassUtmZoneDirective

export function formatCompassMakDirective(
  directive: CompassMakDirective
): string {
  switch (directive.type) {
    case CompassMakDirectiveType.BaseLocation:
      return formatCompassBaseLocationDirective(directive)
    case CompassMakDirectiveType.DatFile:
      return formatCompassDatFileDirective(directive)
    case CompassMakDirectiveType.Datum:
      return formatCompassDatumDirective(directive)
    case CompassMakDirectiveType.FileParameters:
      return formatCompassFileParametersDirective(directive)
    case CompassMakDirectiveType.UtmConvergenceAngle:
      return formatCompassUtmConvergenceAngleDirective(directive)
    case CompassMakDirectiveType.UtmZone:
      return formatCompassUtmZoneDirective(directive)
  }
}
