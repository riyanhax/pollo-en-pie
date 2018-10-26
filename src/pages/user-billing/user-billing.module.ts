import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { UserBillingPage } from './user-billing';

@NgModule({
  declarations: [
    UserBillingPage,
  ],
  imports: [
    IonicPageModule.forChild(UserBillingPage),
  ],
})
export class UserBillingPageModule {}
