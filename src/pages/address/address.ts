import { Component, NgZone } from '@angular/core';
import { Http, Headers } from '@angular/http';
import { FormBuilder, FormGroup, Validators, FormControl } from '@angular/forms';
import { NavController, Platform, AlertController } from 'ionic-angular';
import { CreditCardValidator } from 'ngx-credit-cards';

// Custom
import { CoreValidator } from '../../validator/core';
import { Storage } from '@ionic/storage';
import { StorageMulti } from '../../service/storage-multi.service';
import { Core } from '../../service/core.service';
import { Config } from '../../service/config.service';
import { TranslateService } from '../../module/ng2-translate';
import { Geolocation } from '@ionic-native/geolocation';
import { LocationAccuracy } from '@ionic-native/location-accuracy';
import { Diagnostic } from '@ionic-native/diagnostic';
import { Device } from '@ionic-native/device';
import { CardIO } from '@ionic-native/card-io';

// Page
import { LoginPage } from '../login/login';
import { CheckoutPage } from '../checkout/checkout';
import { Delportal } from '../../service/delportal.service';
import { ObjectToArray } from '../../pipes/object-to-array';
import { ThanksPage } from '../thanks/thanks';
import { Toast } from '@ionic-native/toast';

declare var wordpress_url;
declare var display_mode;

@Component({
	selector: 'page-address',
	templateUrl: 'address.html',
	providers: [Core, StorageMulti, Geolocation, LocationAccuracy, Diagnostic, Device]
})
export class AddressPage {
	LoginPage = LoginPage;
	CheckoutPage = CheckoutPage;
	ThanksPage = ThanksPage;
	formAddress: FormGroup;
	login: Object = {};
	data: Object = {};
	rawData: Object;
	isCache: boolean;
	useBilling: boolean;
	statesBilling: any;
	statesShipping: any;
	countries: Object[] = [];
	states: Object = {};
	trans: Object;
	display_mode: string;
	shippingStateRequired = false;
	billingStateRequired = false;

	card = {
		cardType: '',
		cardNumber: '',
		redactedCardNumber: '',
		expiryMonth: null,
		expiryYear: null,
		cvv: '',
		postalCode: ''
	};


