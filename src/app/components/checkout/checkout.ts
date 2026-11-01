import { Component, OnInit, AfterViewInit } from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { FormBuilder, FormControl, FormGroup, FormGroupName, ReactiveFormsModule, Validators } from '@angular/forms';
import { Luv2ShopForm } from '../../services/luv2-shop-form';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { Country } from '../../common/country';
import { State } from '../../common/state';
import { Luv2ShopValidators } from '../../validators/luv2-shop-validators';
import { Cart } from '../../services/cart';
import { Checkout as CheckoutService } from '../../services/checkout';
import { Router } from '@angular/router';
import { Order } from '../../common/order';
import { OrderItem } from '../../common/order-item';
import { Purchase } from '../../common/purchase';
import { PaymentInfo } from '../../common/payment-info';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-checkout',
  imports: [CommonModule, ReactiveFormsModule, CurrencyPipe, NgbModule],
  templateUrl: './checkout.html',
  styleUrl: './checkout.css',
})
export class Checkout implements OnInit, AfterViewInit {

  checkoutFormGroup!: FormGroup;

  totalPrice: number = 0;
  totalQuantity: number = 0;

  creditCardYear: number[] = [];
  creditCardMonths: number[]= [];

  countries: Country[]=[];

  shippingAddressStates: State[] = [];
  billingAddressStates: State[] = [];

  storage: Storage = sessionStorage;
  
  // initialize Strip API
  stripe = Stripe(environment.stripePublishableKey);

  paymentInfo: PaymentInfo = new PaymentInfo();
  cardElement: any;
  displayError: HTMLElement | null = null;

  isDisabled: boolean = false;

  constructor(private formBuilder: FormBuilder,
              private luv2ShopFormService: Luv2ShopForm,
              private cartService: Cart,
              private checkoutService: CheckoutService,
              private router: Router) { }

  ngOnInit(): void {

    // setup Stripe payment form
    //this.setupStripePaymentForm();

    this.reviewCartDetails();

    // read the user's email address from browser storage
    const theEmail = JSON.parse(this.storage.getItem('userEmail')!);

    this.checkoutFormGroup = this.formBuilder.group({
      customer: this.formBuilder.group({
        firstName: new FormControl('', [Validators.required, Validators.minLength(2), Luv2ShopValidators.notOnlyWhitespace]),
        lastName: new FormControl('', [Validators.required, Validators.minLength(2), Luv2ShopValidators.notOnlyWhitespace]),
        email: new FormControl(theEmail, [
          Validators.required,
          Validators.pattern('^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,4}$')
        ])
      }),

      shippingAddress: this.formBuilder.group({
        street: new FormControl('', [Validators.required, Validators.minLength(2), Luv2ShopValidators.notOnlyWhitespace]),
        city: new FormControl('', [Validators.required, Validators.minLength(2), Luv2ShopValidators.notOnlyWhitespace]),
        state: new FormControl('', [Validators.required]),
        country: new FormControl('', [Validators.required]),
        zipCode: new FormControl('', [Validators.required, Validators.minLength(2), Luv2ShopValidators.notOnlyWhitespace])
      }),
      billingAddress: this.formBuilder.group({
        street: new FormControl('', [Validators.required, Validators.minLength(2), Luv2ShopValidators.notOnlyWhitespace]),
        city: new FormControl('', [Validators.required, Validators.minLength(2), Luv2ShopValidators.notOnlyWhitespace]),
        state: new FormControl('', [Validators.required]),
        country: new FormControl('', [Validators.required]),
        zipCode: new FormControl('', [Validators.required, Validators.minLength(2), Luv2ShopValidators.notOnlyWhitespace])
      }),
      creditCard: this.formBuilder.group({
        /*
        cardType: new FormControl('', [Validators.required]),
        nameOnCard: new FormControl('', [Validators.required, Validators.minLength(2), Luv2ShopValidators.notOnlyWhitespace]),
        cardNumber: new FormControl('', [Validators.required, Validators.pattern('[0-9]{16}')]),
        securityCode: new FormControl('', [Validators.required, Validators.pattern('[0-9]{3}')]),
        expirationMonth: [''],
        expirationYear: ['']
        */
      })
    });

    /*
    // populate credit card months
    const startMonth: number = new Date().getMonth() +1;
    console.log("startMonth: " + startMonth);

    this.luv2ShopFormService.getCreditCardMonths(startMonth).subscribe(
      data => {
        console.log("Retrieved credit card months: " + JSON.stringify(data));
        this.creditCardMonths = data;
      }
    );

    // populate credit card year
    this.luv2ShopFormService.getCreditCardYears().subscribe(
      data => {
        console.log("Retrieved credit card years: " + JSON.stringify(data));
        this.creditCardYear = data;
      }
    );
    */

    // populates countries

    this.luv2ShopFormService.getCountries().subscribe(
      data => {
        console.log("Retrieved countries: " + JSON.stringify(data));
        this.countries = data;
      }
    );
  }
  
