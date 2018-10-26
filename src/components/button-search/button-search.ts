import { Component } from '@angular/core';
import { NavController } from 'ionic-angular';

import { SearchPage } from '../../pages/search/search';

@Component({
  selector: 'button-search',
  templateUrl: 'button-search.html'
})
export class ButtonSearchComponent {
  SearchPage = SearchPage;
  text: string;

  constructor(private navCtrl: NavController) {
    
  }

  gotoSearch(){
		if(this.navCtrl.getPrevious() && this.navCtrl.getPrevious().component == this.SearchPage){
      
      this.navCtrl.pop();
    }
			
		else {
      
      this.navCtrl.push(this.SearchPage);
    }
	}

}
