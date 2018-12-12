import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Delportal } from '../../service/delportal.service';
import { Storage } from '@ionic/storage';

/**
 * Generated class for the ShoppingListSchedulePage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
	selector: 'page-shopping-list-schedule',
	templateUrl: 'shopping-list-schedule.html',
})
export class ShoppingListSchedulePage {

	scheduleForm: FormGroup;
	id: Number = 0;
	today: string;
	tomorrow: string;
	shoppingList: Object = {};
	login: Object = {};

	constructor(public navCtrl: NavController,
		public navParams: NavParams,
		public dp: Delportal,
		private storage: Storage,
		private formBuilder: FormBuilder) {

		this.id = this.navParams.get('id');
		this.today = (new Date()).toISOString();
		let tom  = new Date();
		tom.setDate(tom.getDate() + 1);
		this.tomorrow = tom.toISOString();
		this.scheduleForm = this.formBuilder.group({
			id: [this.id],
			recurrence: ['', Validators.required],
			recurrence_number: ['', Validators.required],
			weekdays: [''],
			startDate: ['', Validators.required],
			endDate: ['']
		});
		

	}

	reset(){
		if (this.shoppingList == null) return;

        this.scheduleForm.patchValue({
            id: this.id,
			recurrence: this.shoppingList['recurrence'],
			recurrence_number: this.shoppingList['recurrence_number'],
			weekdays: this.shoppingList['weekdays'],
			startDate: this.shoppingList['startDate'],
			endDate: this.shoppingList['endDate']

        });
	}

	ionViewDidEnter() {
		this.storage.get('login').then(val => {
			this.login = val;
            this.dp.getShoppingList(this.login, this.id).then(sl => {
				this.shoppingList = sl;
				
				this.reset();
            });
        });
	}

	save(){
		
		this.dp.updateUserShoppingListSchedule(this.login, this.scheduleForm.value).then(data => {
			this.navCtrl.pop();
		});
	}

}
