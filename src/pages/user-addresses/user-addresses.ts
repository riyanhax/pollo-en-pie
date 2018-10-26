import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';

import { Storage } from '@ionic/storage';
import { Delportal } from '../../service/delportal.service';
import { AddressFormPage } from '../address-form/address-form';
/**
 * Generated class for the UserAddressesPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
	selector: 'page-user-addresses',
	templateUrl: 'user-addresses.html',
})
export class UserAddressesPage {
	AddressFormPage = AddressFormPage;
	login: Object;
	noResult: boolean = false;
	userAddresses: Object[] = [];

	constructor(public navCtrl: NavController,
		public navParams: NavParams,
		public dp: Delportal,
		public storage: Storage) {

	}

	ionViewDidEnter(){
		this.setData();
	}

	setData(){
		this.storage.get('login').then(val => {
			this.login = val;
			this.dp.getUserDeliveryAddresses(this.login).then(addresses => {
				this.userAddresses = addresses;
				
				if (this.userAddresses.length <= 0)
					this.noResult = true;
				else this.noResult = false;
			});
		});
	}

	delete(id) {
		this.dp.deleteDeliveryAddress(this.login, id).then(data => {
			this.userAddresses = data;

			if (this.userAddresses.length <= 0)
				this.noResult = true;
			else this.noResult = false;
		});
	}

	setDefault(id:number){
		let uc = this.userAddresses.find((c) => c['id'] == id);
		uc['is_default'] = !uc['is_default'];
		if (uc){
			this.dp.saveDeliveryAddress(this.login, uc).then(data => {
				this.userAddresses = data;

				if (this.userAddresses.length <= 0)
					this.noResult = true;
				else this.noResult = false;
			});
		}
	}


	

}
