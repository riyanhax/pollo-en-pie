import { Component, ViewChild, ElementRef, Input, NgZone } from '@angular/core';
import { Http, Headers } from '@angular/http';
import { Platform, IonicPage, NavController, NavParams, TextInput, Events, AlertController, ModalController } from 'ionic-angular';

import { InAppBrowser } from '@ionic-native/in-app-browser';
import { OneSignal } from '@ionic-native/onesignal';
import { Storage } from '@ionic/storage';
import { Toast } from '@ionic-native/toast';

// Page
import { DetailPage } from '../detail/detail';
import { DetailCategoryPage } from '../detail-category/detail-category';

import { StorePage } from '../store/store';

import { FavoritePage } from '../favorite/favorite';
import { AboutPage } from '../about/about';
import { TermsPage } from '../terms/terms';
import { PrivacyPage } from '../privacy/privacy';
import { ContactPage } from '../contact/contact';
import { LoginPage } from '../login/login';





import { SignupPage } from '../signup/signup';
import { AddressFormPage } from '../address-form/address-form';
import { StorageMulti } from '../../service/storage-multi.service';
import { Delportal } from '../../service/delportal.service';
import { DelportalDb } from '../../service/delportal.db.service';
import { GoogleMaps, GoogleMap, Marker, ILatLng, GoogleMapOptions, 
	GoogleMapsEvent, Spherical, LatLng, Geocoder, GeocoderResult } from '@ionic-native/google-maps';
import { LocationSelectPage } from '../location-select/location-select';


