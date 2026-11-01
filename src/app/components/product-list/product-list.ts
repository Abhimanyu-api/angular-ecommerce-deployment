import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProductService } from '../../services/product';
import { Cart } from '../../services/cart';
import { Product } from '../../common/product';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { CartItem } from '../../common/cart-item';

@Component({
  selector: 'app-product-list',
  imports: [CommonModule, RouterLink, NgbModule],
  templateUrl: './product-list-grid.html',
  styleUrl: './product-list.css',
})
export class ProductList implements OnInit {

  products: Product[] = [];
  currentCategoryId: number = 1;
  previousCategoryId: number = 1;
  searchMode: boolean = false;

  // new properties for pagination
  thePageNumber: number = 1;
  thePageSize: number = 5;
  theTotalElements: number = 0;

  previousKeyword: string = "";

  constructor(private productService: ProductService,
              private cartService: Cart,
              private route: ActivatedRoute,
              private changeDetectorRef: ChangeDetectorRef){}

  ngOnInit(): void{
    this.route.paramMap.subscribe(()=>{
      this.listProducts();
    });
  }
    listProducts(): void {

      this.searchMode = this.route.snapshot.paramMap.has('keyword');

      if(this.searchMode){
        this.handleSearchProducts();
      }
      else{
        this.handleListProducts();
      }
  }
  handleSearchProducts() {

    console.log('handleListProducts() CALLED');
    
    const theKeyword: string = this.route.snapshot.paramMap.get('keyword')!;

    // if we have a different keyword than previous
    // then set thePageNumber to 1
    if(this.previousKeyword != theKeyword){
      this.thePageNumber = 1;
    }

    this.previousKeyword = theKeyword;

    console.log(`keyword=${theKeyword}, thePageNumber=${this.thePageNumber}`);

    // now search for the products using keyword
    this.productService.searchProductsPaginate(this.thePageNumber - 1,
                                               this.thePageSize,
                                               theKeyword)
                                               .subscribe(this.processResult());
                                               
  }

  handleListProducts() {
    // Check if "id" parameter is available
      const hasCategoryId: boolean = this.route.snapshot.paramMap.has('id')

      if(hasCategoryId){
        // Get the "id" param string. Convert string to a number using the "+" symbol
        this.currentCategoryId = +this.route.snapshot.paramMap.get('id')!;
      }
      else{
        // Not category id available ... default to category id 1
        this.currentCategoryId = 1;
      }

      //
      // Check if we have a different category than previous
      // Note: Angular will reuse a component if it is currently being viewed
      //

      // If we have a different category id than previous
      // then set thePageNumber back to 1
      if(this.previousCategoryId != this.currentCategoryId){
        this.thePageNumber = 1;
      }

      this.previousCategoryId = this.currentCategoryId;

      console.log(`currentCategoryId=${this.currentCategoryId}, thePageNumber=${this.thePageNumber}`);

    // Now get the products for the given category id
    this.productService.getProductListPaginate(this.thePageNumber - 1, 
                                               this.thePageSize,
                                               this.currentCategoryId)
                                               .subscribe(this.processResult());
      }

      updatePageSize(pageSize: string): void {
        this.thePageSize = +pageSize;
        this.thePageNumber = 1;
        this.listProducts();
      }

     processResult() {
      return (data: any) => {

        console.log('PRODUCTS ARRAY:', data._embedded.products);
        console.log('PRODUCT COUNT:', data._embedded.products.length);

        this.products = data._embedded.products;
        this.thePageNumber = data.page.number + 1;
        this.thePageSize = data.page.size;
        this.theTotalElements = data.page.totalElements;
        this.changeDetectorRef.markForCheck();
      };
    } 

    addToCart(theProduct: Product) {
      console.log(`Adding to cart: ${theProduct.name}, ${theProduct.unitPrice}`);

      // TODO ... do the real work
      const theCartItem = new CartItem(theProduct);

      this.cartService.addToCart(theCartItem);
    }

}

