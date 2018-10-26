import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { Storage } from '@ionic/storage';
import { Delportal } from '../../service/delportal.service';
import { CreditCardPage } from '../credit-card/credit-card';
import { setRootDomAdapter } from '@angular/platform-browser/src/dom/dom_adapter';

/**
 * Generated class for the UserCardsPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
	selector: 'page-user-cards',
	templateUrl: 'user-cards.html',
})
export class UserCardsPage {

	CreditCardPage = CreditCardPage;
	userCards: Object[] = [];
	login: Object;
	noResult: boolean = false;

	constructor(public navCtrl: NavController,
		public navParams: NavParams,
		public storage: Storage,
		private dp: Delportal) {
			
	}

	ionViewDidEnter() {
		this.setData();
	}

	setData() {
		this.storage.get('login').then(val => {
			this.login = val;
			this.dp.getUserCreditCards(this.login).then(data => {
				this.userCards = data;

				if (this.userCards.length <= 0)
					this.noResult = true;
			});
		});
	}

	delete(id) {
		this.dp.deleteUserCreditCard(this.login, id).then(data => {
			this.userCards = data;

			if (this.userCards.length <= 0)
				this.noResult = true;
			else this.noResult = false;
		});
	}

	setDefault(id){

		let uc = this.userCards.find((c) => c['id'] == id);
		uc['is_default'] = !uc['is_default'];
		if (uc){
			this.dp.saveUserCreditCard(this.login, uc).then(data => {
				this.userCards = data;

				if (this.userCards.length <= 0)
					this.noResult = true;
				else this.noResult = false;
			});
		}

		
	}

}
