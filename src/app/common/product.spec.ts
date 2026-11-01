import { Product } from './product';

describe('Product', () => {
  it('should create an instance', () => {
    const product = new Product(
      1,
      'SKU-001',
      'Test Product',
      'Test description',
      19.99,
      'test.jpg',
      true,
      10,
      new Date('2026-08-29T17:07:41.000Z'),
      new Date('2026-08-29T17:07:41.000Z')
    );

    expect(product).toBeTruthy();
  });
});
