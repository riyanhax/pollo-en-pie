import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CardIO } from '@ionic-native/card-io';
import { Delportal } from '../../service/delportal.service';
import { Storage } from '@ionic/storage';
import { CreditCardValidator } from 'ngx-credit-cards';

/**
 * Generated class for the CreditCardPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
	selector: 'page-credit-card',
	templateUrl: 'credit-card.html',
})
export class CreditCardPage {

	login: Object;
	id: Number;
	data: Object;
	formCreditCard: FormGroup;



	card = {
		cardType: '',
		cardNumber: '',
		redactedCardNumber: '',
		expiryMonth: null,
		expiryYear: null,
		cvv: '',
		postalCode: ''
	};

	cardImage = 'assets/images/credit-card.png';


	constructor(public navCtrl: NavController, 
		public navParams: NavParams, 
		public cardIO: CardIO,
		public storage: Storage,
		public dp: Delportal,
		private formBuilder: FormBuilder) {

		this.id = this.navParams.get('id');

		this.formCreditCard = formBuilder.group({
			id: [0],
			title: ['', Validators.required],
			type: ['', Validators.required],
			number: ['', Validators.compose([CreditCardValidator.validateCardNumber, Validators.required]) ],
			expDate: ['', Validators.required],
			is_default: [false]
		});

		this.storage.get('login').then(val => {
			this.login = val;
			this.dp.getUserCreditCards(this.login).then( addresses => {
				this.data = addresses.find( a => a['id'] == this.id);
				this.reset();
			});
		});

	}

	ionViewDidLoad() {
		console.log('ionViewDidLoad CreditCardPage');
	}

	scanCard() {
		this.cardIO.canScan()
			.then(
				(res: boolean) => {
					if (res) {
						const options = {
							scanExpiry: false,
							hideCardIOLogo: true,
							scanInstructions: 'Pon tu tarjeta dentro del cuadro',
							keepApplicationTheme: true,
							requireCCV: false,
							requireExpiry: false,
							requirePostalCode: false
						};
						this.cardIO.scan(options).then(response => {

							const { cardType, cardNumber, redactedCardNumber,
								expiryMonth, expiryYear, cvv, postalCode } = response;

							this.card = {
								cardType,
								cardNumber,
								redactedCardNumber,
								expiryMonth,
								expiryYear,
								cvv,
								postalCode
							};

							this.formCreditCard.patchValue(
								{
									number: this.card.cardNumber
								}
							);
						});
					}
				});
	}

	reset() {
		if (this.data == null) return; 
		this.formCreditCard.patchValue({
			id: this.data['id'],
			title: this.data['title'],
			type: this.data['type'],
			number: this.data["mask"],
			expDate: this.data["expDate"],
			is_default: this.data["is_default"]
			
		});
		/*this.rawData = Object.assign({}, this.formAddress.value);*/
	}
	save() {
		this.dp.saveUserCreditCard(this.login, this.formCreditCard.value).then(data => {
			this.navCtrl.pop();
		});
	}

}
