import { Component, ViewChild } from '@angular/core';
import { NavController, NavParams, AlertController } from 'ionic-angular';
import { Http, Headers } from '@angular/http';
import { Content } from 'ionic-angular';

// Custom
import { Storage } from '@ionic/storage';
import { Core } from '../../service/core.service';
import { Toast } from '@ionic-native/toast';
import { TranslateService } from '../../module/ng2-translate';
import { DetailPage } from '../detail/detail';

declare var wordpress_url: string;
declare var date_format: string;

@Component({
	selector: 'page-detail-order',
	templateUrl: 'detail-order.html',
	providers: [Core]
})
export class DetailOrderPage {
    @ViewChild('cart') buttonCart;
	DetailPage = DetailPage;
	id: Number; login: Object; data: Object;
	date_format: string = date_format;
	@ViewChild(Content) content: Content;
    trans: Object;
    cartArray: Object = {};

	constructor(
		private navCtrl: NavController,
		navParams: NavParams,
		private http: Http,
		public storage: Storage,
		private core: Core,
		translate: TranslateService,
		private Toast: Toast,
		private alertCtrl: AlertController
	) {
		translate.get('detailOrder.popup_cancel').subscribe(trans => this.trans = trans);
		this.id = navParams.get('id');
		core.showLoading();
		storage.get('login').then(val => {
			if (val && val['token']) {
				this.login = val;
				this.getData();
			} else navCtrl.pop();
		});
	}
	getData() {
		this.core.showLoading();
		let headers = new Headers();
		headers.set('Content-Type', 'application/x-www-form-urlencoded; charset=UTF-8');
		headers.set('Authorization', 'Bearer ' + this.login["token"]);
		this.http.get(wordpress_url + '/wp-json/wooconnector/order/getorderbyid?order=' + this.id, {
			headers: headers,
			withCredentials: true
		}).subscribe(res => {
			this.data = res.json();
			this.core.hideLoading();
			this.content.resize();
		});
	}
	changeStatus() {
		let alert = this.alertCtrl.create({
			message: this.trans['message'],
			cssClass: 'alert-no-title alert-cancel-order',
			buttons: [
				{
					text: this.trans['no']
				},
				{
					text: this.trans['yes'],
					cssClass: 'primary',
					handler: () => {
						this.core.showLoading();
						let params = this.core.objectToURLParams({ order: this.id });
						let headers = new Headers();
						headers.set('Content-Type', 'application/x-www-form-urlencoded; charset=UTF-8');
						headers.set('Authorization', 'Bearer ' + this.login["token"]);
						this.http.post(wordpress_url + '/wp-json/wooconnector/order/changestatus', params, {
							headers: headers,
							withCredentials: true
						}).subscribe(res => {
							this.core.hideLoading();
							if (res.json()['result'] == 'success') {
								this.Toast.showShortBottom(this.trans["success"]).subscribe(
									toast => { },
									error => { console.log(error); }
								);
								this.navCtrl.pop();
							} else {
								this.Toast.showShortBottom(this.trans["fail"]).subscribe(
									toast => { },
									error => { console.log(error); }
								);
							}
						});
					}
				}
			]
		});
		alert.present();
	}
	
    repeatOrder(){
        let productsToCart: Object[] = [];
		for (let index = 0; index < this.data['line_items'].length; index++) {
			let dataP: any = {};
			const detail = this.data['line_items'][index];
			let idCart = detail["id"];
			dataP.idCart = idCart;
			dataP.id = detail["id"];
			dataP.name = detail["name"];
			if (detail["medium_image"] != "")
                dataP.images = detail["medium_image"];
            dataP.regular_price = detail["regular_price"];
			dataP.sale_price = detail["sale_price"];
			dataP.price = detail["price"];
			dataP.quantity = detail['qty'];
			dataP.sold_individually = detail['sold_individually'];
			dataP.pvp = detail['pvp'];
			dataP.tax = detail['tax'];
			productsToCart = productsToCart.concat(dataP);
		}

		this.storage.get('cart').then((val) => {
			if (!val) val = {};
			for (let index = 0; index < productsToCart.length; index++) {
				const element = productsToCart[index];

				if (val[element['id']]) {
					val[element['id']]['quantity'] += element['quantity'];
				} else {
					val[element['id']] = element;
				}

			}

			this.storage.set('cart', val).then(() => {
				this.checkCart();
				this.buttonCart.update();
				this.Toast.showShortBottom(this.trans["add"]).subscribe(
					toast => { },
					error => { console.log(error); }
				);
			});

		});
    }

    checkCart() {
		this.storage.get('cart').then(val => {
			let cartNew = Object.assign([], val);
			this.cartArray = {};
			cartNew.forEach(productCart => {
				this.cartArray[productCart['id']] = productCart['id'];
			});
		});
	}
}
