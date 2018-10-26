import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { StorePage } from './store';
import { IonicImageLoader } from 'ionic-image-loader';

@NgModule({
  declarations: [
    StorePage,
  ],
  imports: [
    IonicImageLoader,
    IonicPageModule.forChild(StorePage),
  ],
})
export class StorePageModule {}
