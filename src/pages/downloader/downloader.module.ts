import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { DownloaderPage } from './downloader';

@NgModule({
  declarations: [
    DownloaderPage,
  ],
  imports: [
    IonicPageModule.forChild(DownloaderPage),
  ],
})
export class DownloaderPageModule {}
