import { Component, ViewChild } from '@angular/core';
import { NavController, AlertController } from 'ionic-angular'
import { Http, Headers } from '@angular/http';

// Custom
import { Storage } from '@ionic/storage';
import { StorageMulti } from '../../service/storage-multi.service';
import { Toast } from '@ionic-native/toast';
import { TranslateService } from '../../module/ng2-translate';
import { Core } from '../../service/core.service';
import { Config } from '../../service/config.service';

//Pipes
import { ObjectToArray } from '../../pipes/object-to-array';

// Page
import { AddressPage } from '../address/address';
import { OrderCheckoutPage } from '../order-checkout/order-checkout';
import { LoginPage } from '../login/login';
import { DetailPage } from '../detail/detail';

import { StorePage } from '../store/store';
import { Delportal } from '../../service/delportal.service';

declare var wordpress_url;
declare var display_mode;

@Component({
	selector: 'page-cart',
	templateUrl: 'cart.html',
	providers: [StorageMulti, Core, ObjectToArray]
})
export class CartPage {
	@ViewChild('cart') buttonCart;
	AddressPage = AddressPage;
	LoginPage = LoginPage;
	DetailPage = DetailPage;
	OrderCheckoutPage = OrderCheckoutPage;
	
	data: Object;
	tax: Number = 0;
	coupon: String[] = []; couponData: Object[];
	login: Object;
	trans: Object = {};
	isCache: boolean;
	couponCode: String;
	invalid: boolean;
	check_require_login:boolean;
	shipping_cost:Number;
	checkCart: boolean = false;
	shoppingLists: Object[] = [];