/**
 * Generated class for the DeliveryAddressPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

declare var onesignal_app_id: string;
declare var open_target_blank: boolean;
declare var cordova: any;
declare var max_distance: number;


@IonicPage()
@Component({
	selector: 'page-delivery-address',
	templateUrl: 'delivery-address.html',
	providers: [StorageMulti]
})
export class DeliveryAddressPage {
	@ViewChild('cart') buttonCart;
	StorePage = StorePage;
	DetailPage = DetailPage;
	DetailCategoryPage = DetailCategoryPage;
	FavoritePage = FavoritePage;
	AboutPage = AboutPage;
	TermsPage = TermsPage;
    PrivacyPage = PrivacyPage;
    LocationSelectPage = LocationSelectPage;
	ContactPage = ContactPage;
	
	LoginPage = LoginPage;
	SignupPage = SignupPage;
	addressFormPage = AddressFormPage;

	stores : Object[];
	
	map: GoogleMap;
	marker: Marker;
	type: string;
	reverseAddress: string = "";
	lastLatLng : ILatLng = { lat : -2.0393651, lng : -79.9112325 };

	
	nearestStore: Object;
	login: Object = {};
	user: Object = {};
	isLoggedIn: boolean;
	userAddresses: Object[] = [];
	selectedAddressId: number = 0;
	selectedAddress: Object = {};
	isValidAddress: boolean = false;
	mapBtnTxt: string = "Confirmar Ubicación";

	constructor(public navCtrl: NavController,
		public navParams: NavParams,
		platform: Platform,
		OneSignal: OneSignal,
		private InAppBrowser: InAppBrowser,
		private toast: Toast,
		private storage: Storage,
		private zone: NgZone,
		private storageMul: StorageMulti,
		private http: Http,
		private events: Events,
		public dp: Delportal,
		public dpdb: DelportalDb,
		private alertCtrl: AlertController,
		public modalCtrl: ModalController
	) {
		platform.ready().then(() => {
			if (platform.is('cordova')) {
				OneSignal.startInit(onesignal_app_id);
				OneSignal.inFocusDisplaying(OneSignal.OSInFocusDisplayOption.Notification);
				OneSignal.handleNotificationOpened().subscribe(res => {
					let payload = res.notification.payload;
					if (payload && payload['launchURL']) this.openLink(payload['launchURL'], true);
				});
				OneSignal.endInit();
			}

			this.dpdb.getStores().then((stores) => {
				this.stores = stores;
			});
			
		});

		
		this.events.subscribe('loggedin', (user) => {
			this.getData();
		});

		this.events.subscribe('loggedOut', (user) => {
            this.login = null;
            this.user = null;
            this.userAddresses = [];
		});
		
		
	}

	private getData() {
		this.storageMul.get(['user', 'login']).then(val => {
			if (val) {
				if (val['user'])
					this.user = val['user'];
				else
					this.user = null;
				if (val['login'])
					this.login = val['login'];
				this.isLoggedIn = this.user != null ? true : false;

				this.dp.getUserDeliveryAddresses(this.login).then(addresses => {
					this.userAddresses = addresses;
					
					let defaultAddr = this.userAddresses.find((u) => u['is_default'] == 'on');
					
					if (defaultAddr)
						this.selectedAddressId = defaultAddr['id'];
				});

			}
		});
	}

	ionViewDidLoad() {
		this.type = 'addresses';
		this.buttonCart.update();
	}

	ionViewDidEnter(){
		this.getData();
	}

	setMap(){
		if (this.type == 'map')
			this.loadMap();
	}

	loadMap() {

		let mapOptions: GoogleMapOptions = {
			camera: {
				target: this.lastLatLng,
				zoom: 16,
				tilt: 30
			},
			controls: {
				compass: true,
				myLocationButton: true,
				myLocation: true,   // (blue dot)
				indoorPicker: true,
				zoom: true,          // android only
				mapToolbar: true     // android only
			  },
			
			  gestures: {
				scroll: true,
				tilt: true,
				zoom: true,
				rotate: true
			  },
		};
		
		this.map = GoogleMaps.create('map_canvas', mapOptions);

		// Wait the MAP_READY before using any methods.
		this.map.one(GoogleMapsEvent.MAP_READY)
			.then(() => {
				// Now you can use all methods safely.
				
					this.getPosition();
			})
			.catch(error => {
				console.log(error);
			});
		this.map.on(GoogleMapsEvent.MAP_DRAG).subscribe(
			() => {
                let pos = this.map.getCameraTarget();
                
				this.marker.setPosition(pos);
			}
		);
		this.map.on(GoogleMapsEvent.MAP_DRAG_END).subscribe(
			() => {
				let pos = this.map.getCameraTarget();
				this.lastLatLng = pos;
                this.setReverseAddress(pos);
                this.setNearestStore(pos);
			}
		);
		this.map.on(GoogleMapsEvent.MY_LOCATION_BUTTON_CLICK).subscribe(
			() => {
				this.map.getMyLocation().then(response => {
					this.marker.setPosition(response.latLng);
					this.lastLatLng = response.latLng;
					this.setReverseAddress(response.latLng);
				});

			}
		);
		

	}

	getPosition(): void {
		
		this.map.getMyLocation()
			.then(response => {
				this.map.moveCamera({
					target: response.latLng
				});
				this.map.addMarker({
					title: 'Mi ubicación',
					icon: {
						url: 'assets/images/marker.png'
					},
					animation: 'DROP',
					position: response.latLng,
				}).then((marker) => {
					this.marker = marker;
				});
				this.setReverseAddress(response.latLng);
				this.lastLatLng = response.latLng;

				this.setNearestStore(response.latLng);
			})
			.catch(error => {
				console.log(error);
			});
	}

    private setNearestStore(latLng: ILatLng) {
        let ns: Object = {};
        let minDistance = 999999999999999;
        this.stores.forEach(element => {
            let storeLatLng = new LatLng(element['latitude'], element['longitude']);
            let distance = Spherical.computeDistanceBetween(storeLatLng, latLng);
            if (distance < minDistance) {
                ns = element;
                minDistance = distance;
                this.nearestStore = ns;
            }
        });
        if (minDistance > max_distance) {
            this.mapBtnTxt = "Fuera de Cobertura";
            this.toast.showLongCenter("Lo sentimos, no tenemos cobertura en tu ubicación actual").subscribe(toast => { }, error => { console.log(error); });
        }
        else {
            this.validateHours(ns['opening'], ns['closing']);
        }
    }

	validateHours(opening: string, closing: string){
		let currentDate = new Date();
		let currentTime = Date.parse("01/01/2011 " + currentDate.getHours() + ":" + (currentDate.getMinutes()<10?"0":"") +  currentDate.getMinutes());
		let openingTime = Date.parse("01/01/2011 "+ opening);
		let closingTime = Date.parse("01/01/2011 "+ closing);
		if (openingTime <= currentTime && currentTime <= closingTime){
			this.isValidAddress = true;
			this.mapBtnTxt = "Confirmar Ubicación";
		}else {
			/* Almacén Cerrado */
			let alert = this.alertCtrl.create({
				cssClass: 'closedStore',
				title: '<span>😅</span> <br /> Lo sentimos, ha terminado el horario de entregas a domicilio',
				subTitle: 'Tu pedido será recibido pero será entregado el día de mañana',
				buttons: [{
					text: 'Continuar', 
					handler: () => {
						this.isValidAddress = true;
						}
				}
				]
			  });
			  alert.present();
		}
	}

	private setReverseAddress(pos: ILatLng ) {
		Geocoder.geocode({
			"position": pos
		}).then((results: GeocoderResult[]) => {
			if (results.length == 0){
				return null;
			}
			this.zone.run(() => {
				this.reverseAddress = results[0].extra.lines[0];
			})
		});
		
	}
	openLink(url: string, external: boolean = false) {
		console.log(url);
		if (!url) return;
		if (url.indexOf("link://") == 0) {
			url = url.replace("link://", "");
			let data = url.split("/");
			if (data[0] == "product") this.navCtrl.push(this.DetailPage, { id: data[1] });
			else if (data[0] == "product-category") this.navCtrl.push(this.DetailCategoryPage, { id: data[1] });
			else if (data[0] == "bookmark") this.navCtrl.push(this.FavoritePage);
			else if (data[0] == "about-us") this.navCtrl.push(this.AboutPage);
			else if (data[0] == "term-and-conditions") this.navCtrl.push(this.TermsPage);
			else if (data[0] == "privacy-policy") this.navCtrl.push(this.PrivacyPage);
			else if (data[0] == "contact-us") this.navCtrl.push(this.ContactPage);
		} else this.InAppBrowser.create(url, open_target_blank ? "_blank" : "_system", "location=no");
	}
	goto(page: any) {

		if (!page) this.navCtrl.popToRoot();
		else {
			let previous = this.navCtrl.getPrevious();
			if (previous && previous.component == page) this.navCtrl.pop();
			else this.navCtrl.push(page);
		}

	}
	conf(){
		let ua = this.userAddresses.find(e => e['id'] == this.selectedAddressId);
		
		this.selectedAddress['id'] = ua['id'];
		this.storage.set('workingDeliveryAddress', this.selectedAddress);		
		this.navCtrl.push(StorePage);
	}
	confMap(){
		this.selectedAddress['title'] = this.reverseAddress;
		this.selectedAddress['shipping_latitude'] = this.lastLatLng.lat;
		this.selectedAddress['shipping_longitude'] = this.lastLatLng.lng;
        this.selectedAddress['shipping_store'] = this.nearestStore['store_id'];
        console.log(this.selectedAddress);
		this.storage.set('workingDeliveryAddress', this.selectedAddress );		
		this.navCtrl.push(StorePage);
	}


    launchLocationPage(){
        this.goto(LocationSelectPage);
    }
}
