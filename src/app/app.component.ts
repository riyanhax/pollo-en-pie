import { Component, NgZone, ViewChild } from '@angular/core';
import { Events, Nav, NavController, Platform, AlertController } from 'ionic-angular';
import { StatusBar } from '@ionic-native/status-bar';
import { SplashScreen } from '@ionic-native/splash-screen';
import { Http } from '@angular/http';
import { Core } from '../service/core.service';


import { ImageLoaderConfig } from 'ionic-image-loader';

// Custom
import { TranslateService } from '../module/ng2-translate';
import { Storage } from '@ionic/storage';

import { Config } from '../service/config.service';
import { Network } from '@ionic-native/network';
/*import { GoogleAnalytics } from '@ionic-native/google-analytics';*/
import { ScreenOrientation } from '@ionic-native/screen-orientation';
import { Device } from '@ionic-native/device';

import { StorageMulti } from '../service/storage-multi.service';

// Page

import { LoginPage } from '../pages/login/login';
import { ShoppingListsPage } from '../pages/shopping-lists/shopping-lists';
import { AboutPage } from '../pages/about/about';
import { CardPage } from '../pages/card/card';
import { DeliveryAddressPage } from '../pages/delivery-address/delivery-address';
import { OrderStatusPage } from '../pages/order-status/order-status';
import { PromosPage } from '../pages/promos/promos';
import { StoresPage } from '../pages/stores/stores';
import { SettingsPage } from '../pages/settings/settings';
import { HttpHeaders } from '@angular/common/http';
import { OrderPage } from '../pages/order/order';
import { Title } from '../../node_modules/@angular/platform-browser';
import { ProfileMenuPage } from '../pages/profile-menu/profile-menu';
import { StorePage } from '../pages/store/store';
import { Delportal } from '../service/delportal.service';
import { DelportalSearchService } from '../service/delportal.search.service';
import { DelportalDb } from '../service/delportal.db.service';

declare var wordpress_url: string;
declare var display_mode: string;
declare var application_language: string;
declare var google_analytics: string;
declare var admob_android_banner: string;
declare var admob_android_interstitial: string;
declare var admob_ios_banner: string;
declare var admob_ios_interstitial: string;

declare var config_currency: string;
declare var config_required_login: boolean;
declare var config_countries : Object[];
declare var config_states : Object[];
declare var config_shipping_cost : Number;

@Component({
	templateUrl: 'app.html',
	providers: [Delportal, StorageMulti, Core, /*GoogleAnalytics*/, ScreenOrientation, Device, DelportalSearchService]
})
export class MyApp {
	@ViewChild(Nav) nav: Nav;
	rootPage = null;
	trans: Object;
	isLoaded: boolean;
	disconnect: boolean;
	data: any = {};
	LoginPage = LoginPage;
	pageProfileMenu : Object = {};
	pages: Array<{title: string, component: any}>;