  //ngAfterViewInit()
  ngAfterViewInit(): void {
    this.setupStripePaymentForm();
}

setupStripePaymentForm() {

    const elements = this.stripe.elements();

    this.cardElement = elements.create('card', {
        hidePostalCode: true
    });

    this.cardElement.mount('#card-element');

    this.cardElement.on('change', (event: any) => {

        const displayError = document.getElementById('card-errors');

        if (displayError) {
            if (event.error) {
                displayError.textContent = event.error.message;
            } else {
                displayError.textContent = '';
            }
        }
    });
}

  // setupStripePaymentForm() {
    
  //   //get a handle to stripe elements
  //   var element = this.stripe.element();

  //   //Create a card element ... and hide the zip-code field
  //   this.cardElement = elements.create('card', { hidePostalCode: true });

  //   // Add an instance of card UI component into the 'card-element' div
  //   this.cardElement.mount('#card-element');

  //   // Add event binding for the 'change' event on the card element
  //   this.cardElement.on('change', (event: any)=>{

  //     //get a handel to card-errors element
  //     this.displayError = document.getElementById('card-errors');

  //     if(event.complete) {
  //       this.displayError.textContent = "";
  //     } else if (event.error) {
  //       // show validation error to customer
  //       this.displayError.textContent = event.error.message;
  //     }
  //   });
  // }

  reviewCartDetails() {

    // subscribe to cartService.totalQuantity
    this.cartService.totalQuantity.subscribe(
      totalQuantity => this.totalQuantity = totalQuantity
    );

    // subscribe to cartService.totalPrice
    this.cartService.totalPrice.subscribe(
      totalPrice => this.totalPrice = totalPrice
    );

  }

  get firstName() { return this.checkoutFormGroup?.get('customer.firstName'); }
  get lastName() { return this.checkoutFormGroup?.get('customer.lastName'); }
  get email() { return this.checkoutFormGroup?.get('customer.email'); }

  get shippingAddressStreet() { return this.checkoutFormGroup?.get('shippingAddress.street'); }
  get shippingAddressCity() { return this.checkoutFormGroup?.get('shippingAddress.city'); }
  get shippingAddressState() { return this.checkoutFormGroup?.get('shippingAddress.state'); }
  get shippingAddressZipCode() { return this.checkoutFormGroup?.get('shippingAddress.zipCode'); }
  get shippingAddressCountry() { return this.checkoutFormGroup?.get('shippingAddress.country'); }

  get billingAddressStreet() { return this.checkoutFormGroup?.get('billingAddress.street'); }
  get billingAddressCity() { return this.checkoutFormGroup?.get('billingAddress.city'); }
  get billingAddressState() { return this.checkoutFormGroup?.get('billingAddress.state'); }
  get billingAddressZipCode() { return this.checkoutFormGroup?.get('billingAddress.zipCode'); }
  get billingAddressCountry() { return this.checkoutFormGroup?.get('billingAddress.country'); }

  get creditCardType() { return this.checkoutFormGroup?.get('creditCard.cardType'); }
  get creditCardNameOnCard() { return this.checkoutFormGroup?.get('creditCard.nameOnCard'); }
  get creditCardNumber() { return this.checkoutFormGroup?.get('creditCard.cardNumber'); }
  get creditCardSecurityCode() { return this.checkoutFormGroup?.get('creditCard.securityCode'); }

  copyShippingAddressToBillingAddress(event: Event) {
    const target = event.target as HTMLInputElement | null;

    if (target?.checked) {
      this.checkoutFormGroup.controls['billingAddress']
        .setValue(this.checkoutFormGroup.controls['shippingAddress'].value);

        //bug fix for states
        this.billingAddressStates = this.shippingAddressStates;

    } else {
      this.checkoutFormGroup.controls['billingAddress'].reset();

      //bug fix for states
      this.billingAddressStates = [];
    }
  }

