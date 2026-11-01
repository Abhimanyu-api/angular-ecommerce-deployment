import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';

import { ProductService } from './product';
import { Product } from '../common/product';

describe('ProductService', () => {
  let service: ProductService;
  let httpTesting: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()]
    });
    service = TestBed.inject(ProductService);
    httpTesting = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpTesting.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should return products from the embedded response returned by findByCategoryId', () => {
    const products = [
      new Product(
        1,
        'BOOK-001',
        'Crash Course in Python',
        'A Python programming book',
        29.99,
        'books/crash-course-in-python.png',
        true,
        10,
        new Date('2026-08-29T17:07:41.000Z'),
        new Date('2026-08-29T17:07:41.000Z')
      )
    ];
    let result: Product[] | undefined;

    service.getProductList(1).subscribe(response => result = response);

    const request = httpTesting.expectOne(
      'http://localhost:8080/api/products/search/findByCategoryId?id=1'
    );
    request.flush({ _embedded: { products } });

    expect(result).toEqual(products);
  });
});
