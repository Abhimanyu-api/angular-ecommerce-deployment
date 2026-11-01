import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ProductCategory } from '../../common/product-category';
import { ProductService } from '../../services/product';

@Component({
  selector: 'app-product-category-menu',
  imports: [CommonModule, RouterLink],
  templateUrl: './product-category-menu.html',
  styleUrl: './product-category-menu.css',
})
export class ProductCategoryMenu implements OnInit {

  productCategories: ProductCategory[] = [];

  constructor(private productService: ProductService) { }

  ngOnInit(): void {
    this.listProductCategories();
  }
  listProductCategories() {
    this.productService.getProductCategories().subscribe(
      data => {
        console.log('Product Categories = ' + JSON.stringify(data));
        this.productCategories = data;
      }
    );
  }

}
