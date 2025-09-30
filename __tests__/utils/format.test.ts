import {
  formatPrice,
  formatDate,
  generateSlug,
  truncateText,
} from '../../src/utils/format'

describe('format utilities', () => {
  describe('formatPrice', () => {
    it('should format positive numbers as Brazilian currency', () => {
      expect(formatPrice(99.99)).toBe('R$\u00A099,99')
      expect(formatPrice(1000)).toBe('R$\u00A01.000,00')
      expect(formatPrice(1234.56)).toBe('R$\u00A01.234,56')
    })

    it('should format zero as Brazilian currency', () => {
      expect(formatPrice(0)).toBe('R$\u00A00,00')
    })

    it('should format negative numbers as Brazilian currency', () => {
      expect(formatPrice(-99.99)).toBe('-R$\u00A099,99')
      expect(formatPrice(-1000)).toBe('-R$\u00A01.000,00')
    })

    it('should handle very large numbers', () => {
      expect(formatPrice(1000000)).toBe('R$\u00A01.000.000,00')
      expect(formatPrice(999999999.99)).toBe('R$\u00A0999.999.999,99')
    })

    it('should handle very small decimal numbers', () => {
      expect(formatPrice(0.01)).toBe('R$\u00A00,01')
      expect(formatPrice(0.001)).toBe('R$\u00A00,00')
    })

    it('should handle numbers with many decimal places', () => {
      expect(formatPrice(99.999)).toBe('R$\u00A0100,00')
      expect(formatPrice(99.994)).toBe('R$\u00A099,99')
    })

    it('should handle integer numbers', () => {
      expect(formatPrice(100)).toBe('R$\u00A0100,00')
      expect(formatPrice(1)).toBe('R$\u00A01,00')
    })

    it('should handle edge case numbers', () => {
      expect(formatPrice(Number.MAX_SAFE_INTEGER)).toMatch(/^R\$\u00A0/)
      expect(formatPrice(Number.MIN_SAFE_INTEGER)).toMatch(/^-R\$\u00A0/)
    })
  })

  describe('formatDate', () => {
    it('should format ISO date strings to Brazilian format', () => {
      expect(formatDate('2024-01-15T10:30:00Z')).toBe('15/01/2024')
      expect(formatDate('2024-12-31T23:59:59Z')).toBe('31/12/2024')
      expect(formatDate('2024-02-29T00:00:00Z')).toBe('29/02/2024') // Leap year in UTC
    })

    it('should handle different ISO date formats', () => {
      expect(formatDate('2024-01-15')).toBe('15/01/2024') // Date without time uses UTC
      expect(formatDate('2024-01-15T10:30:00')).toBe('15/01/2024')
      expect(formatDate('2024-01-15T10:30:00.000Z')).toBe('15/01/2024')
    })

    it('should handle dates from different years', () => {
      expect(formatDate('2020-06-15T12:00:00Z')).toBe('15/06/2020')
      expect(formatDate('2030-11-25T18:45:30Z')).toBe('25/11/2030')
    })

    it('should handle edge dates', () => {
      expect(formatDate('2024-01-01T00:00:00Z')).toBe('01/01/2024') // UTC midnight stays the same in UTC
      expect(formatDate('2024-12-31T23:59:59Z')).toBe('31/12/2024')
    })

    it('should handle dates with different timezones', () => {
      expect(formatDate('2024-01-15T10:30:00+03:00')).toBe('15/01/2024')
      expect(formatDate('2024-01-15T10:30:00-05:00')).toBe('15/01/2024')
    })

    it('should handle invalid date strings gracefully', () => {
      expect(() => formatDate('invalid-date')).toThrow()
      expect(() => formatDate('')).toThrow()
    })

    it('should handle dates in different months', () => {
      const months = [
        '2024-01-15T12:00:00Z',
        '2024-02-15T12:00:00Z',
        '2024-03-15T12:00:00Z',
        '2024-04-15T12:00:00Z',
        '2024-05-15T12:00:00Z',
        '2024-06-15T12:00:00Z',
        '2024-07-15T12:00:00Z',
        '2024-08-15T12:00:00Z',
        '2024-09-15T12:00:00Z',
        '2024-10-15T12:00:00Z',
        '2024-11-15T12:00:00Z',
        '2024-12-15T12:00:00Z',
      ]
      const expected = [
        '15/01/2024',
        '15/02/2024',
        '15/03/2024',
        '15/04/2024',
        '15/05/2024',
        '15/06/2024',
        '15/07/2024',
        '15/08/2024',
        '15/09/2024',
        '15/10/2024',
        '15/11/2024',
        '15/12/2024',
      ]

      months.forEach((date, index) => {
        expect(formatDate(date)).toBe(expected[index])
      })
    })
  })

  describe('generateSlug', () => {
    it('should convert text to lowercase slug', () => {
      expect(generateSlug('Hello World')).toBe('hello-world')
      expect(generateSlug('UPPERCASE TEXT')).toBe('uppercase-text')
    })

    it('should remove accents from text', () => {
      expect(generateSlug('Sofá Confortável')).toBe('sofa-confortavel')
      expect(generateSlug('Açúcar Cristal')).toBe('acucar-cristal')
      expect(generateSlug('Coração de Mãe')).toBe('coracao-de-mae')
    })

    it('should replace spaces with hyphens', () => {
      expect(generateSlug('Multiple   Spaces')).toBe('multiple-spaces')
      expect(generateSlug('  Leading and trailing  ')).toBe(
        'leading-and-trailing'
      )
    })

    it('should remove special characters', () => {
      expect(generateSlug('Product@#$%^&*()')).toBe('product')
      expect(generateSlug('Price: $99.99!')).toBe('price-9999')
      expect(generateSlug('100% Cotton')).toBe('100-cotton')
    })

    it('should handle multiple hyphens', () => {
      expect(generateSlug('Word---With---Hyphens')).toBe('word-with-hyphens')
      expect(generateSlug('--Start--End--')).toBe('start-end')
    })

    it('should handle empty and whitespace strings', () => {
      expect(generateSlug('')).toBe('')
      expect(generateSlug('   ')).toBe('')
      expect(generateSlug('\t\n')).toBe('')
    })

    it('should handle numbers and letters', () => {
      expect(generateSlug('Product 123')).toBe('product-123')
      expect(generateSlug('iPhone 15 Pro Max')).toBe('iphone-15-pro-max')
    })

    it('should handle complex Brazilian text', () => {
      expect(generateSlug('Camisão de Algodão 100%')).toBe(
        'camisao-de-algodao-100'
      )
      expect(generateSlug('Açaí com Granola & Frutas')).toBe(
        'acai-com-granola-frutas'
      )
    })

    it('should handle mixed languages', () => {
      expect(generateSlug('Café Français & English Tea')).toBe(
        'cafe-francais-english-tea'
      )
    })

    it('should handle only special characters', () => {
      expect(generateSlug('@#$%^&*()')).toBe('')
      expect(generateSlug('!!!')).toBe('')
    })

    it('should preserve existing hyphens appropriately', () => {
      expect(generateSlug('Well-Known Product')).toBe('well-known-product')
      expect(generateSlug('State-of-the-Art')).toBe('state-of-the-art')
    })
  })

  describe('truncateText', () => {
    const longText =
      'This is a very long text that needs to be truncated for display purposes in the user interface.'

    it('should return original text if shorter than maxLength', () => {
      expect(truncateText('Short text', 100)).toBe('Short text')
      expect(truncateText('Hello', 10)).toBe('Hello')
    })

    it('should truncate text with default suffix', () => {
      expect(truncateText(longText, 20)).toBe('This is a very...')
      expect(truncateText(longText, 30)).toBe('This is a very long text...')
    })

    it('should truncate text with custom suffix', () => {
      expect(truncateText(longText, 20, ' [more]')).toBe('This is a ver [more]')
      expect(truncateText(longText, 25, '…')).toBe('This is a very long…')
    })

    it('should truncate text without suffix', () => {
      expect(truncateText(longText, 20, '')).toBe('This is a very long')
      expect(truncateText(longText, 10, '')).toBe('This is a')
    })

    it('should handle edge case where maxLength is smaller than suffix', () => {
      expect(truncateText(longText, 2, '...')).toBe('Th...')
      expect(truncateText(longText, 1, '...')).toBe('T...')
    })

    it('should respect word boundaries when possible', () => {
      const text = 'The quick brown fox jumps over the lazy dog'
      expect(truncateText(text, 20)).toBe('The quick brown...')
      expect(truncateText(text, 15)).toBe('The quick...')
    })

    it('should not break at word boundary if too much text would be lost', () => {
      const text = 'Supercalifragilisticexpialidocious word'
      expect(truncateText(text, 20)).toBe('Supercalifragilis...')
    })

    it('should handle text with no spaces', () => {
      const text = 'Supercalifragilisticexpialidocious'
      expect(truncateText(text, 10)).toBe('Superca...')
    })

    it('should handle empty text', () => {
      expect(truncateText('', 10)).toBe('')
      expect(truncateText('', 10, '...')).toBe('')
    })

    it('should handle text that is exactly maxLength', () => {
      expect(truncateText('Hello', 5)).toBe('Hello')
      expect(truncateText('Hello', 5, '...')).toBe('Hello')
    })

    it('should handle whitespace-only text', () => {
      expect(truncateText('   ', 10)).toBe('   ')
      expect(truncateText('   ', 2)).toBe('  ...')
      expect(truncateText('     ', 3)).toBe('...')
    })

    it('should trim whitespace from truncated text', () => {
      const text = 'Hello world this is a test'
      expect(truncateText(text, 12)).toBe('Hello wor...')
      expect(truncateText(text, 13)).toBe('Hello worl...')
    })

    it('should handle different suffix lengths', () => {
      const text = 'Hello world this is a test'
      expect(truncateText(text, 10, '.')).toBe('Hello wor.')
      expect(truncateText(text, 10, '...')).toBe('Hello w...')
      expect(truncateText(text, 10, ' (continued)')).toBe(
        'Hello worl (continued)'
      )
    })

    it('should use default parameters correctly', () => {
      const veryLongText = 'A'.repeat(150)
      expect(truncateText(veryLongText)).toBe('A'.repeat(97) + '...')
      expect(truncateText(veryLongText).length).toBe(100)
    })

    it('should handle text with multiple spaces', () => {
      const text = 'Hello    world    this    is    a    test'
      expect(truncateText(text, 20)).toBe('Hello    world...')
    })

    it('should handle text with line breaks', () => {
      const text = 'Hello\nworld\nthis\nis\na\ntest'
      expect(truncateText(text, 15)).toBe('Hello\nworld...')
    })

    it('should handle special characters in text', () => {
      const text = 'Hello @#$%^&*() world test'
      expect(truncateText(text, 20)).toBe('Hello @#$%^&*()...')
    })

    it('should handle Brazilian Portuguese text', () => {
      const text = 'Este é um texto em português com acentuação'
      expect(truncateText(text, 25)).toBe('Este é um texto em...')
    })
  })
})
