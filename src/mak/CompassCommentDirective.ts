import { CompassMakDirectiveType } from './CompassMakDirective'
import { SegmentParser } from 'parse-segment'

export type CompassCommentDirective = {
  type: CompassMakDirectiveType.Comment
  comment: string
}

export function formatCompassCommentDirective({
  type,
  comment,
}: CompassCommentDirective): string {
  return `${type}${comment};\r\n`
}

export function parseCompassCommentDirective(
  parser: SegmentParser
): CompassCommentDirective {
  parser.expect(CompassMakDirectiveType.Comment)
  return {
    type: CompassMakDirectiveType.Comment,
    comment: parser.nextDelimited(/$/m).toString(),
  }
}
