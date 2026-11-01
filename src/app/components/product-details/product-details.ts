import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { Product } from '../../common/product';
import { ProductService } from '../../services/product';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { CurrencyPipe } from '@angular/common';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { Cart } from '../../services/cart';
import { CartItem } from '../../common/cart-item';

@Component({
  selector: 'app-product-details',
  imports: [CurrencyPipe, RouterLink, NgbModule],
  templateUrl: './product-details.html',
  styleUrl: './product-details.css',
})
export class ProductDetails implements OnInit {

  product!: Product;

  constructor(private productService: ProductService,
              private cart: Cart,
              private route: ActivatedRoute,
              private changeDetectorRef: ChangeDetectorRef) { }

  ngOnInit(): void {
    this.route.paramMap.subscribe(() => {
      this.handleProductDetails();
    });
  }
  handleProductDetails() {
    // get the "id" param string. convert string to a number using the "+" symbol
    const theProductId: number = +this.route.snapshot.paramMap.get('id')!;

    this.productService.getProduct(theProductId).subscribe({
      next: (data) => {
        this.product = data;
        this.changeDetectorRef.markForCheck();
      }
    });
  }

  addToCart() {
    console.log(`Adding to cart: ${this.product.name}, ${this.product.unitPrice}`);
    const theCartItem = new CartItem(this.product);
    this.cart.addToCart(theCartItem);
  }
}

