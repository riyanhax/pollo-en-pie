import { Component, ViewChild } from '@angular/core';
import { NavController } from 'ionic-angular';
import { Http } from '@angular/http';

// Custom
import { Core } from '../../service/core.service';
import { Storage } from '@ionic/storage';
// Page
import { DetailCategoryPage } from '../detail-category/detail-category';
import { SearchPage } from '../search/search';
import { StorePage } from '../store/store';

declare var wordpress_url:string;

@Component({
	selector: 'page-categories',
	templateUrl: 'categories.html',
	providers: [Core]
})
export class CategoriesPage {
	@ViewChild('cart') buttonCart;
	DetailCategoryPage = DetailCategoryPage;
	SearchPage = SearchPage;
	StorePage = StorePage;
	parents:Object[] = [];
	id:Number;
	noResuilt:boolean = false;
	constructor(
		private http: Http,
		private core: Core,
		private storage: Storage,
		private navCtrl: NavController
	){
		storage.get('allCats').then(allCats => {
			if (allCats != null){
				this.parents = allCats.filter((cat) => cat['parent'] == 0);
			} else {
				core.showLoading();
				let params = {cat_num_page:1, cat_per_page:100};
				let loadCategories = () => {
					http.get(wordpress_url+'/wp-json/wooconnector/product/getcategories', {
						search:core.objectToURLParams(params)
					}).subscribe(res => {
						if (!res.json()){
							this.noResuilt = true;
						} else {
							let siteCats : Object[] = res.json();
							storage.set('allCats', siteCats);
							this.parents = siteCats.filter((cat) => cat['parent'] == 0);
						}
						core.hideLoading();
						/*this.parents = this.parents.concat(res.json());
						if(res.json() && res.json().length == 100){
							this.noResuilt = false;
							params.cat_num_page++;
							loadCategories();
						} else {
							
							core.hideLoading();
						}*/
					});
				};
				loadCategories();
			}
		});

		
		
		
	}
	ionViewDidEnter(){
		this.buttonCart.update();
	}
	onSwipeContent(e){
		if(e['deltaX'] < -150 || e['deltaX'] > 150){
			if(e['deltaX'] < 0) this.navCtrl.push(this.SearchPage);
			else this.navCtrl.popToRoot();
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