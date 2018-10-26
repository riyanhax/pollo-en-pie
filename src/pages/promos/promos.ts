import { Component } from '@angular/core';
import { Http } from '@angular/http';
import { IonicPage, NavController, NavParams } from 'ionic-angular';

import { Core } from '../../service/core.service';

/**
 * Generated class for the PromosPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

declare var wordpress_url: string;

@IonicPage()
@Component({
	selector: 'page-promos',
	templateUrl: 'promos.html',
})
export class PromosPage {
	slides: Object[];

	constructor(
		private http: Http,
		private core: Core,
		public navCtrl: NavController, 
		public navParams: NavParams) {
		this.getData();
	}

	ionViewDidLoad() {

	}
	getData(isRefreshing: boolean = false, refresher = null) {
		this.http.get(wordpress_url + '/wp-json/wooslider/product/getslider')
			.subscribe(res => {
				if (isRefreshing) delete this.slides;
				this.slides = res.json();
			});
	}

}
