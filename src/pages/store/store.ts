import { Component, ViewChild, Input, QueryList, ViewChildren } from '@angular/core';
import { Content, NavParams, NavController, Slides, Ion, Slide, AlertController } from 'ionic-angular';
import { Http } from '@angular/http';
import { Observable } from 'rxjs/Observable';


// Custom
import { Core } from '../../service/core.service';
import { Storage } from '@ionic/storage';
import { TranslateService } from '../../module/ng2-translate';
import { Toast } from '@ionic-native/toast';

//Pipes
import { ObjectToArray } from '../../pipes/object-to-array';
import { StorageMulti } from '../../service/storage-multi.service';
// Page
import { DetailPage } from '../detail/detail';

import { Delportal } from '../../service/delportal.service';
import { DeliveryAddressPage } from '../delivery-address/delivery-address';
import { DelportalDb } from '../../service/delportal.db.service';


declare var promo_cat_term_id: Number;

@Component({
	selector: 'page-store',
	templateUrl: 'store.html',
	providers: [Core, ObjectToArray]
})
export class StorePage {
	@ViewChild('cart') buttonCart;
	@ViewChild('catSlides') slides: Slides;
	@ViewChildren(Slide) slideCollection: QueryList<Slide>;
	@ViewChild('subCatSlides') slidesSub: Slides;
	@ViewChild(Content) content: Content;
	DetailPage = DetailPage;
	DeliveryAddressPage = DeliveryAddressPage;
	selectedCategoryId: Number; page = 1; sort: string = 'total_sales'; range: Object = { lower: 0, upper: 500000 };
	selectedSubCategoryId: number = 0;
	data: Object = {}; favorite: Object = {}; products: Object[] = []; attributes: Object[] = [];
	filter: Object = { grid: true, open: null, value: {}, valueCustom: {} }; filtering: boolean;
	loaded: boolean; over: boolean;
	noResuilt: boolean = false; quantity: Number = 1; trans: Object = {};
	actionCart: Object = [];
	cartArray: Object = {};
	cart: Object = {};
	allCategories: Object[] = [];
	parentCategories: Object[] = [];
	childCategories: Object[] = [];
	currentChildCategories: Object[] = [];
	selectedCategoryImage: string;
	selectedCategoryIndex: number = -1;
	login: Object = {};
	workingAddress: Object = {};
	addresses: Object[] = [];
	userDeliveryAddresses: Object[] = [];
	prices: Object = { min: 0, max: 0, minCents: 0, maxCents: 0 };


	emptyCat = {
		id: -1,
		name: "", slug: "", parent: 0, description: "", display: "default", image: [], menu_order: 0, count: 6, wooconnector_images_categories: null, modernshop_images_categories: null
	}
	fakeCat = {
		id: 0,
		name: "LO MÁS VENDIDO", slug: "", parent: 0, description: "", display: "default", image: [], menu_order: 0, count: 6, wooconnector_images_categories: null, modernshop_images_categories: null
	}


	public showLeftButton: boolean;
	public showRightButton: boolean;
	public showLeftButtonSub: boolean;
	public showRightButtonSub: boolean;

	constructor(
		private navParams: NavParams,
		private core: Core,
		private http: Http,
		private storage: Storage,
		translate: TranslateService,
		private Toast: Toast,
		private navCtrl: NavController,
		private storageMul: StorageMulti,
		private dp: Delportal,
		private dpdb: DelportalDb,
		private alertCtrl: AlertController,
	) {
		translate.get('detail').subscribe(trans => this.trans = trans);
		this.selectedCategoryId = 0;


		storage.get('login').then((valLogin) => {
			if (valLogin) {
				this.login = valLogin;
				this.dp.getUserDeliveryAddresses(this.login).then((addr) => {
					this.userDeliveryAddresses = addr;
					addr.forEach(a => {
						let address = {
							type: 'radio',
							name: 'deliveryAddress',
							value: a['id'],
							label: a['title']
						}
						this.addresses = this.addresses.concat(address);
					});
				}).then(() => {
					storage.get('workingDeliveryAddress').then((wa) => {
						if (wa == null) {
							let confirm = this.alertCtrl.create({
								title: "¿Dónde entregaremos tu pedido?",
								message: "Elige una dirección de entrega",
								cssClass: 'alert-signout',
								inputs: this.addresses,
								buttons: [
									{
										text: "Nueva dirección",
										handler: () => {
											this.goto(DeliveryAddressPage);
										}
									},
									{
										text: "Seleccionar",
										handler: data => {
											this.workingAddress = data;
											this.initialLoad();
										}
									}
								]
							});
							confirm.present();
						} else {
							this.dp.getUserDeliveryAddress(this.login, wa['id']).then(addr => {
								this.workingAddress = addr;
								this.initialLoad();
							});
						}
					});
				});
			}
			else {
				storage.get("workingDeliveryAddress").then(value => {
					if (!value) {
						let confirm = this.alertCtrl.create({
							title: "¿Dónde entregaremos tu pedido?",
							message: "Necesitamos conocer dónde entregaremos tu pedido",
							cssClass: 'alert-signout',
							inputs: this.addresses,
							buttons: [
								{
									text: "Ir a direcciones",
									handler: data => {
										this.goto(DeliveryAddressPage);
									}
								}
							]
						});
						confirm.present();
					} else {
						this.workingAddress['title'] = value['title'];
						this.initialLoad();
					}
				});
			}
		});

	}

