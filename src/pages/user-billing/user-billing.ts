import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { Storage } from '@ionic/storage';
import { Delportal } from '../../service/delportal.service';
import { BillingAddressPage } from '../billing-address/billing-address';
/**
 * Generated class for the UserBillingPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
	selector: 'page-user-billing',
	templateUrl: 'user-billing.html',
})
export class UserBillingPage {

	BillingAddressPage = BillingAddressPage;
	billingAddresses : Object[] = [];
	login: Object;
	noResult: boolean = false;

	constructor(
		public navCtrl: NavController, 
		public navParams: NavParams,
		public storage: Storage,
		private dp: Delportal) {
		
		
	}

	ionViewDidEnter() {
		
		this.setData();
	}

	setData(){
		this.storage.get('login').then(val => {
			this.login = val;
			this.dp.getUserBillingAddresses(this.login).then(data => {
				this.billingAddresses = data;

				if (this.billingAddresses.length <= 0)
					this.noResult = true;
				else this.noResult = false;
			});
		});
	}
	delete(id) {
		this.dp.deleteBillingAddress(this.login, id).then(data => {
			this.billingAddresses = data;

			if (this.billingAddresses.length <= 0)
				this.noResult = true;
			else this.noResult = false;
		});
	}

	setDefault(id:number){
		let uc = this.billingAddresses.find((c) => c['id'] == id);
		uc['is_default'] = "on";
		if (uc){
			this.dp.saveBillingAddress(this.login, uc).then(data => {
				this.billingAddresses = data;

				if (this.billingAddresses.length <= 0)
					this.noResult = true;
				else this.noResult = false;
			});
		}
	}
}
