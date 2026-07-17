import { lookupVin } from './vin-lookup'

describe('vin-lookup', () => {
  describe('lookupVin', () => {
    it('returns Toyota for JTE prefix', () => {
      const result = lookupVin('JTEAAAAAAB1234567')
      expect(result.brand).toBe('Toyota')
      expect(result.hint).toBeNull()
    })

    it('returns Nissan for JN prefix', () => {
      const result = lookupVin('JNAAAAAAAB1234567')
      expect(result.brand).toBe('Nissan')
      expect(result.hint).toBeNull()
    })

    it('returns Lexus for JTJ prefix', () => {
      const result = lookupVin('JTJAAAAAAB1234567')
      expect(result.brand).toBe('Lexus')
      expect(result.hint).toBeNull()
    })

    it('returns Honda for JHM prefix', () => {
      const result = lookupVin('JHMAAAAAAB1234567')
      expect(result.brand).toBe('Honda')
      expect(result.hint).toBeNull()
    })

    it('returns Subaru for JF1 prefix', () => {
      const result = lookupVin('JF1AAAAAAB1234567')
      expect(result.brand).toBe('Subaru')
      expect(result.hint).toBeNull()
    })

    it('returns Hyundai for KMH prefix', () => {
      const result = lookupVin('KMHAAAAAAB1234567')
      expect(result.brand).toBe('Hyundai')
      expect(result.hint).toBeNull()
    })

    it('returns Kia for KNA prefix', () => {
      const result = lookupVin('KNAAAAAAAB1234567')
      expect(result.brand).toBe('Kia')
      expect(result.hint).toBeNull()
    })

    it('returns hint for ambiguous WMI', () => {
      const result = lookupVin('JN0XXXXXXB1234567')
      expect(result.brand).toBe('Nissan')
      expect(result.hint).toContain('Nissan')
      expect(result.hint).toContain('Infiniti')
    })

    it('returns hint for JT toyota/lexus ambiguous', () => {
      const result = lookupVin('JTAAAAAAB1234567')
      expect(result.brand).toBe('Toyota')
      expect(result.hint).toContain('Lexus')
    })

    it('returns null for unknown VIN', () => {
      const result = lookupVin('ZZZZZZZZZZZZZZZZZ')
      expect(result.brand).toBeNull()
      expect(result.hint).toBe('Не удалось определить производителя по VIN')
    })

    it('returns hint for too short VIN', () => {
      const result = lookupVin('AB')
      expect(result.brand).toBeNull()
      expect(result.hint).toContain('минимум 3 символа')
    })

    it('handles empty string', () => {
      const result = lookupVin('')
      expect(result.brand).toBeNull()
    })

    it('is case insensitive', () => {
      const result = lookupVin('jteaaaaaab1234567')
      expect(result.brand).toBe('Toyota')
    })
  })
})