	initialLoad() {
		this.core.showLoading();
		this.dpdb.getAllCats().then((allCats) => {
			this.loadCategories(allCats);
			this.getProducts().subscribe(products => {
				if (products && products.length > 0) {
					this.checkCart();
					this.noResuilt = false;
					this.page++;
					this.products = products;

					this.prices = this.findMinMax(this.products);

					this.range['lower'] = this.prices['minCents'];
					this.range['upper'] = this.prices['maxCents'];
					console.log(this.prices);
					this.loaded = true;
				}
				else {
					this.noResuilt = true;
				}
				this.core.hideLoading();
			});
		});
	}


	ngAfterViewInit() {
		/*	this.slides.freeMode = true;*/
	}

	ionViewDidLoad() {
		let slideCollectionSuscription = this.slideCollection.changes.subscribe((r) => {

			setTimeout(() => {
				/* se le resta 1 para que quede centrado */
				this.slides.slideTo(this.selectedCategoryIndex - 1, 500);
				slideCollectionSuscription.unsubscribe();
			}, 200);
		}

		);
	}

	ionViewDidEnter() {
		this.checkCart();
		this.getFavorite();
		this.buttonCart.update();
		this.content.resize();
	}
	checkCart() {
		this.storage.get('cart').then(val => {
			let cartNew = Object.assign([], val);
			this.cartArray = {};
			this.cart = { count: 0, total: 0 };
			cartNew.forEach(productCart => {
				let item = { productId: 0, qty: 0 };
				item.productId = productCart['id'];
				item.qty = productCart['quantity'];
				this.cartArray[productCart['id']] = item;
				this.cart["count"] += productCart['quantity'];
				if (Number(productCart['sale_price']) > 0) {
					this.cart["total"] += Number(productCart['sale_price']) * productCart['quantity'];
				} else {
					this.cart["total"] += Number(productCart['regular_price']) * productCart['quantity'];
				}
			});
		});
	}
	loadCategories(allCats: Object[]) {
		let promoCat = allCats.find((cat) => cat['id'] == promo_cat_term_id);
		this.allCategories = allCats;
		this.allCategories.splice(allCats.indexOf(promoCat), 1);

		this.parentCategories = this.allCategories.filter(this.isParent);
		this.parentCategories.splice(0, 0, this.fakeCat);
		this.parentCategories.splice(0, 0, this.emptyCat);
		this.parentCategories = this.parentCategories.concat(this.emptyCat);

		this.childCategories = this.allCategories.filter(this.isChild);

		this.showLeftButton = false;
		this.showRightButton = this.parentCategories.length > 3;

	}

