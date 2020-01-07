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
import {
  CompassCommentDirective,
  formatCompassCommentDirective,
  parseCompassCommentDirective,
} from './CompassCommentDirective'

export enum CompassMakDirectiveType {
  BaseLocation = '@',
  DatFile = '#',
  Datum = '&',
  UtmConvergenceAngle = '%',
  UtmZone = '$',
  FileParameters = '!',
  Comment = '/',
}

export type CompassMakDirective =
  | CompassBaseLocationDirective
  | CompassDatFileDirective
  | CompassDatumDirective
  | CompassFileParametersDirective
  | CompassUtmConvergenceAngleDirective
  | CompassUtmZoneDirective
  | CompassCommentDirective

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
    case CompassMakDirectiveType.Comment:
      return formatCompassCommentDirective(directive)
  }
}

export function parseCompassMakDirective(
  parser: SegmentParser
): CompassMakDirective {
  parser.skip(/\s*/gm)
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
    case CompassMakDirectiveType.Comment:
      return parseCompassCommentDirective(parser)
    default:
      throw new SegmentParseError(
        'invalid directive character',
        parser.segment.charAt(parser.index)
      )
  }
}
