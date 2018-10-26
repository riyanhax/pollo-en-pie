import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { UserAddressesPage } from './user-addresses';

@NgModule({
  declarations: [
    UserAddressesPage,
  ],
  imports: [
    IonicPageModule.forChild(UserAddressesPage),
  ],
})
export class UserAddressesPageModule {}