	constructor(
		private http: Http,
		private storage: Storage,
		private storageMul: StorageMulti,
		private formBuilder: FormBuilder,
		private core: Core,
		private navCtrl: NavController,
		config: Config,
		translate: TranslateService,
		private Geolocation: Geolocation,
		private LocationAccuracy: LocationAccuracy,
		private platform: Platform,
		private Diagnostic: Diagnostic,
		private Device: Device,
		public ngZone: NgZone,
		private toast: Toast,
		private dp: Delportal,
		private alertCtrl: AlertController,
		public cardIO: CardIO,
	) {
		this.display_mode = display_mode;
		translate.get('states').subscribe(trans => {
			if (trans == 'states') trans = {};
			if (config['countries']) this.countries = config['countries'];
			this.states = Object.assign(trans, config['states']);
		});
		translate.get('address.location').subscribe(trans => this.trans = trans);
		this.formAddress = this.formBuilder.group({
			document_type: ['', Validators.required],
			document_number: ['', Validators.required],
			billing_first_name: ['', Validators.required],
			billing_last_name: ['', Validators.required],
			billing_company: [''],
			billing_address_1: ['', Validators.required],
			billing_address_2: [''],
			billing_city: ['', Validators.required],
			billing_phone: ['', Validators.compose([Validators.required, CoreValidator.isPhone])],
			user_email: ['', Validators.compose([Validators.required, CoreValidator.isEmail])],
			shipping_company: [''],
			shipping_address_1: ['', Validators.required],
			shipping_address_2: [''],
			shipping_city: ['', Validators.required],
			shipping_phone: ['', Validators.required],
			shipping_store: ['', Validators.required],
			shipping_reference: [''],
			card_type: ['', Validators.required],
			card_number: ['', Validators.compose([CreditCardValidator.validateCardNumber, Validators.required]) ],
			card_expDate: ['', Validators.required],
			card_cvv:['', Validators.required],
			password: ['', Validators.required],
			repass: ['', Validators.compose([Validators.required, CoreValidator.confirmPassword])],
			additionalComments: [''],
			terms: [false, CoreValidator.isChecked]
		});
		this.getData();
	}
	ionViewDidEnter() {
		if (this.isCache) this.getData();
		else this.isCache = true;
	}
	getData() {
		this.storage.get('workingDeliveryAddress').then(val => {
			let data = val;
			this.formAddress.patchValue({
				shipping_address_1: data["shipping_address_1"],
				shipping_store: data["shipping_store"],
				shipping_latitude: data["shipping_latitude"],
				shipping_longitude: data["shipping_longitude"],
			});
		});
		/*
		this.storageMul.get(['login', 'useBilling', 'user']).then(val => {
			
			if (val['useBilling'] == false) this.useBilling = false;
			else this.useBilling = true;
			if (val['user']) {
				this.data = val['user'];
				this.changeCountryBilling(this.data['billing_country']);
				this.changeCountryShipping(this.data['shipping_country']);
			}
			this.reset();
		});*/
	}
	reset() {
		this.formAddress.patchValue({
			billing_first_name: this.data["billing_first_name"],
			billing_last_name: this.data["billing_last_name"],
			billing_company: this.data["billing_company"],
			billing_address_1: this.data["billing_address_1"],
			billing_address_2: this.data["billing_address_2"],
			billing_city: this.data["billing_city"],
			billing_phone: this.data["billing_phone"],
			user_email: this.data["user_email"],
			shipping_company: this.data["shipping_company"],
			shipping_address_1: this.data["shipping_address_1"],
			shipping_address_2: this.data["shipping_address_2"],
			shipping_city: this.data["shipping_city"],
			shipping_phone: this.data["shipping_phone"],

		});
		this.rawData = Object.assign({}, this.formAddress.value);
	}
	updateShipping() {
		if (this.useBilling) {
			this.formAddress.patchValue({
				shipping_company: this.formAddress.value["billing_company"],
				shipping_address_1: this.formAddress.value["billing_address_1"],
				shipping_address_2: this.formAddress.value["billing_address_2"],
				shipping_city: this.formAddress.value["billing_city"],
				shipping_phone: this.formAddress.value["billing_phone"]
			});
		}
	}
	checkUseBilling() {
		if (this.useBilling) this.updateShipping();
	}
	changeCountryBilling(e) {
		if (this.states[e]) {
			console.log('Billing 1');
			this.statesBilling = this.states[e];
			this.billingStateRequired = true;
			this.formAddress.patchValue({ billing_state: '' });
		} else {
			this.statesBilling = null;
			console.log('Billing 2');
			this.billingStateRequired = false;
			this.formAddress.patchValue({ billing_state: '' });
		}
		if (this.useBilling) this.formAddress.patchValue({
			shipping_country: this.formAddress.value["billing_country"]
		});
	}
	changeCountryShipping(e) {
		if (this.states[e]) {
			console.log('Shipping 1');
			this.statesShipping = this.states[e];
			this.shippingStateRequired = true;
			this.formAddress.patchValue({ shipping_state: '' });
		} else {
			console.log('Shipping 2');
			this.statesShipping = null;
			this.shippingStateRequired = false;
			this.formAddress.patchValue({ shipping_state: '' });
		}
	}

	changeBillingState(e) {
		if (this.useBilling) this.formAddress.patchValue({
			shipping_state: this.formAddress.value["billing_state"]
		});
	}

