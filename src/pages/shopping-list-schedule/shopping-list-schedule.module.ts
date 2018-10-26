import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { ShoppingListSchedulePage } from './shopping-list-schedule';

@NgModule({
  declarations: [
    ShoppingListSchedulePage,
  ],
  imports: [
    IonicPageModule.forChild(ShoppingListSchedulePage),
  ],
})
export class ShoppingListSchedulePageModule {}
