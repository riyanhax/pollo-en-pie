import { Component, ViewChild } from '@angular/core';
import { Http, Headers } from '@angular/http';
import { Observable } from 'rxjs/Observable';
import { Content, TextInput, NavController, NavParams,  Searchbar } from 'ionic-angular';

// Custom
import { Core } from '../../service/core.service';
import { Storage } from '@ionic/storage';
import { Toast } from '@ionic-native/toast';
import { BarcodeScanner } from '@ionic-native/barcode-scanner';

//Pipes
import { ObjectToArray } from '../../pipes/object-to-array';

// Page
import { DetailPage } from '../detail/detail';
import { StorePage } from '../store/store';
import { AccountPage } from '../account/account';
import { Delportal } from '../../service/delportal.service';
import { DetailShoppingListPage } from '../shopping-list-detail/shopping-list-detail';
import { DelportalSearchService } from '../../service/delportal.search.service';
import { DelportalDb } from '../../service/delportal.db.service';


declare var wordpress_per_page: Number;

@Component({
	selector: 'page-search',
	templateUrl: 'search.html',
	providers: [Core, ObjectToArray]
})
export class SearchPage {
	DetailShoppingListPage = DetailShoppingListPage;
	@ViewChild('si') inputSearch: TextInput;
	@ViewChild('cart') buttonCart;
	@ViewChild(Content) content: Content;
	DetailPage = DetailPage;
	StorePage = StorePage;
	AccountPage = AccountPage;
	keyword: string;
	products: Object[] = []; attributes: Object[] = [];
	page = 1; sort: string = '-date_created_gmt'; range: Object = { lower: 0, upper: 0 };
	filter: Object = { grid: false, open: null, value: {}, valueCustom: {} }; filtering: boolean;
	grid: boolean = false;
	favorite: Object = {};
	trans: Object = {};
	over: boolean; actionCart: Object = [];
	cartArray: Object = {};
	noResuilt: boolean = false;
	quantity: Number = 1;
	data: Object[] = [];
	login: Object;
	shoppingListId: Number = 0;
	selectedProducts: Number[] = [];
	shoppingLists: Object[] = [];
	searchItems: Object[] = [];
	hasSearched: boolean = false;
	searching: boolean = false;

