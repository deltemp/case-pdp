import { ProductActions } from '@/components/ProductActions';
import { ProductActions as DirectImport } from '@/components/ProductActions/ProductActions';

describe('ProductActions index', () => {
  it('exports ProductActions component correctly', () => {
    expect(ProductActions).toBeDefined();
    expect(ProductActions).toBe(DirectImport);
  });
});