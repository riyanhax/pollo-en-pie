import { Component, ViewChild } from '@angular/core';

import { Content, NavController, NavParams } from 'ionic-angular';
import { Http, Headers } from '@angular/http';

// Page
import { OrderPage } from '../order/order';
import { Storage } from '@ionic/storage';
import { OrderStatusDetailPage } from '../order-status-detail/order-status-detail';

import { Core } from '../../service/core.service';
import { StorePage } from '../store/store';

declare var wordpress_url: string;
declare var date_format: string;


@Component({
	selector: 'page-thanks',
	templateUrl: 'thanks.html'
})
export class ThanksPage {
	OrderStatusDetailPage = OrderStatusDetailPage;
	StorePage = StorePage;
	date_format: string = date_format;
	id:string; 
	isLogin:boolean;
	login: Object = {};
	order: Object = {};
	@ViewChild(Content) content: Content;
	
	constructor(private navCtrl: NavController, 
		navParams: NavParams, 
		private http: Http,
		private storage: Storage, 
		private core: Core) {
		this.id = navParams.get('id');
		
		
		
	}

	ionViewDidEnter(){
		this.storage.get('login').then(val => {
			if (val && val['token']) {
				this.login = val;
				this.getData();
			} else this.navCtrl.pop();
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
			let data = res.json();

			this.order = {
				id: data['id'],
				date: data['date_created'],
				delivery_address: data['shipping']['address_1'],
				delivery_contact: data['shipping']['first_name'],
				payment_method: data['credit_card'],
				order_number: data['id'],
				amount: data['total'],
				transaction_id: data['transaction_id']
			}

			this.core.hideLoading();
			this.content.resize();
		});
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
