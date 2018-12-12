import { Component, ViewChild } from '@angular/core';
import { NavController, NavParams, AlertController } from 'ionic-angular';
import { Http } from '@angular/http';
import { Observable } from 'rxjs/Observable';

// Custom
import { Core } from '../../service/core.service';
import { Storage } from '@ionic/storage';
import { TranslateService } from '../../module/ng2-translate';
import { Toast } from '@ionic-native/toast';

//Pipes
import { ObjectToArray } from '../../pipes/object-to-array';

// Page
import { DetailPage } from '../detail/detail';
import { StorePage } from '../store/store';
import { SearchPage } from '../search/search';

import { Delportal } from '../../service/delportal.service';
import { ShoppingListSchedulePage } from '../shopping-list-schedule/shopping-list-schedule';
import { DelportalDb } from '../../service/delportal.db.service';
import { DelportalSearchService } from '../../service/delportal.search.service';
import { BarcodeScanner } from '@ionic-native/barcode-scanner';

declare var wordpress_url: string;
declare var wordpress_per_page: Number;

@Component({
	selector: 'page-detail-shopping-list',
	templateUrl: 'shopping-list-detail.html',
	providers: [Core, ObjectToArray]
})
export class DetailShoppingListPage {
	@ViewChild('cart') buttonCart;
	ShoppingListSchedule = ShoppingListSchedulePage;
	DetailPage = DetailPage;
	StorePage = StorePage;
	SearchPage = SearchPage;
	keyword: string;
	id: Number; page = 1; sort: string = '-date'; range: Object = { lower: 0, upper: 0 };
	data: Object = {}; favorite: Object = {}; products: Object[] = []; attributes: Object[] = [];
	filter: Object = { grid: false, open: null, value: {}, valueCustom: {} }; filtering: boolean;
	loaded: boolean; over: boolean;
	noResuilt: boolean = false; quantity: Number = 1; trans: Object = {};
	actionCart: Object = [];
	cartArray: Object = {};
	login: Object;
	isSuscription: Boolean = false;
	shoppingLists: Object[] = [];
	currentShoppingList: Object = {};
	tax: Number = 0;
	suscriptionText: string;
	searching: boolean = false;
	searchItems: Object[] = [];

