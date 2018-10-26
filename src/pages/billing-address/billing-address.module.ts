import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { BillingAddressPage } from './billing-address';

@NgModule({
  declarations: [
    BillingAddressPage,
  ],
  imports: [
    IonicPageModule.forChild(BillingAddressPage),
  ],
})
export class BillingAddressPageModule {}
