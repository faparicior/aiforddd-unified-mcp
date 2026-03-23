import { describe, it, expect } from 'vitest'
import { WOW_TYPES } from '../../../src/create-wow-docs-cli.ts'

describe('WOW_TYPES map', () => {
  const EXPECTED_TYPES = [
    'controller',
    'event-consumer',
    'scheduler',
    'repository',
    'event-producer',
    'api-client',
    'use-case',
    'value-object',
  ]

  it('should expose exactly 8 valid types', () => {
    expect(Object.keys(WOW_TYPES)).toHaveLength(8)
  })

  it.each(EXPECTED_TYPES)('should contain type "%s"', (type) => {
    expect(WOW_TYPES).toHaveProperty(type)
  })

  it.each(EXPECTED_TYPES)('type "%s" should map to a non-empty prompt name', (type) => {
    expect(WOW_TYPES[type].prompt).toBeTruthy()
    expect(typeof WOW_TYPES[type].prompt).toBe('string')
  })

  it.each(EXPECTED_TYPES)('type "%s" should map to a non-empty outputFile', (type) => {
    expect(WOW_TYPES[type].outputFile).toBeTruthy()
    expect(typeof WOW_TYPES[type].outputFile).toBe('string')
  })

  it.each([
    ['controller',     'create-controller-wow',     'ddd-controller-wow.md'],
    ['event-consumer', 'create-event-consumer-wow',  'ddd-event-consumer-wow.md'],
    ['scheduler',      'create-scheduler-wow',       'ddd-scheduler-wow.md'],
    ['repository',     'create-repository-wow',      'ddd-repository-wow.md'],
    ['event-producer', 'create-event-producer-wow',  'ddd-event-producer-wow.md'],
    ['api-client',     'create-api-client-wow',      'ddd-api-client-wow.md'],
    ['use-case',       'create-use-case-wow',         'ddd-use-case-wow.md'],
    ['value-object',   'create-value-object-wow',    'ddd-value-object-wow.md'],
  ])('type "%s" maps to prompt "%s" and outputFile "%s"', (type, expectedPrompt, expectedOutput) => {
    expect(WOW_TYPES[type].prompt).toBe(expectedPrompt)
    expect(WOW_TYPES[type].outputFile).toBe(expectedOutput)
  })

  it('should return undefined for an unknown type', () => {
    expect(WOW_TYPES['unknown-type']).toBeUndefined()
    expect(WOW_TYPES['cli']).toBeUndefined()
    expect(WOW_TYPES['service']).toBeUndefined()
  })

  it('all prompt names should follow the pattern create-<name>-wow', () => {
    for (const { prompt } of Object.values(WOW_TYPES)) {
      expect(prompt).toMatch(/^create-.+-wow$/)
    }
  })

  it('all output files should follow the pattern ddd-<name>-wow.md', () => {
    for (const { outputFile } of Object.values(WOW_TYPES)) {
      expect(outputFile).toMatch(/^ddd-.+-wow\.md$/)
    }
  })
})