	getFavorite() {
		this.storage.get('favorite').then(val => { if (val) this.favorite = val });
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
			let params: Object = {};
			let verb: String = '';
			let sortParams: Object;
			if (this.selectedCategoryId == 0) {
				this.dpdb.getBestSales(this.page, this.sort).then((products) => {
					observable.next(products);

					observable.complete();
				});
			} else {
				this.dpdb.getProducts(this.page, this.selectedSubCategoryId, this.sort).then((products) => {
					observable.next(products);
					observable.complete();
				});
			}

		});
	}
	doRefresh(refresher) {
		this.page = 1;
		this.getProducts().subscribe(products => {

			if (products && products.length > 0) { } this.page++;
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
		/*this.filter['value'] = {};
		this.filter['valueCustom'] = {};
		this.attributes['attributes'].forEach(attr => {
			this.filter['value'][attr['slug']] = {};
		});
		this.attributes['custom'].forEach(attr => {
			this.filter['valueCustom'][attr['slug']] = {};
		});*/
		this.range = { lower: 0, upper: 500000 };
		this.core.showLoading();
		this.page = 1;
		this.getProducts().subscribe(products => {
			if (products && products.length > 0) {
				this.checkCart();
				this.noResuilt = false;
				this.page++;
				this.products = products;

				this.prices = this.findMinMax(this.products);

				this.range['lower'] = this.prices['minCents'];
				this.range['upper'] = this.prices['maxCents'];
				console.log(this.prices);
				this.loaded = true;
			}
			else {
				this.noResuilt = true;
			}
			this.core.hideLoading();
			this.filter['open'] = null;
		});

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
	isParent(cat) {
		return cat.parent_id == 0;
	}
	isChild(cat) {
		return cat.parent_id !== 0;
	}
	changeSubCats(categoryId: Number, index: number = null) {
		/*
				if (this.selectedCategoryId == categoryId && index)
					return;
				else this.selectedCategoryId = categoryId;
		*/

		if (index) {
			if (index >= this.slides.length() - 1)
				return;
			this.slides.slideTo(index - 1, 500);
		}
		/*
		*/
		/*		this.page = 1;
				this.core.showLoading();
				this.getProducts().subscribe(products => {
					
					if (products && products.length > 0) this.page++;
					this.products = [];
					this.products = products;
					this.over = false;
					if (products.length <= 0)
						this.noResuilt = true;
					else this.noResuilt = false;
					this.content.scrollToTop();
					this.content.resize();
					this.core.hideLoading();
				});*/

	}
	changeSubCategory(subcategoryId, index: number = null) {

		if ((this.selectedSubCategoryId == subcategoryId || subcategoryId <= 0) && index)
			return;

		this.selectedSubCategoryId = subcategoryId;

		if (index) {
			this.slidesSub.slideTo(index - 1, 500);
		}

	}

	loadProducts() {
		this.page = 1;
		this.core.showLoading();
		this.getProducts().subscribe(products => {

			this.products = [];
			this.products = products;

			if (products && products.length > 0) {
				this.page++;
				this.over = false;
				this.noResuilt = false;
			} else {
				this.noResuilt = true;
			}
			this.content.resize();
			this.core.hideLoading();
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

	/* Methods for Category Slider */
	// Method executed when the slides are changed
	public slideChanged(): void {

		let currentIndex = this.slides.getActiveIndex();

		this.showLeftButton = currentIndex !== 0;
		this.showRightButton = currentIndex !== Math.ceil(this.slides.length() / 3);

		/*if (currentIndex != this.slides.length()) {*/
		this.selectedCategoryId = this.parentCategories[currentIndex + 1]['id'];

		/*}*/

		if (this.selectedCategoryId > 0) {
			this.currentChildCategories = [];
			for (let subCat of this.childCategories) {
				if (subCat['parent_id'] == this.selectedCategoryId) {
					this.currentChildCategories = this.currentChildCategories.concat(subCat);
				}
			}
			this.selectedSubCategoryId = this.currentChildCategories[0]['id'];
			this.currentChildCategories.splice(0, 0, this.emptyCat);
			this.currentChildCategories = this.currentChildCategories.concat(this.emptyCat);

			this.showRightButtonSub = this.currentChildCategories.length > 3;
			
			if (this.slidesSub) {

				if (this.slidesSub.getActiveIndex() != 0) {
					this.slidesSub.slideTo(0, 500);
				}
				else {
					this.loadProducts();
				}
			}
		} else {
			this.currentChildCategories = [];
			this.selectedSubCategoryId = -1;
			this.loadProducts();
		}

	}

	// Method that shows the next slide
	public slideNext(): void {
		this.slides.slideNext();

	}

	// Method that shows the previous slide
	public slidePrev(): void {
		this.slides.slidePrev();

	}
	/* End Category Slider */


	/* Methods for SubCategory Slider */
	public slideSubChanged(): void {

		let currentIndex = this.slidesSub.getActiveIndex();
		this.showLeftButtonSub = currentIndex !== 0;
		this.showRightButtonSub = (currentIndex + 1) !== Math.ceil(this.slidesSub.length() / 3);
		/*if (currentIndex != this.slidesSub.length()) {*/
		this.selectedSubCategoryId = this.currentChildCategories[currentIndex + 1]['id'];
		this.loadProducts();
		/*}*/
	}

	public slideSubNext(): void {
		this.slidesSub.slideNext();

	}

	public slideSubPrev(): void {
		this.slidesSub.slidePrev();

	}
	/* End SubCategory Slider */

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
	findMinMax(arr) {
		let min = arr[0].price, max = arr[0].price;

		for (let i = 1, len = arr.length; i < len; i++) {
			let v = arr[i].price;
			min = (v < min) ? v : min;
			max = (v > max) ? v : max;
		}

		return { min: min, max: max, minCents: min * 100, maxCents: max * 100 };
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
}	