	confirm() {
		this.storage.get('cart').then(val => {
            let data = val;

            let products: Object[] = [];
            
            new ObjectToArray().transform(data).forEach(product => {
                let now = {};
                now['product_id'] = product['id'];
                now['quantity'] = product['quantity'];
                products.push(now);
            });
            
            let formValue = this.formAddress.value;

            let headers = new Headers();
            let params = {};
		
			let order = {
				user_email: this.formAddress.get('user_email').value,
				user_pwd: this.formAddress.get('password').value,
                payment_method: 'payme',
                payment_method_title: 'Tarjeta de Crédito o Débito - Alignet',
                set_paid: false,
                billing: {
                    first_name: this.formAddress.get('billing_first_name').value,
                    last_name: this.formAddress.get('billing_last_name').value,
                    address_1: this.formAddress.get('billing_address_1').value,
                    address_2: this.formAddress.get('billing_address_2').value,
                    city: this.formAddress.get('billing_city').value,
                    state: 'G',
                    postcode: '',
                    country: 'EC',
                    email: this.formAddress.get('user_email').value,
                    phone: this.formAddress.get('billing_phone').value
                },
                shipping: {
                    first_name: this.formAddress.get('billing_first_name').value,
                    last_name: this.formAddress.get('billing_last_name').value,
                    address_1: this.formAddress.get('shipping_address_1').value,
                    address_2: this.formAddress.get('shipping_address_2').value,
                    city: 'Guayaquil',
                    state: 'G',
                    postcode: '',
                    country: 'EC'
                },
                line_items: products,
                shipping_lines: [
                    {
                        method_id: 'gacela',
                        method_title: 'Gacela',
                        total: 3
                    }
				],
				payment: {
					cardType: this.formAddress.get('card_type').value,
					cardNumber: this.formAddress.get('card_number').value,
					cardExpDate: this.formAddress.get('card_expDate').value,
					cardCvv: this.formAddress.get('card_cvv').value,
				},
                meta_data: [
					{
                        key: '_billing_document_type',
                        value: this.formAddress.get('document_type').value
                    },
                    {
                        key: '_billing_document_number',
                        value: this.formAddress.get('document_number').value
                    },
                    {
                        key: '_shipping_latitude',
                        value: this.formAddress.get('shipping_latitude').value
                    },
                    {
                        key: '_shipping_longitude',
                        value: this.formAddress.get('shipping_longitude').value
                    },
                    {
                        key: '_shipping_reference',
                        value: this.formAddress.get('shipping_reference').value
                    },
                    {
                        key: '_shipping_phone',
                        value: this.formAddress.get('shipping_phone').value
                    },
                    
                ],
                comments: this.formAddress.get('additionalComments').value
            };
			params['data'] = JSON.stringify(order);
            this.core.showLoading();
            this.http.post(wordpress_url + '/wp-json/delportal/v1/anonymous_order', this.core.objectToURLParams(params), {
               
            }).subscribe(res => {
                this.core.hideLoading();
                let retValue = res.json();
                if (retValue['result'] == 0) {
                    this.storage.remove('cart').then(() => { 
                        this.thankyou(retValue['id']);
                    });
                } else {

                    let alert = this.alertCtrl.create({
                        title: 'Ocurrió un error al procesar su orden',
                        subTitle: retValue['result'] + retValue['message'],
                        buttons: ['Ok']
                      });
                      alert.present();
                }
            }, err => {
                console.log('Checkout process err', err);
                this.core.hideLoading();
                this.toast.showLongBottom("Ocurrió un error").subscribe(
                    toast => { },
                    error => { console.log(error); }
                );
                
            });
        });
	}


    thankyou(orderId) {
        this.navCtrl.push(this.ThanksPage, { id: orderId});
    }


	gotoCheckout() {
		if (this.navCtrl.getPrevious() && this.navCtrl.getPrevious().component == this.CheckoutPage)
			this.navCtrl.pop();
		else {
			this.navCtrl.push(this.CheckoutPage).then(() => {
				this.navCtrl.remove(this.navCtrl.getActive().index - 1);
			});
		}
	}
	location() {
		if (!this.platform.is('cordova')) return;
		this.core.showLoading();
		this.LocationAccuracy.canRequest().then(can => {
			if ((!can && this.Device.platform == 'iOS') || (can && this.Device.platform == 'Android')) {
				this.LocationAccuracy.request(this.LocationAccuracy.REQUEST_PRIORITY_HIGH_ACCURACY).then(() => {
					this.Geolocation.getCurrentPosition({ enableHighAccuracy: true }).then(resp => {
						let latlng;
						if (resp['coords']) latlng = resp['coords']['latitude'] + ',' + resp['coords']['longitude'];
						if (!latlng) return;
						this.http.get('http://maps.google.com/maps/api/geocode/json?latlng=' + latlng).subscribe(res => {
							if (res.json()['status'] == 'OK' && res.json()['results']) {
								let address = res.json()['results'][0];
								let city;
								let country;
								address['address_components'].forEach(component => {
									if (component['types'].indexOf('administrative_area_level_1') != -1)
										city = component['long_name'];
									if (component['types'].indexOf('country') != -1)
										country = component['short_name'];
								});
								this.formAddress.patchValue({
									billing_address_1: address['formatted_address'],
									billing_city: city,
									billing_country: country
								});
							}
						});
						this.core.hideLoading();
					}).catch((error) => {
						this.core.hideLoading();
					});
				}, err => this.core.hideLoading());
			} else {
				this.Diagnostic.requestLocationAuthorization('always').then(res => {
					if (res) this.location();
				});
				this.core.hideLoading();
			}
		});
	}

	checkCustomer(){
		if (this.formAddress.get('document_number').value == '')
			return;
		this.dp.getCustomerData(this.formAddress.get('document_number').value).then((customer) => {
			if (customer['id'] > 0) {
                let names = customer['name'].split(" ",1);
				this.formAddress.patchValue({
                    billing_first_name: names[0],
                    billing_last_name: names[1],
					user_email: customer['email'],
					billing_address_1: customer['address'],
					billing_city: customer['city'],
					billing_phone: customer['phone']
				});
				this.checkUseBilling();
			}
		});
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

							this.formAddress.patchValue(
								{
									card_number: this.card.cardNumber
								}
							);
						});
					}
				});
	}
}
