import { Component } from '@angular/core';
import { NavController } from 'ionic-angular';
import { Http } from '@angular/http';

import { LoginPage } from '../login/login';
import { SignupPage } from '../signup/signup';

@Component({
	selector: 'page-prelogin',
	templateUrl: 'pre-login.html'
})

export class PreloginPage{
    LoginPage = LoginPage;
    SignupPage = SignupPage;
    

    constructor(
        private navCtrl: NavController,
    )
    {

    }
    goto(page: any) {
		
        if (!page) this.navCtrl.popToRoot();
        else {
            let previous = this.navCtrl.getPrevious();
            if (previous && previous.component == page) this.navCtrl.pop();
            else this.navCtrl.push(page);
        }
    
    }
}