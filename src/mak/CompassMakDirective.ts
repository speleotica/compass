import {
  CompassBaseLocationDirective,
  formatCompassBaseLocationDirective,
} from './CompassBaseLocationDirective'
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
} from './CompassUtmConvergenceAngleDirective'
import {
  CompassUtmZoneDirective,
  formatCompassUtmZoneDirective,
} from './CompassUtmZoneDirective'
import { SegmentParser, SegmentParseError } from 'parse-segment'
import { parseCompassBaseLocationDirective } from './CompassBaseLocationDirective'
import { parseCompassDatFileDirective } from './CompassDatFileDirective'
import { parseCompassFileParametersDirective } from './CompassFileParametersDirective'
import { parseCompassDatumDirective } from './CompassDatumDirective'
import { parseCompassUtmConvergenceAngleDirective } from './CompassUtmConvergenceAngleDirective'
import { parseCompassUtmZoneDirective } from './CompassUtmZoneDirective'

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

export function parseCompassMakDirective(
  parser: SegmentParser
): CompassMakDirective {
  switch (parser.currentChar()) {
    case CompassMakDirectiveType.BaseLocation:
      return parseCompassBaseLocationDirective(parser)
    case CompassMakDirectiveType.DatFile:
      return parseCompassDatFileDirective(parser)
    case CompassMakDirectiveType.Datum:
      return parseCompassDatumDirective(parser)
    case CompassMakDirectiveType.FileParameters:
      return parseCompassFileParametersDirective(parser)
    case CompassMakDirectiveType.UtmConvergenceAngle:
      return parseCompassUtmConvergenceAngleDirective(parser)
    case CompassMakDirectiveType.UtmZone:
      return parseCompassUtmZoneDirective(parser)
    default:
      throw new SegmentParseError(
        'invalid directive character',
        parser.segment.charAt(parser.index)
      )
  }
}