	constructor(
		private storageMul: StorageMulti,
		platform: Platform,
		translate: TranslateService,
		storage: Storage,
		http: Http,
		core: Core,
		config: Config,
		ngZone: NgZone,
		alertCtrl: AlertController,
		StatusBar: StatusBar,
		public SplashScreen: SplashScreen,
		Network: Network,
		screenOrientation: ScreenOrientation,
		/*ga: GoogleAnalytics,*/
		private device: Device,
		private imageLoaderConfig: ImageLoaderConfig,
		public events: Events,
		public dpdb: DelportalDb
	) {
		
		// platform.setDir(display_mode, true);
		platform.ready().then(() => {
			let html = document.querySelector('html');
			html.setAttribute("dir", display_mode);
			

			imageLoaderConfig.enableDebugMode();
			imageLoaderConfig.setHttpHeaders( new HttpHeaders({timeout: '60000'}));
			imageLoaderConfig.enableFallbackAsPlaceholder(true);
			imageLoaderConfig.setFallbackUrl('assets/images/logo-preload.png');
			imageLoaderConfig.setFileNameCachedWithExtension(true);
			imageLoaderConfig.setMaximumCacheAge(24 * 60 * 60 * 1000);
			imageLoaderConfig.setMaximumCacheSize(200 * 1024 * 1024);
			StatusBar.overlaysWebView(false);
			StatusBar.styleDefault();


			if (platform.is('cordova')) {
			 	screenOrientation.lock('portrait');
			 	let operating_system = '';
				let admob: Object = {};
				if (device.platform == 'Android') {
					operating_system = 'Android';
					admob = {
						banner: admob_android_banner,
						interstitial: admob_android_interstitial
					};
				} else if (device.platform == 'iOS') {
					operating_system = 'iOS';
					admob = {
						banner: admob_ios_banner,
						interstitial: admob_ios_interstitial
					};
				}
				/*
	            if (google_analytics) {
	            	ga.startTrackerWithId(google_analytics).then(() => {
						ga.trackView(operating_system);
					}).catch(e => console.log('Error starting GoogleAnalytics', e));;
	            }*/
				Network.onDisconnect().subscribe(() => {
					ngZone.run(() => { this.disconnect = true; });
				});
				Network.onConnect().subscribe(() => {
					ngZone.run(() => { this.disconnect = false; });
				});
				
			}
			
		});

		this.events.subscribe('loggedin', (user) => {
			storage.get('login').then(val => {
				this.data['login'] = val;
			});
			this.data['user'] = user;
		});

		this.events.subscribe("loggedOut", () => {
			this.data['user'] = null;
			this.data['login'] = null;
		});

		this.pageProfileMenu = {
			title: 'Perfil',
			component: ProfileMenuPage
		}

		this.pages = [
			{ title: 'Inicio', component: DeliveryAddressPage },
			{ title: 'Estado del Pedido', component: OrderStatusPage },
			{ title: 'Promociones', component: PromosPage },
			{ title: 'Catálogo de Productos', component: StorePage },
			{ title: 'Listas de Compras', component: ShoppingListsPage },
			{ title: 'Historial de Compras', component: OrderPage },
			{ title: 'Mi Tarjeta Delportal', component: CardPage },
			{ title: 'Locales Cercanos', component: StoresPage },
			{ title: 'Ajustes', component: SettingsPage },
			{ title: 'Ayuda', component: AboutPage },
		];



		translate.setDefaultLang(application_language);
		translate.use(application_language);
		storage.set('require', false);

		translate.get('general').subscribe(trans => {

			config.set('currency', config_currency);
			config.set('required_login', config_required_login);
			config.set('countries', config_countries);
			config.set('states', config_states);
			config.set('shipping_cost', config_shipping_cost);
			this.storageMul.get(['login','user', 'catalog_version']).then(val => {
				if (val){
					if (val["user"]) this.data["user"] = val["user"];
					if (val["login"] && val["login"]["token"]) 
						this.data["login"] = val["login"];
				}
				let params: any = {};
				if (this.data['login'] && this.data['login']['token']) 
					params['jwt_token'] = this.data['login']['token'];
					
				params['include_text'] = '["modern_footer_details_title","modern_link_facebook","modern_link_google","modern_link_twitter","modern_footer_address","modern_footer_phone","modern_footer_email_domain"]';
				params['include_text'] = '[]';
				
				http.get(wordpress_url + '/wp-json/modernshop/static/gettextstatic', {
					search: core.objectToURLParams(params)
				}).subscribe(res => {
					let currentCatalogVersion = 0;
					let returnedValue = res.json();
					if (val['catalog_version'] != null)
						currentCatalogVersion = parseInt(val['catalog_version']);
					let serverCatalogVersion = parseInt(returnedValue.catalog_version);
					if (currentCatalogVersion < serverCatalogVersion){
						this.dpdb.downloadProductsFile(serverCatalogVersion).then(() => {
							this.SplashScreen.hide();
							this.rootPage = DeliveryAddressPage;
							storage.set('catalog_version', serverCatalogVersion);
						});
					} else {
						this.SplashScreen.hide();
						this.rootPage = DeliveryAddressPage;
					}
					// config.set('currency', res.json()['currency']);
					// config.set('required_login', res.json()['required_login']);
					// config.set('text_static', res.json()['text_static']);
					if (res.json()['login_expired']) {
						storageMul.remove(['login','user','userShoppingLists', 'userDeliveryAddresses', 'userBillingAddresses','userCards','workingDeliveryAddressId']).then(() => {
							/*this.data = null;
							let alert = alertCtrl.create({
								message: trans['login_expired']['message'],
								cssClass: 'alert-no-title',
								enableBackdropDismiss: false,
								buttons: [{
									text: trans['login_expired']['button'],
									handler: () => {
										this.events.publish('loggedOut');	
										}
									}
								]
							});
							alert.present();*/
						});
					}
				}, () => {
					/*showAlert();*/
				});
					
				
				this.isLoaded = true;

				
				
				
				
/*				let getStatic = () => {
				};
				getStatic();
				http.get(wordpress_url + '/wp-json/wooconnector/settings/getactivelocaltion')
				.subscribe(location => {
					config.set('countries', location.json()['countries']);
					config.set('states', location.json()['states']);
					
				}, () => {
					showAlert();
				});*/
				
				/*let showAlert = () => {
					let alert = alertCtrl.create({
						message: trans['error_first']['message'],
						cssClass: 'alert-no-title',
						enableBackdropDismiss: false,
						buttons: [
							{
								text: trans['error_first']['button'],
								handler: () => {
									getStatic();
								}
							}
						]
					});
					alert.present();
				};*/
			});
		});
		storage.get('text').then(val => {
			let html = document.querySelector('html');
			html.className = val;
		});
	}
	openPage(page) {
		// Reset the content nav to have just this page
		// we wouldn't want the back button to show in this scenario
		this.nav.setRoot(page.component);
	  }
	
	goBack(){
		this.nav.pop();
	}
	login(){
		this.nav.push(LoginPage);
	}
}
