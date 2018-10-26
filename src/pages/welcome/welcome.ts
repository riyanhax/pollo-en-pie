import { Component } from '@angular/core';
import { NavController, NavParams } from 'ionic-angular';
import { Http } from '@angular/http';

import { LoginPage } from '../login/login';

@Component({
	selector: 'page-start',
	templateUrl: 'welcome.html'
})

export class WelcomePage{
    LoginPage = LoginPage;

    registeredFirstName: string = "";

    constructor(
        private navCtrl: NavController,
        public navParams: NavParams,
    ){
        this.registeredFirstName = navParams.get("first_name");

        console.log(navParams.get('first_name'));
    }
    gotoLogin(){
        if(this.navCtrl.getPrevious() && this.navCtrl.getPrevious().component == this.LoginPage)
            this.navCtrl.pop();
        else this.navCtrl.push(this.LoginPage);
    }
}