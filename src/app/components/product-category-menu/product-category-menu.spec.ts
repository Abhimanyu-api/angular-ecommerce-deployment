import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { Subject } from 'rxjs';

import { ProductCategoryMenu } from './product-category-menu';
import { ProductCategory } from '../../common/product-category';
import { ProductService } from '../../services/product';

describe('ProductCategoryMenu', () => {
  let component: ProductCategoryMenu;
  let fixture: ComponentFixture<ProductCategoryMenu>;
  let categories: Subject<ProductCategory[]>;

  beforeEach(async () => {
    categories = new Subject<ProductCategory[]>();

    await TestBed.configureTestingModule({
      imports: [ProductCategoryMenu],
      providers: [
        provideRouter([]),
        {
          provide: ProductService,
          useValue: { getProductCategories: () => categories.asObservable() },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ProductCategoryMenu);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('renders categories when the API response arrives', async () => {
    categories.next([new ProductCategory(1, 'Books')]);
    await fixture.whenStable();

    expect(fixture.nativeElement.querySelector('a')?.textContent.trim()).toBe('Books');
  });
});