  onSubmit(){
    console.log("Handling the submit button");

    if (this.checkoutFormGroup.invalid){
      this.checkoutFormGroup.markAllAsTouched();
      return;
    }

    // console.log(this.checkoutFormGroup.get('customer')?.value);
    // console.log("The email address is " + this.checkoutFormGroup.get('customer')?.value.email);

    // console.log("The shipping address country is " + this.checkoutFormGroup.get('shippingAddress')?.value.country.name);
    // console.log("The shipping address state is " + this.checkoutFormGroup.get('shippingAddress')?.value.state.name);

    // set up order
    let order = new Order();
    order.totalPrice =this.totalPrice;
    order.totalQuantity = this.totalQuantity;

    //get cart items
    const cartItems = this.cartService.cartItems;

    //create orderItems from cartItems
    // - long way
    /*
    let orderItems: OrderItem[] = [];
    for (let i=0; i< cartItems.length; i++){
      orderItems[i] = new OrderItem(cartItems[i]);
    }
      */

    // - short way of doing the same thing
    let orderItems: OrderItem[] = cartItems.map(tempCartItem => new OrderItem(tempCartItem));

    //set up purchase
    let purchase = new Purchase();

    //populate purchase - customer
    purchase.customer = this.checkoutFormGroup.controls['customer'].value;

    //populate purchase - shipping address
    purchase.shippingAddress = this.checkoutFormGroup.controls['shippingAddress'].value;
      const shippingState: State = JSON.parse(JSON.stringify(purchase.shippingAddress?.state));
      const shippingCountry: Country = JSON.parse(JSON.stringify(purchase.shippingAddress?.country));

      purchase.shippingAddress!.state = shippingState.name;
      purchase.shippingAddress!.country = shippingCountry.name;
    

    //populate purchase - billing address
    purchase.billingAddress = this.checkoutFormGroup.controls['billingAddress'].value;
      const billingState: State = JSON.parse(JSON.stringify(purchase.billingAddress?.state));
      const billingCountry: Country = JSON.parse(JSON.stringify(purchase.billingAddress?.country));

      purchase.billingAddress!.state = billingState.name;
      purchase.billingAddress!.country = billingCountry.name;

    //populate purchase - order and orderItems
    purchase.order = order;
    purchase.orderItems = orderItems;

    // compute payment info
    this.paymentInfo.amount = Math.round(this.totalPrice * 100);
    this.paymentInfo.currency = "USD";
    this.paymentInfo.receiptEmail = purchase.customer?.email;

    console.log(`this.paymentInfo.amount: ${this.paymentInfo.amount}`);

    // if valid form then
    // - create payment intent
    // - confirm card payment
    // -place order

    if (!this.checkoutFormGroup.invalid && (!this.displayError || this.displayError.textContent === "")) {

      this.isDisabled = true;
      this.checkoutService.createPaymentIntent(this.paymentInfo).subscribe(
        (paymentIntentResponse) => {
          this.stripe.confirmCardPayment(paymentIntentResponse.client_secret,
            {
              payment_method: {
                card: this.cardElement,
                billing_details: {
                  email: purchase.customer?.email,
                  name: `${purchase.customer?.firstName} ${purchase.customer?.lastName}`,
                  address:{
                    line1: purchase.billingAddress?.street,
                    city: purchase.billingAddress?.city,
                    state: purchase.billingAddress?.state,
                    postal_code: purchase.billingAddress?.zipCode,
                    Country: this.billingAddressCity?.value.code
                  }
                }
              }
            }, { handleActions: false })
            .then((result: any) => {
              if (result.error) {
                // inform the customer there was an error
                alert(`There was an error: ${result.error.message}`);
                this.isDisabled = false;
              } else {
                // call rest API via CheckoutService
                this.checkoutService.placeOrder(purchase).subscribe({
                  next: (response: any) => {
                    alert(`Your order has been received.\nOrder tracking number: ${response.orderTrackingNumber}`);

                    // reset cart
                    this.resetCart();
                    this.isDisabled = false;
                  },
                  error: (err: any) => {
                    alert(`There was an error: ${err.message}`);
                    this.isDisabled = false;
                  }
                });
              }
            }/* .bind(this) */);
        }
      );
    } else {
      this.checkoutFormGroup.markAllAsTouched();
      return;
    }

    /*
    //call REST API via the CheckoutService
    this.checkoutService.placeOrder(purchase).subscribe(
      {
        next: response => {
          alert(`Your order has been received.\nOrder tracking number: ${response.orderTrackingNumber}`)

          //reset cart
          this.resetCart();

        },
        error: err =>{
          alert(`There was an error: ${err.message}`);
        }
      }
    );
    */

  }

  resetCart() {
    // reset cart data
    this.cartService.cartItems = [];
    this.cartService.totalPrice.next(0);
    this.cartService.totalQuantity.next(0);
    this.cartService.persistCartItems();

    // reset the form
    this.checkoutFormGroup.reset();

    // navigate back to the products page
    this.router.navigateByUrl("/products");
  }

  /*
  handleMonthsAndYears() {

    const creditCardFormGroup = this.checkoutFormGroup.get('creditCard');

    const currentYear: number = new Date().getFullYear();
    const selectedYear: number = Number(creditCardFormGroup?.value.expirationYear);

    // if the current year equals the selected year, then start with the current month

    let startMonth: number;

    if (currentYear === selectedYear){
      startMonth = new Date().getMonth() + 1;
    }
    else{
      startMonth = 1;
    }

    this.luv2ShopFormService.getCreditCardMonths(startMonth).subscribe(
      data => {
        console.log("Retrived credit card months: " + JSON.stringify(data));
        this.creditCardMonths = data;
      }
    )
  }
    */

  getStates(fromGroupName: string){

    const formGroup = this.checkoutFormGroup.get(fromGroupName);

    const countryCode = formGroup?.value.country.code;
    const countryName = formGroup?.value.country.name;

    console.log(`${fromGroupName} country code: ${countryCode}`);
    console.log(`${fromGroupName} country code: ${countryName}`);

    this.luv2ShopFormService.getStates(countryCode).subscribe(
      data => {

        if (fromGroupName === 'shippingAddress'){
          this.shippingAddressStates = data;
        }
        else{
          this.billingAddressStates =  data;
        }

        // select first item by default
        formGroup?.get('state')?.setValue(data[0]);
      }
    );
  }
}