	constructor(
		private storage: Storage,
		private storageMul: StorageMulti,
		private navCtrl: NavController,
		private http: Http,
		private alertCtrl: AlertController,
		private core: Core,
		translate: TranslateService,
		private Toast: Toast,
		config: Config,
		private dp: Delportal
	) {
		translate.get('cart').subscribe(trans => this.trans = trans);
		this.getData();
		if (config['required_login']) this.check_require_login = config['required_login'];
		if (config['shipping_cost']) this.shipping_cost = config['shipping_cost'];
	}
	ionViewDidEnter() {
		if (this.isCache) this.getData();
		else this.isCache = true;
	}
	getData() {
		this.storageMul.get(['cart', 'coupon', 'login', 'userShoppingLists']).then((val) => {
			if (val && val['cart']) this.data = val['cart'];
			else this.checkCart = true;
			
			if (val && val['coupon']) this.coupon = val['coupon'];
			this.login = val['login'];
			if (this.data && Object.keys(this.data).length > 0) this.validate();

			if (val['userShoppingLists'] == null)
				this.shoppingLists = []
			else this.shoppingLists = val['userShoppingLists'];
		});
	}
	shop() {
		this.navCtrl.setRoot(StorePage);
	}
	delete(id: string) {
		let data = Object.assign({}, this.data);
		delete data[id];
		this.data = data;
		this.update();
		this.buttonCart.update();
	}
	update() {
		if (Object.keys(this.data).length > 0) {
			this.storage.set('cart', this.data).then(() => { 
				this.validate(); 
			});
		} else {
			this.storage.remove('cart').then(() => { 
				console.log('empty cart');
				this.checkCart = true;
			});
		}
		
	}
	emptyCart(){
		this.data = {};
		this.storage.remove('cart').then(() => { 
			this.checkCart = true;
		});
	}
	validate() {
		
		let params = {};
		let products: Object[] = [];
		new ObjectToArray().transform(this.data).forEach(product => {
			let now = {};
			now['product_id'] = product['id'];
			now['quantity'] = product['quantity'];
			if (product['variation_id']) now['variation_id'] = product['variation_id'];
			products.push(now);
		});
		if (this.coupon.length <= 0) return;
		this.core.showLoading();
		params['products'] = JSON.stringify(products);
		params['coupons'] = JSON.stringify(this.coupon);
		let option = {};
		if (this.login && this.login['token']) {
			let headers = new Headers();
			headers.set('Content-Type', 'application/x-www-form-urlencoded; charset=UTF-8');
			headers.set('Authorization', 'Bearer ' + this.login["token"]);
			option['withCredentials'] = true;
			option['headers'] = headers;
		}
		this.http.post(wordpress_url + '/wp-json/wooconnector/calculator/addcoupons', this.core.objectToURLParams(params), option)
			.subscribe(res => {
				let resp = res.json();
				this.core.hideLoading();
				this.tax = 0;
				if (resp['errors']) {
					let message: string = '';
					let data = Object.assign({}, this.data);
					for (var key in resp['errors']) {
						if (resp['errors'][key] && resp['errors'][key]['code'] == 'rest_product_error') {
							delete data[key];
							this.data = data;
							this.update();
						}
						if (resp['errors'][key] && resp['errors'][key]['errors']) {
							for (var key1 in resp['errors'][key]['errors']) {
								if (resp['errors'][key]['errors'][key1]) {
									message += resp['errors'][key]['errors'][key1][0];
								}
							}
						}
						if (resp['errors'][key] && resp['errors'][key]['message']) {
								message += resp['errors'][key]['message'];
						}
					}
					if (resp['discount']) {
						let coupon = [];
						resp['discount'].forEach(item => {
							coupon.push(item['code']);
						});
						this.storage.set('coupon', coupon).then(() => {
							this.coupon = coupon;
						});
					}
					this.couponData = [];
					this.coupon.forEach(item => {
						this.couponData.push({ code: item });
					});
					this.showAlert(message);
				} else this.invalid = false;
				if (resp['discount']) {
					if (Array.isArray(resp['tax'])) resp['tax'].forEach(tax => this.tax += tax['value']);
					this.couponData = resp['discount'];
				} else if (resp['total']) {
					resp['total'].forEach(product => this.tax += product['tax']);
				}
			}, error => {
				if (error.json()['message']) {
					this.couponData = [];
					this.coupon.forEach(item => {
						this.couponData.push({ code: item });
					});
					this.invalid = true;
					this.core.hideLoading();
					this.showAlert(error.json()['message']);
				}
			});
	}
	saveList(){
		let alert = this.alertCtrl.create({
			title: "Guardar como Lista",
			cssClass: 'alert-no-title',
			inputs: [
				{
					name: 'listName',
					placeholder: 'Ingresa el nombre de la nueva lista'
				}
			],
			buttons: [
			  {
				text: this.trans["confirm"]["no"],
				role: 'cancel'
			  },
			  {
				text: this.trans["confirm"]["yes"],
				handler: (data) => {
					let productsToSave : Object[] = [];

					for (var key in this.data) {
						let product = this.data[key];
						productsToSave = productsToSave.concat({ productId: product.id, qty: product.quantity});
					}

					this.dp.addUserShoppingList(this.login, data.listName, productsToSave).then((sl) => {
						this.Toast.showShortBottom(this.trans["add"]).subscribe(
							toast => { },
							error => { console.log(error); }
						);
					});

                    
				}
			  }
			]
		});
		alert.present();
	}
	showAlert(message: string) {
		if (message == 'Sorry, Coupon only one.') {
			message +=  this.trans["remove_couponOnly"];
			let alert = this.alertCtrl.create({
				message: message,
				cssClass: 'alert-no-title',
				buttons: [
			      {
			        text: this.trans["confirm"]["no"],
			        role: 'cancel'
			      },
			      {
			        text: this.trans["confirm"]["yes"],
			        handler: () => {
			          	this.coupon = [];
                        this.couponData = [];
                        this.storage.remove('coupon');
                        this.apply();
			        }
			      }
			    ]
			});
			alert.present();
		} else {
			if (message) {
				let alert = this.alertCtrl.create({
				message: message,
				cssClass: 'alert-no-title',
				buttons: [
						{
							text: this.trans['validate'],
							 handler: () => {
					          	this.couponCode = '';
					        }
						}
					]
				});
				alert.present();
			}
		}
	}
	apply() {
		if (this.couponCode && this.coupon.indexOf(this.couponCode) != -1) {
			this.Toast.showShortBottom(this.trans["already_applied"]).subscribe(
				toast => { },
				error => { console.log(error); }
			);
			return;
		}
		this.core.showLoading();
		let params = {};
		let products: Object[] = [];
		new ObjectToArray().transform(this.data).forEach(product => {
			let now = {};
			now['product_id'] = product['id'];
			now['quantity'] = product['quantity'];
			if (product['variation_id']) now['variation_id'] = product['variation_id'];
			products.push(now);
		});
		params['products'] = JSON.stringify(products);
		let coupon: String[];
		if (this.couponCode && this.coupon.indexOf(this.couponCode) == -1) coupon = this.coupon.concat(this.couponCode);
		else coupon = this.coupon.slice();
		params['coupons'] = JSON.stringify(coupon);
		let option = {};
		if (this.login && this.login['token']) {
			let headers = new Headers();
			headers.set('Content-Type', 'application/x-www-form-urlencoded; charset=UTF-8');
			headers.set('Authorization', 'Bearer ' + this.login["token"]);
			option['withCredentials'] = true;
			option['headers'] = headers;
		}
		this.http.post(wordpress_url + '/wp-json/wooconnector/calculator/addcoupons', this.core.objectToURLParams(params), option)
			.subscribe(res => {
				let resp = res.json();
				this.core.hideLoading();
				// this.tax = 0;
				if (resp['errors']) {
					let message: string = '';
					for (var key in resp['errors']) {
						if (resp['errors'][key] && resp['errors'][key]['errors']) {
							for (var key1 in resp['errors'][key]['errors']) {
								if (resp['errors'][key]['errors'][key1]) {
									message += resp['errors'][key]['errors'][key1][0];
								}
							}
						}
					}
					this.showAlert(message);
				} else {
					if (resp['discount']) {
						if (Array.isArray(resp['tax'])) resp['tax'].forEach(tax => this.tax += tax['value']);
						this.storage.set('coupon', coupon).then(() => {
							this.coupon = coupon;
							this.couponData = resp['discount'];
							this.couponCode = null;
							this.Toast.showShortBottom(this.trans["add"]).subscribe(
								toast => { },
								error => { console.log(error); }
							);
						});
					} else {
						resp['total'].forEach(product => this.tax += product['tax']);
					}
				}
			}, error => {
				if (error.json()['message']) {
					this.core.hideLoading();
					let alert = this.alertCtrl.create({
						message: error.json()['message'],
						cssClass: 'alert-no-title',
						buttons: [this.trans['validate']]
					});
					alert.present();
				}
			});
	}
	remove(index: Number) {
		if (this.coupon.length == 1) {
			this.storage.remove('coupon').then(() => {
				this.coupon = [];
				this.couponData = [];
				this.validate();
				this.Toast.showShortBottom(this.trans["remove"]).subscribe(
					toast => { },
					error => { console.log(error); }
				);
			});
		} else {
			let coupon = this.coupon.slice(0);
			coupon.splice(Number(index), 1);
			this.storage.set('coupon', coupon).then(() => {
				this.coupon.splice(Number(index), 1);
				this.couponData.splice(Number(index), 1);
				this.validate();
				this.Toast.showShortBottom(this.trans["remove"]).subscribe(
					toast => { },
					error => { console.log(error); }
				);
			});
		}
	}
	total(): Number {
		let total = 0;
		let tax = 0;
		for (var key in this.data) {
			let product = this.data[key];
			tax += Number(product.tax) * product.quantity;
			if (Number(product.sale_price) > 0) {
				total += Number(product.sale_price) * product.quantity;
			} else {
				total += Number(product.regular_price) * product.quantity;
			}
		}
		this.tax = tax;
		return total;
	}
	totalPvp(): Number {
		let total = 0;
		for (var key in this.data) {
			let product = this.data[key];
			if (Number(product.pvp) > 0) {
				total += Number(product.pvp) * product.quantity;
			}
		}
		return total;
	}
	gotoAddress() {
		
		
			if (this.login) this.navCtrl.push(this.OrderCheckoutPage);
			else{
				let alert = this.alertCtrl.create({
					message: this.trans['confirm']['message'],
					cssClass: 'alert-no-title alert-signout',
					buttons: [
						{
							text: this.trans['confirm']["cancel"],
							cssClass: 'gray',
							role: 'cancel',
							handler: () => {
								
							}
						},
						{
							text: this.trans['confirm']["continue"],
							cssClass: 'green3',
							handler: () => {
								this.navCtrl.push(this.LoginPage);
							}
						}
					]
				});
				alert.present();
			} 
		
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