import { Component } from '@angular/core';
import { Events, NavController, AlertController } from 'ionic-angular';
import { Http } from '@angular/http';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

// Custom
import { Core } from '../../service/core.service';
import { Storage } from '@ionic/storage';
import { TranslateService } from '../../module/ng2-translate';
import { Toast } from '@ionic-native/toast';

/*import { Facebook } from '@ionic-native/facebook';*/


//Page
import { SignupPage } from '../signup/signup';
import { StorePage } from '../store/store';
import { DeliveryAddressPage } from '../delivery-address/delivery-address';
import { Delportal } from '../../service/delportal.service';
import { WelcomePage } from '../welcome/welcome';

declare var wordpress_url;
declare var display_mode;


@Component({
	selector: 'page-login',
	templateUrl: 'login.html',
	providers: [Core]
})
export class LoginPage {
	wordpress_user: string = wordpress_url + '/wp-json/mobiconnector/user';
	SignupPage = SignupPage;
	StorePage = StorePage;
	WelcomePage = WelcomePage;
	DeliveryAddressPage = DeliveryAddressPage;
	formLogin: FormGroup;
	wrong: boolean;
	trans: Object = {};
	isLoggedIn: boolean = false;
	users: any;
	loginObject: Object;
	

	constructor(
		private formBuilder: FormBuilder,
		private http: Http,
		private core: Core,
		private storage: Storage,
		private navCtrl: NavController,
		private alertCtrl: AlertController,
		translate: TranslateService,
		private Toast: Toast,
		public events: Events,
		private dp: Delportal
		/*,
		private fb: Facebook*/
	) {
		this.formLogin = formBuilder.group({
			username: ['', Validators.required],
			password: ['', Validators.required]
		});
		translate.get('login').subscribe(trans => { if (trans) this.trans = trans; });
		/*
				fb.getLoginStatus()
					.then(res => {
						console.log(res.status);
						if (res.status === "connect") {
							this.isLoggedIn = true;
						} else {
							this.isLoggedIn = false;
						}
					})
					.catch(e => console.log(e));*/
	}
	login() {
		this.core.showLoading();
		this.http.post(wordpress_url + '/wp-json/mobiconnector/jwt/token', this.formLogin.value)
			.subscribe(
				res => {
					this.loginObject = res.json();
					this.loginObject['username'] = this.formLogin.value.username;
					let params = this.core.objectToURLParams({ 'username': this.loginObject["username"] });
					this.http.post(this.wordpress_user + '/get_info', params).subscribe(user => {
						this.core.hideLoading();
						this.storage.set('user', user.json()).then(() => {
							this.storage.set('login', this.loginObject).then(() => {
								this.dp.getAllLists(this.loginObject).then(() => {
									this.events.publish('loggedin', user.json());
									if(this.navCtrl.getPrevious() && this.navCtrl.getPrevious().component == this.WelcomePage){
										this.navCtrl.setRoot(DeliveryAddressPage);
									}
									else this.navCtrl.pop();
								})
							})
						});
					}, err => {
						this.core.hideLoading();
						this.formLogin.patchValue({ password: null });
						this.wrong = true;
					});

				},
				err => {
					
					this.core.hideLoading();
					this.formLogin.patchValue({ password: null });
					this.wrong = true;
				},

			);
	}
	saveCurrentWorkingAddress(): Promise<void> {
		return this.storage.get('workingDeliveryAddressId').then(val => {
			let option = {};
			let headers = new Headers();
			headers.set('Content-Type', 'application/x-www-form-urlencoded; charset=UTF-8');
			headers.set('Authorization', 'Bearer ' + this.loginObject["token"]);
			option['withCredentials'] = true;
			option['headers'] = headers;
			this.http.post(wordpress_url + '/delportal/v1/user_address', this.core.objectToURLParams(val), option);
		});
	}
	forgot() {
		let alert = this.alertCtrl.create({
			title: this.trans["forgot_title"],
			message: this.trans["forgot_body"],
			cssClass: 'alert-forgot',
			inputs: [
				{
					name: 'username',
					placeholder: this.trans["forgot_placeholder"]
				}
			],
			buttons: [
				{
					text: '',
					cssClass: 'button-cancel'
				},
				{
					text: this.trans["forgot_send"],
					cssClass: 'button-confirm',
					handler: data => {
						if (data.username) {
							this.core.showLoading();
							this.http.post(wordpress_url + '/wp-json/mobiconnector/user/forgot_password',
								this.core.objectToURLParams({ username: data.username })
							).subscribe(res => {
								this.core.hideLoading();
								this.Toast.showShortBottom(this.trans["forgot_success"]).subscribe(
									toast => { },
									error => { console.log(error); }
								);
							}, err => {
								this.core.hideLoading();
								this.Toast.showShortBottom(err.json()["message"]).subscribe(
									toast => { },
									error => { console.log(error); }
								);
							});
						} else {
							this.Toast.showShortBottom(this.trans["forgot_err"]).subscribe(
								toast => { },
								error => { console.log(error); }
							);
						}
					}
				}
			]
		});
		alert.present();
	}/*
	fbLogin() {
		this.fb.login(['public_profile', 'user_friends', 'email'])
			.then(res => {
				if (res.status === "connected") {
					this.isLoggedIn = true;
					this.getUserDetail(res.authResponse.userID);
				} else {
					this.isLoggedIn = false;
				}
			})
			.catch(e => console.log('Error logging into Facebook', e));
	}
	getUserDetail(userid) {
		this.fb.api("/" + userid + "/?fields=id,email,name,picture,gender", ["public_profile"])
			.then(res => {
				console.log(res);
				this.users = res;
			})
			.catch(e => {
				console.log(e);
			});
	}
	fbLogout() {

		this.fb.logout()
			.then(res => this.isLoggedIn = false)
			.catch(e => console.log('Error logout from Facebook', e));

	}*/
}