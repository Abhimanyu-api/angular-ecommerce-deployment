import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CommonModule, CurrencyPipe, DatePipe } from '@angular/common';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';

import { OrderHistory as OrderHistoryModel } from '../../common/order-history';
import { OrderHistory as OrderHistoryService } from '../../services/order-history';

@Component({
  selector: 'app-order-history',
  imports: [CommonModule, CurrencyPipe, DatePipe, NgbModule],
  templateUrl: './order-history.html',
  styleUrl: './order-history.css',
})
export class OrderHistory {

  orderHistoryList: OrderHistoryModel[] = [];
  storage: Storage = sessionStorage;

  constructor(
    private orderHistoryService: OrderHistoryService,
    private changeDetectorRef: ChangeDetectorRef
  ) { }

  ngOnInit(): void {
    this.handleOrderHistory();
  }

  handleOrderHistory() {
    const storedUserEmail = this.storage.getItem('userEmail');

    if (!storedUserEmail) {
      this.orderHistoryList = [];
      this.changeDetectorRef.markForCheck();
      return;
    }

    const theEmail = JSON.parse(storedUserEmail);

    this.orderHistoryService.getOrderHistory(theEmail).subscribe(
      data => {
        this.orderHistoryList = (data._embedded?.orders as unknown as OrderHistoryModel[]) ?? [];
        this.changeDetectorRef.markForCheck();
      }
    );
  }
}
