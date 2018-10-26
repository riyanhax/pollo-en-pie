import { Component } from '@angular/core';
import { NavController, AlertController, ModalController } from 'ionic-angular';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Http } from '@angular/http';

// Custom
import { TranslateService } from '../../module/ng2-translate';
import { Toast } from '@ionic-native/toast';
import { Storage } from '@ionic/storage';

// Page
import { CoreValidator } from '../../validator/core';
import { Core } from '../../service/core.service';
import { Config } from '../../service/config.service';
import { WelcomePage } from '../welcome/welcome';

declare var wordpress_url;
declare var display_mode;

@Component({
	selector: 'page-signup',
	templateUrl: 'signup.html',
	providers: [Core]
})
export class SignupPage {
	wordpress_user: string = wordpress_url + '/wp-json/mobiconnector/user';
	
	formSignup: FormGroup;
	WelcomePage = WelcomePage;
	trans: Object;
	acepto: Boolean;

	constructor(
		private navCtrl: NavController,
		private formBuilder: FormBuilder,
		private http: Http,
		private core: Core,
		translate: TranslateService,
		private Toast: Toast,
		private alertCtrl: AlertController,
		public modalCtrl: ModalController,
		public config: Config,
		private storage: Storage
	) {
		translate.get('signup').subscribe(trans => this.trans = trans);
		this.formSignup = formBuilder.group({
			first_name: ['', Validators.required],
			last_name: ['', Validators.required],
			dob: [''],
			username: ['', Validators.required],
			email: ['', Validators.compose([Validators.required, CoreValidator.isEmail])],
			password: ['', Validators.required],
			repass: ['', Validators.compose([Validators.required, CoreValidator.confirmPassword])],
			acepto: [false, CoreValidator.isChecked],
		});
	}
	removeConfirm() {
		this.formSignup.patchValue({ repass: null });
	}
	register() {
		let params = this.formSignup.value;
		params["display_name"] = params["first_name"] + ' ' + params["last_name"];
		let first_name = params["first_name"];
		params = this.core.objectToURLParams(params);
		this.core.showLoading();

		this.http.post(wordpress_url + '/wp-json/mobiconnector/user/register', params)
			.subscribe(res => {
				this.core.hideLoading();
				this.Toast.showShortBottom(this.trans["success"]).subscribe(
					toast => { },
					error => { console.log(error); }
				);
				this.gotoWelcome(first_name);
			}, err => {
				this.core.hideLoading();
				this.Toast.showLongBottom(err.json()["message"]).subscribe(
					toast => { },
					error => { console.log(error); }
				);
			});
	}
	
	gotoWelcome(first_name: string) {
		if (this.navCtrl.getPrevious() && this.navCtrl.getPrevious().component == this.WelcomePage)
			this.navCtrl.pop();
		else this.navCtrl.push(this.WelcomePage, {first_name: first_name});
	}
	showTerms() {
		let alert = this.alertCtrl.create({
			title: this.config['text_static']['modern_terms_ofuser_title'],
			message: this.config['text_static']['modern_description_term_ofuse'],
			cssClass: 'term-condition',
			buttons: [
				{
					text: this.trans['term_popup']['cancel'],
					role: 'cancel'
				},
				{
					text: this.trans['term_popup']['accept'],
					handler: () => {
						this.acepto = true;
					}
				}
			]
		});
		alert.present();
	}
}