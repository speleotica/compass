import { describe, it } from 'mocha'
import { expect } from 'chai'
import {
  formatCompassMakFile,
  parseCompassMakFile,
  CompassMakFile,
} from './CompassMakFile'
import { Unitize } from '@speleotica/unitized'
import { LrudAssociation } from './CompassFileParametersDirective'
import * as directives from './directives'
import { SegmentParser, Segment } from 'parse-segment'

describe('formatCompassMakFile', function () {
  it('works', function () {
    expect(
      formatCompassMakFile({
        directives: [
          directives.baseLocation(
            Unitize.feet(100),
            Unitize.meters(200),
            Unitize.meters(300),
            13,
            Unitize.gradians(50)
          ),
          directives.datum('WGS 1984'),
          directives.utmConvergenceAngle(Unitize.degrees(2)),
          directives.utmZone(14),
          directives.fileParameters(true, LrudAssociation.FromStation),
          directives.fileParameters(false, LrudAssociation.ToStation),
          directives.datFile('Foo.dat'),
          directives.datFile('Bar.dat', [{ station: 'A1' }]),
          directives.datFile('Baz.dat', [
            { station: 'A1' },
            {
              station: 'A2',
              location: {
                easting: Unitize.feet(23),
                northing: Unitize.feet(83),
                elevation: Unitize.feet(2),
              },
            },
            {
              station: 'A3',
              location: {
                easting: Unitize.meters(23),
                northing: Unitize.feet(83),
                elevation: Unitize.feet(2),
              },
            },
          ]),
        ],
      })
    ).to.equal(
      [
        '@30.480,200.000,300.000,13,45.000;',
        '&WGS 1984;',
        '%2.000;',
        '$14;',
        '!Ot;',
        '!oT;',
        '#Foo.dat;',
        '#Bar.dat,A1;',
        '#Baz.dat,',
        '  A1,',
        '  A2[F,23.000,83.000,2.000],',
        '  A3[M,23.000,25.298,0.610];',
      ].join('\r\n') + '\r\n'
    )
  })
})

describe('parseCompassMakFile', () => {
  const parse = (data: string): CompassMakFile =>
    parseCompassMakFile(
      new SegmentParser(new Segment({ value: data, source: 'test.mak' }))
    )
  it('errors on invalid directive', () => {
    const data = `
    @500000.000,4000000.000,200.000,16,0.000;
    &WGS 1984;

    ^ blah blah blah
    `
    expect(() => parse(data)).to.throw('invalid directive')
  })
  it('works', () => {
    const data = `
    @500000.000,4000000.000,200.000,16,0.000;
    &WGS 1984;

    / blah blah blah

    !OT;
    #Fisher Ridge Cave System.dat,
      AE20[M,0.000,0.000,0.000],
      Qe2[M,-3000,2600,-57];
    `
    expect(parse(data)).to.deep.equal({
      directives: [
        directives.baseLocation(
          Unitize.meters(500000),
          Unitize.meters(4000000),
          Unitize.meters(200),
          16,
          Unitize.degrees(0)
        ),
        directives.datum('WGS 1984'),
        directives.comment(' blah blah blah'),
        directives.fileParameters(true, LrudAssociation.ToStation),
        directives.datFile('Fisher Ridge Cave System.dat', [
          {
            station: 'AE20',
            location: {
              easting: Unitize.meters(0),
              northing: Unitize.meters(0),
              elevation: Unitize.meters(0),
            },
          },
          {
            station: 'Qe2',
            location: {
              easting: Unitize.meters(-3000),
              northing: Unitize.meters(2600),
              elevation: Unitize.meters(-57),
            },
          },
        ]),
      ],
    })
  })
})