	constructor(
		navParams: NavParams,
		private core: Core,
		private storage: Storage,
		private navCtrl: NavController,
		private Toast: Toast,
		private barcodeScanner: BarcodeScanner,
		private dp: Delportal,
		public dpSearch: DelportalSearchService,
		public dpdb: DelportalDb
	) {/*
		http.get(wordpress_url + '/wp-json/wooconnector/product/getattribute')
			.subscribe(res => {
				this.attributes = res.json();
				this.attributes['custom'] = new ObjectToArray().transform(this.attributes['custom']);
				this.reset();
				core.hideLoading();
			});*/
		if (navParams.get('shoppingListId') != null )
			this.shoppingListId = navParams.get('shoppingListId');
		
	}
	ngOnInit() {
		if (this.inputSearch) {
			this.inputSearch["clearTextInput"] = (): void => {
				(void 0);
				this.inputSearch._value = '';
				// this.inputSearch.ionChange(this.inputSearch._value);
				this.inputSearch.writeValue(this.inputSearch._value);
				setTimeout(() => { this.inputSearch.setFocus(); }, 0);
			}
		}
	}
	ionViewDidEnter() {
		this.checkCart();
		this.getFavorite();
		this.buttonCart.update();
		setTimeout(() => { this.inputSearch.setFocus(); }, 100);
		this.storage.get('login').then((val) => {
			if (val) {
				this.login = val;
				
			}
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
	getFavorite() {
		this.storage.get('favorite').then(val => { if (val) this.favorite = val });
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
	openFilter() {
		if (this.filter['open'] == 'filter') this.filter['open'] = null;
		else this.filter['open'] = 'filter';
	}
	openSort() {
		if (this.filter['open'] == 'sort') this.filter['open'] = null;
		else this.filter['open'] = 'sort';
	}
	search() {
		if (this.filter['open'] == 'filter') this.openFilter();
		if (this.keyword.length < 3) return;
		this.page = 1;
		this.over = false;
		this.hasSearched = true;
		this.searchItems = [];
		this.core.showLoading();
		this.getProducts().subscribe(products => {
			this.showResults(products);
			this.content.resize();
			this.core.hideLoading();
		});
	}
	private showResults(products: Object[]) {
		if (products && products.length > 0) {
			this.noResuilt = false;
			this.page++;
			if (this.data) {
				products.forEach(val => {
					this.data.forEach(cart => {
						if (val['id'] == cart['id'])
							val['onCart'] = true;
					});
				});
			}
			this.products = products;
		}
		else {
			this.products = [];
			this.noResuilt = true;
		}
	}

	getProducts(barCode?: string): Observable<Object[]> {
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
			let params = {};
			if (barCode != null){
				params = {
					'post_num_page': 1,
					'post_per_page': wordpress_per_page,
					'barcode': barCode
				}
				this.dpdb.getProductByBarcode(barCode).then((products) => {
					observable.next(products);
					observable.complete();
				});
			} else {
				params = {
					'search': this.keyword,
					'post_num_page': this.page,
					'post_per_page': wordpress_per_page,
				}
				this.dpdb.searchProduct(this.keyword, this.page, this.sort).then((products) => {
					observable.next(products);
					observable.complete();
				});
			}
			/*
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
			}*/
		});
	}
	load(infiniteScroll) {
		if (!this.hasSearched) return;
		this.getProducts().subscribe(products => {
			if (products && products.length > 0) {
				this.page++;
				this.products = this.products.concat(products);
			} else this.over = true;
			infiniteScroll.complete();
		});
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
	addtoCart(detail: any) {
		if (!detail['in_stock']) {
			this.Toast.showShortBottom("Out of Stock").subscribe(
				toast => { },
				error => { console.log(error); }
			);
			return;
		}
		let data: any = {};
		let idCart = detail["id"];
		data.idCart = idCart;
		data.id = detail["id"];
		data.name = detail["name"];
		if (detail["medium_image"] != '')
			data.images = detail["medium_image"];
		data.regular_price = detail["regular_price"];
		data.sale_price = detail["sale_price"];
		data.price = detail["price"];
		data.quantity = this.quantity;
		data.sold_individually = detail['sold_individually'];
		data.pvp = detail['pvp'];
		data.tax = detail['tax'];
		this.storage.get('cart').then((val) => {
			let individually: boolean = false;
			if (!val) val = {};
			if (!val[idCart]) val[idCart] = data;
			else {
				if (!detail['sold_individually']) val[idCart].quantity += data.quantity;
				else individually = true;
			}
			if (individually) {
				this.Toast.showShortBottom(this.trans['individually']['before'] + detail['name'] + this.trans['individually']['after']).subscribe(
					toast => { },
					error => { console.log(error); }
				);
			} else this.storage.set('cart', val).then(() => {
				this.checkCart();
				this.buttonCart.update();
				if (!detail['in_stock'] && detail['backorders'] == 'notify') {
					this.Toast.showShortBottom(this.trans["addOut"]).subscribe(
						toast => { },
						error => { console.log(error); }
					);
				} else {
					this.Toast.showShortBottom(this.trans["add"]).subscribe(
						toast => { },
						error => { console.log(error); }
					);
				}
			});
		});
	}
	onSwipeContent(e) {
		if (e['deltaX'] < -150 || e['deltaX'] > 150) {
			if (e['deltaX'] < 0) this.navCtrl.push(this.AccountPage);
			else this.navCtrl.push(this.StorePage);
		}
	}
	onCancel(e) {

	}
	openCamera() {
		this.barcodeScanner.scan().then(barcodeData => {
			var barCode = barcodeData.text;
			this.core.showLoading();
			this.getProducts(barCode)
				.subscribe(products => {
					this.showResults(products);
					this.content.resize();
					this.core.hideLoading();
				});
		}).catch(err => {
			this.Toast.showShortBottom("Ocurrió un error").subscribe(
				toast => { },
				error => { console.log(error); }
			);
		});
	}

	toggle($event,productId){
		let productIndex = this.selectedProducts.indexOf(productId);
		if ( productIndex > -1){
			this.selectedProducts.splice(productIndex,1)
		}else {
			this.selectedProducts = this.selectedProducts.concat(productId);
		}
	}

	addToShoppingList(){
		this.dp.addProductToShoppingList(this.login, 
											this.shoppingListId, 
											this.selectedProducts).then( (res) => {
												this.navCtrl.push(DetailShoppingListPage, {id: this.shoppingListId});
											});
		
		

	}

	back(){
		this.navCtrl.pop();
	}
	
	onItemSelected(selection){
		this.navCtrl.push(this.DetailPage, { id: selection.id });
	}

	searchTerms(){
		this.searching = true;
		this.dpSearch.getResults(this.keyword).then(val => {
			this.searchItems = val;
			this.searching = false;
		});
	}
}