	constructor(
		private navParams: NavParams,
		private core: Core,
		private http: Http,
		private storage: Storage,
		translate: TranslateService,
		private alertCtrl: AlertController,
		private Toast: Toast,
		private navCtrl: NavController,
		private dp: Delportal,
		private dpdb: DelportalDb,
		public dpSearch: DelportalSearchService,
		private barcodeScanner: BarcodeScanner
	) {

		translate.get('detail').subscribe(trans => this.trans = trans);
		this.id = navParams.get('id');

	}
	ionViewDidEnter() {
		this.checkCart();
		this.getShoppingLists();
		this.buttonCart.update();
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


	getShoppingLists() {
		this.storage.get('login').then(val => {
			this.login = val;
			console.log(this.id);
			this.id = this.navParams.get('id');
			console.log(this.id);
			
			this.dp.getShoppingList(val, this.id).then(sl => {
				this.currentShoppingList = sl;

				this.isSuscription = this.currentShoppingList['type'] == 'sync';
				this.data = this.currentShoppingList['products'];
				let product_ids: Object[] = [];
				if (this.currentShoppingList['products'] && this.currentShoppingList['products'].length > 0) {
					for (let index = 0; index < this.currentShoppingList['products'].length; index++) {
						const element = this.currentShoppingList['products'][index];
						product_ids = product_ids.concat(element['productId']);
					}
				}
				
				if (this.currentShoppingList['type'] == 'sync') {
					this.suscriptionText = this.currentShoppingList['recurrence_number'];
					if (this.currentShoppingList['recurrence'] == 'daily') {
						this.suscriptionText += ' día(s)';
					}
					if (this.currentShoppingList['recurrence'] == 'weekly') {
						this.suscriptionText += ' semana(s)';
					}
					if (this.currentShoppingList['recurrence'] == 'monthly') {
						this.suscriptionText += ' mes(es)';
					}

					this.suscriptionText += ' a partir del ' + this.currentShoppingList['startDate'] + ' al ' + this.currentShoppingList['endDate'];


				}

				if (product_ids.length > 0) {
					this.core.showLoading();
					let pinL = this.currentShoppingList['products'];
					this.products = [];
					this.dpdb.getProductsById(product_ids.join()).then((products) => {
						products.forEach(p => {
							let singlep = pinL.find((pl) => pl['productId'] == p['id']);

							if (singlep) {
								p['qty'] = singlep['qty'];
							}
							this.products = this.products.concat(p);
						});
						this.core.hideLoading();
					});
					this.noResuilt = false;
				} else {
					this.noResuilt = true;
				}
			});
		});
	}
	getProducts(): Observable<Object[]> {
		return new Observable(observable => {
			let tmpFilter = [];
			for (var filter in this.filter['value']) {
				let attr = this.filter['value'][filter];
				if (Object.keys(attr).length > 0) for (var option in attr) {
					if (attr[option]) {
						let now = {};
						now['keyattr'] = filter;
						now['valattr'] = option;
						now['type'] = 'attributes';
						tmpFilter.push(now);
					}
				};
			}
			for (var filter in this.filter['valueCustom']) {
				let attr = this.filter['value'][filter];
				if (attr && Object.keys(attr).length > 0) for (var option in attr) {
					if (attr[option]) {
						let now = {};
						now['keyattr'] = filter;
						now['valattr'] = option;
						now['type'] = 'custom';
						tmpFilter.push(now);
					}
				};
			}
			let params = {
				'post_category': this.id.toString(),
				'post_num_page': this.page,
				'post_per_page': wordpress_per_page,
			}
			let sortParams = this.core.addSortToSearchParams(params, this.sort);
			if (tmpFilter.length == 0 && !this.range['lower'] && !this.range['upper']) {
				this.http.get(wordpress_url + '/wp-json/wooconnector/product/getproduct', {
					search: this.core.objectToURLParams(params)
				}).subscribe(products => {
					observable.next(products.json());
					observable.complete();
				});
			} else {
				if (tmpFilter.length > 0) params['attribute'] = JSON.stringify(tmpFilter);
				if (this.range['lower'] != 0) params['min_price'] = this.range['lower'];
				if (this.range['upper'] != 0) params['max_price'] = this.range['upper'];
				this.http.get(wordpress_url + '/wp-json/wooconnector/product/getproductbyattribute', {
					search: this.core.objectToURLParams(params)
				}).subscribe(products => {
					observable.next(products.json());
					observable.complete();
				});
			}
		});
	}
	doRefresh(refresher) {
		this.page = 1;
		this.getProducts().subscribe(products => {
			if (products && products.length > 0) this.page++;
			this.products = [];
			this.products = products;
			this.over = false;
			refresher.complete();
		});
	}
	load(infiniteScroll) {
		this.getProducts().subscribe(products => {
			if (products && products.length > 0) {
				this.page++;
				this.products = this.products.concat(products);
			} else this.over = true;
			infiniteScroll.complete();
		});
	}
	openCategory() {
		if (this.filter['open'] == 'category') this.filter['open'] = null;
		else this.filter['open'] = 'category';
	}
	openFilter() {
		if (this.filter['open'] == 'filter') this.filter['open'] = null;
		else this.filter['open'] = 'filter';
	}
	openSort() {
		if (this.filter['open'] == 'sort') this.filter['open'] = null;
		else this.filter['open'] = 'sort';
	}
	changeFavorite(product: Object) {
		if (this.favorite[product["id"]]) {
			delete this.favorite[product["id"]];
			this.storage.set('favorite', this.favorite);
		} else {
			let data: any = {
				id: product["id"],
				name: product["name"],
				regular_price: product["regular_price"],
				sale_price: product["sale_price"],
				price: product["price"],
				on_sale: product["on_sale"],
				price_html: product["price_html"],
				type: product["type"]
			};
			if (product["modernshop_images"]) data['images'] = product["modernshop_images"][0].modern_square;
			this.favorite[product["id"]] = data;
			this.storage.set('favorite', this.favorite);
		}
	}
	reset() {
		this.filter['value'] = {};
		this.filter['valueCustom'] = {};
		this.attributes['attributes'].forEach(attr => {
			this.filter['value'][attr['slug']] = {};
		});
		this.attributes['custom'].forEach(attr => {
			this.filter['valueCustom'][attr['slug']] = {};
		});
		this.range = { lower: 0, upper: 0 };
	}
	runFilter() {
		this.openFilter();
		this.page = 1;
		this.products = [];
		this.loaded = false;
		this.filtering = true;
		this.core.showLoading();
		this.getProducts().subscribe(products => {
			if (products && products.length > 0) {
				this.page++;
				this.products = products;
				this.filtering = false;
				this.loaded = true;
				this.core.hideLoading();
			} else {
				this.core.hideLoading();
				this.noResuilt = true;
			}
		});
	}
	runSort() {
		this.filter['open'] = null;
		this.page = 1;
		this.products = [];
		this.loaded = false;
		this.core.showLoading();
		this.getProducts().subscribe(products => {
			if (products && products.length > 0) {
				this.page++;
				this.products = products;
				this.loaded = true;
				this.core.hideLoading();
			} else {
				this.core.hideLoading();
				this.noResuilt = true;
			}
		});
	}
	addToCart() {

		let productsToCart: Object[] = [];
		for (let index = 0; index < this.products.length; index++) {
			let data: any = {};
			const detail = this.products[index];
			let idCart = detail["id"];
			data.idCart = idCart;
			data.id = detail["id"];
			data.name = detail["name"];
			if (detail["medium_image"] != "")
				data.images = detail["medium_image"];
			data.regular_price = detail["regular_price"];
			data.sale_price = detail["sale_price"];
			data.price = detail["price"];
			data.quantity = detail['qty'];
			data.sold_individually = detail['sold_individually'];
			data.pvp = detail['pvp'];
			data.tax = detail['tax'];
			productsToCart = productsToCart.concat(data);
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





	goto(page: any) {

		if (!page) this.navCtrl.popToRoot();
		else {
			let previous = this.navCtrl.getPrevious();
			if (previous && previous.component == page) this.navCtrl.pop();
			else this.navCtrl.push(page);
		}

	}

	shop() {
		this.navCtrl.setRoot(StorePage);
	}

	delete(product: any) {
		var index = this.products.indexOf(product);
		this.products.splice(index,1);
		this.update();

	}

	saveList() {
		for (let index = 0; index < this.currentShoppingList['products'].length; index++) {
			const element = this.currentShoppingList['products'][index];
			let p = this.products.find(pr => pr['id'] == element['productId']);
			if (p) {
				element['qty'] = p['qty'];
			}
			this.currentShoppingList['products'][index] = element;
		}

		this.dp.updateUserShoppingList(this.login, this.currentShoppingList).then((ret) => {
			this.navCtrl.popToRoot();
		});
	}

	update() {

		this.total();
	}
	total(): Number {
		let total = 0;
		let tax = 0;

		for (var key in this.products) {
			let product = this.products[key];
			tax += Number(product['tax']) * product['qty'];
			if (Number(product['sale_price']) > 0) {
				total += Number(product['sale_price']) * product['qty'];
			} else {
				total += Number(product['regular_price']) * product['qty'];
			}
		}
		this.tax = tax;
		return total;
	}

	gotoSuscription() {

		this.navCtrl.push(this.ShoppingListSchedule, { id: this.currentShoppingList['id'] });
	}

	cancelSuscription() {
		this.dp.cancelUserShoppingList(this.login, this.id).then(() => {
			this.navCtrl.pop();
		});
	}

	searchTerms(){
		this.searching = true;
		this.dpSearch.getResults(this.keyword).then(val => {
			this.searchItems = val;
			this.searching = false;
		});
	}

	addToList(productId){
		this.dp.addProductToShoppingList(this.login, 
			this.id, 
			[{ id: productId, qty: 1 }]).then( (res) => {
				this.searchItems = [];
				this.keyword = '';
				this.getShoppingLists();

			});
	}

	openCamera() {
		this.barcodeScanner.scan().then(barcodeData => {
			var barCode = barcodeData.text;
			this.core.showLoading();
			this.dpdb.getProductByBarcode(barCode).then((products) => {
				products.forEach((p) => {
					if (p['id']){
						this.addToList(p['id']);
					}
				});
				this.core.hideLoading();
			});
		}).catch(err => {
			this.Toast.showShortBottom("Ocurrió un error").subscribe(
				toast => { },
				error => { console.log(error); }
			);
		});
	}

}