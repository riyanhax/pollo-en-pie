import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CoreValidator } from '../../validator/core';

import { Storage } from '@ionic/storage';
import { Delportal } from '../../service/delportal.service';
/**
 * Generated class for the BillingAddressPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
	selector: 'page-billing-address',
	templateUrl: 'billing-address.html',
})
export class BillingAddressPage {
	login: Object;
	id: Number;
	data: Object;
	formBillingAddress: FormGroup;

	constructor(public navCtrl: NavController,
		public navParams: NavParams,
		public storage: Storage,
		public dp: Delportal,
		private formBuilder: FormBuilder) {

		this.id = this.navParams.get('id');

		this.formBillingAddress = formBuilder.group({
			id: [0],
			title: ['', Validators.required],
			first_name: ['', Validators.required],
			last_name: ['', Validators.required],
			company_name: [''],
			document_type: ['', Validators.required],
			document_number: ['', Validators.required],
			address_line_1: ['', Validators.required],
			address_city: ['', Validators.required],
			address_state: ['G'],
			address_country: ['EC'],
			email: ['', Validators.compose([Validators.required, CoreValidator.isEmail])],
			phone: ['', Validators.required],
			is_default: [false]
		});

		this.storage.get('login').then(val => {
			this.login = val;
			this.dp.getUserBillingAddresses(this.login).then( addresses => {
				this.data = addresses.find( a => a['id'] == this.id);
				this.reset();
			});
		});

		
	}

	ionViewDidLoad() {

	}

	reset() {
		if (this.data == null) return; 
		this.formBillingAddress.patchValue({
			id: this.data['id'],
			title: this.data['title'],
			first_name: this.data["first_name"],
			last_name: this.data["last_name"],
			company_name: this.data["company"],
			document_type: this.data["document_type"],
			document_number: this.data["document_number"],
			address_line_1: this.data["line_1"],
			address_city: this.data["city"],
			address_country: this.data["country"],
			address_state: this.data["state"],
			phone: this.data["phone"],
			email: this.data["email"],
			is_default: this.data['is_default']
			
		});
		/*this.rawData = Object.assign({}, this.formAddress.value);*/
	}
	save() {
		this.dp.saveBillingAddress(this.login, this.formBillingAddress.value).then(data => {
			this.navCtrl.pop();
		});
	}

}
