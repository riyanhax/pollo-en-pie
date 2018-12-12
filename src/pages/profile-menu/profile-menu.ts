import { Component } from '@angular/core';
import { Events, AlertController, IonicPage, NavController, NavParams } from 'ionic-angular';
import { ProfilePage } from '../profile/profile';
import { UserAddressesPage } from '../user-addresses/user-addresses';
import { UserBillingPage } from '../user-billing/user-billing';
import { UserCardsPage } from '../user-cards/user-cards';

import { Storage } from '@ionic/storage';
import { DeliveryAddressPage } from '../delivery-address/delivery-address';
import { StorageMulti } from '../../service/storage-multi.service';

/**
 * Generated class for the ProfileMenuPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
	selector: 'page-profile-menu',
	templateUrl: 'profile-menu.html',
})
export class ProfileMenuPage {
	DeliveryAddressPage: DeliveryAddressPage;
	
	user: any = {};
	pages: Object[] = [];
	pageProfile: Object = {};
	storage: Storage;

	constructor(public navCtrl: NavController,
		public navParams: NavParams,
		storage: Storage,
		private alertCtrl: AlertController,
		public storageMul: StorageMulti,
		public events: Events
	) {

		this.storage = storage;


		this.pageProfile = {
			title: 'Mis Datos', component: ProfilePage
		}

		this.pages = [
			{ title: 'Mis Datos', component: ProfilePage },
			{ title: 'Mis Direcciones de Facturación', component: UserBillingPage },
			{ title: 'Mis Direcciones de Envío', component: UserAddressesPage },
			{ title: 'Mis Tarjetas de Crédito/Débito', component: UserCardsPage },
		];

	}

	ionViewDidLoad() {
		this.storage.get('user').then(val => {
			this.user = val;
		});
	}

	openPage(page) {
		if (!page) this.navCtrl.popToRoot();
		else {
			let previous = this.navCtrl.getPrevious();
			if (previous && previous.component == page) this.navCtrl.pop();
			else this.navCtrl.push(page.component);
		}
	}

	logOut(){
		let confirm = this.alertCtrl.create({
			title: "Cerrar Sesión",
			message: "¿Realmente deseas cerrar sesión?",
			cssClass: 'alert-signout',
			buttons: [
				{
					text: "No",
				},
				{
					text: "Sí",
					handler: () => {
						this.storageMul.remove(['login','user','userShoppingLists', 'userDeliveryAddresses', 'userBillingAddresses','userCards','workingDeliveryAddress']).then(() => { 
							this.navCtrl.setRoot(DeliveryAddressPage);
							this.events.publish('loggedOut');
						 });
					}
				}
			]
		});
		confirm.present();
	}


}
