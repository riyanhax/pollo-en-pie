import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { OrderStatusDetailPage } from './order-status-detail';

@NgModule({
  declarations: [
    OrderStatusDetailPage,
  ],
  imports: [
    IonicPageModule.forChild(OrderStatusDetailPage),
  ],
})
export class OrderStatusDetailPageModule {}
