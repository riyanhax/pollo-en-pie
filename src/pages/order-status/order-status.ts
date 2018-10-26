import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { OrderStatusDetailPage } from '../order-status-detail/order-status-detail';
import { StorePage } from '../store/store';
import { Http, Headers } from '@angular/http';
import { Core } from '../../service/core.service';
import { Storage } from '@ionic/storage';
import { Toast } from '@ionic-native/toast';
import { Observable } from 'rxjs/Observable';
import { LoginPage } from '../login/login';

/**
 * Generated class for the OrderStatusPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

declare var wordpress_url: string;
declare var date_format: string;
declare var wordpress_per_page: Number;
const wordpress_order = wordpress_url + '/wp-json/delportal/v1/pending_orders';

@IonicPage()
@Component({
	selector: 'page-order-status',
	templateUrl: 'order-status.html',
})
export class OrderStatusPage {
	pendingOrders: Object[] = [];
	OrderStatusDetailPage = OrderStatusDetailPage;
	StorePage = StorePage;
	page = 1; over: boolean;
	login: Object = {}; 
	user: Object = {};
	noOrder:boolean = false;
	notLoggedIn : boolean = true;
	LoginPage = LoginPage;

	constructor(public navCtrl: NavController, 
		public navParams: NavParams,
		private http: Http,
		private core: Core,
		private storage: Storage,
		private Toast: Toast
		) {

		this.page = 1;

		this.storage.get('login').then(val => {
			this.storage.get('user').then(userData => {
				this.user = userData;
			});
			
			if (val && val['token']) {
				this.login = val;
				this.notLoggedIn = false;
				this.getData().subscribe(orders => {
					if (orders.length > 0) {
						this.noOrder = false;
						this.page++;
						this.pendingOrders = orders;
					} else {
						this.noOrder = true;
					}
				});
			}
		});
	}

	getData(hide: boolean = false): Observable<Object[]> {
		return new Observable(observable => {
			if (!hide) this.core.showLoading();
			let params = { post_per_page: wordpress_per_page, post_num_page: this.page };
			let headers = new Headers();
			headers.set('Content-Type', 'application/x-www-form-urlencoded; charset=UTF-8');
			headers.set('Authorization', 'Bearer ' + this.login["token"]);
			this.http.get(wordpress_order, {
				search: this.core.objectToURLParams(params),
				headers: headers
			}).subscribe(res => {
				if (!hide) this.core.hideLoading();
				observable.next(res.json());
				observable.complete();
			}, err => {
				if (!hide) this.core.hideLoading();
				this.Toast.showShortBottom(err.json()["message"]).subscribe(
					toast => { },
					error => { console.log(error); }
				);
			});
		});
	}

	ionViewWillEnter() {
		if (this.login != null)
			this.getData();
	}

	shop() {
		this.navCtrl.setRoot(StorePage);
	}

	gotoLogin(){
		this.navCtrl.push(LoginPage);
	}

}
