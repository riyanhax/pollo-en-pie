import { Component } from '@angular/core';
import { NavController } from 'ionic-angular';
import { Storage } from '@ionic/storage';

import { SearchPage } from '../search/search';

@Component({
	selector: 'page-card',
	templateUrl: 'card.html'
})
export class CardPage {

	isLoggedIn: boolean = false;
	SearchPage = SearchPage;
	user: Object = {};
	constructor(private navCtrl: NavController,
		public storage: Storage) {
		
		storage.get('user').then(val => {
			if (val != null){
				this.isLoggedIn = true;
				this.user = val;
			}
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
    
}