import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { ProfileMenuPage } from './profile-menu';

@NgModule({
  declarations: [
    ProfileMenuPage,
  ],
  imports: [
    IonicPageModule.forChild(ProfileMenuPage),
  ],
})
export class ProfileMenuPageModule {}
