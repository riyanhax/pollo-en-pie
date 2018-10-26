import { NgModule, ErrorHandler } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { IonicApp, IonicModule, IonicErrorHandler } from 'ionic-angular';
import { MyApp } from './app.component';

import { HttpModule, Http } from '@angular/http';
import { TranslateModule, TranslateLoader, TranslateStaticLoader } from '../module/ng2-translate';
import { NgXCreditCardsModule } from 'ngx-credit-cards';

export function createTranslateLoader(http: Http) {
	return new TranslateStaticLoader(http, './assets/i18n', '.json');
}

import { IonicImageLoader } from 'ionic-image-loader';
import { IonicStorageModule } from '@ionic/storage';
import { AboutFooterComponent } from '../components/about-footer/about-footer';
import { ButtonCartComponent } from '../components/button-cart/button-cart';
import { ButtonSearchComponent } from '../components/button-search/button-search';
import { FooterTabsComponent } from '../components/footer-tabs/footer-tabs';
import { ButtonQuantityComponent } from '../components/button-quantity/button-quantity';
import { HideShowComponent } from '../components/hide-show/hide-show';
import { Config } from '../service/config.service';
import { Filter } from '../pipes/filter';
import { ArrayJoin } from '../pipes/array-join';
import { ObjectToArray } from '../pipes/object-to-array';
import { OrderBy } from '../pipes/order-by';
import { Range } from '../pipes/range';
import { Price } from '../pipes/price';
import { TimeAgo } from '../pipes/time-ago';
import { Static } from '../pipes/static';
import { Viewmore } from '../pipes/viewmore';
import { DatePipe } from '@angular/common';


import { DetailCategoryPage } from '../pages/detail-category/detail-category';
import { SearchPage } from '../pages/search/search';
import { StorePage } from '../pages/store/store';
import { AccountPage } from '../pages/account/account';
import { LoginPage } from '../pages/login/login';
import { PreloginPage } from '../pages/pre-login/pre-login';
import { SignupPage } from '../pages/signup/signup';
import { DetailPage } from '../pages/detail/detail';
import { CartPage } from '../pages/cart/cart';
import { CommentsPage } from '../pages/comments/comments';
import { RatingPage } from '../pages/rating/rating';
import { OrderPage } from '../pages/order/order';
import { FavoritePage } from '../pages/favorite/favorite';
import { TermsPage } from '../pages/terms/terms';
import { PrivacyPage } from '../pages/privacy/privacy';
import { ContactPage } from '../pages/contact/contact';
import { AboutPage } from '../pages/about/about';
import { PopupadsPage } from '../pages/popupads/popupads';

import { AddressPage } from '../pages/address/address';
import { CheckoutPage } from '../pages/checkout/checkout';
import { DetailOrderPage } from '../pages/detail-order/detail-order';
import { ThanksPage } from '../pages/thanks/thanks';
import { LatestPage } from '../pages/latest/latest';
import { SplashScreen } from '@ionic-native/splash-screen';
import { StatusBar } from '@ionic-native/status-bar';
import { Camera } from '@ionic-native/camera';
import { CardIO } from '@ionic-native/card-io';
import { InAppBrowser } from '@ionic-native/in-app-browser';
import { Network } from '@ionic-native/network';
import { OneSignal } from '@ionic-native/onesignal';
import { SocialSharing } from '@ionic-native/social-sharing';
import { Toast } from '@ionic-native/toast';
import { ShoppingListsPage } from '../pages/shopping-lists/shopping-lists';
import { DetailShoppingListPage } from '../pages/shopping-list-detail/shopping-list-detail';
import { WelcomePage } from '../pages/welcome/welcome';

import { OrderCheckoutPage } from '../pages/order-checkout/order-checkout';
/*import { Facebook } from '@ionic-native/facebook';*/
import { CardPage } from '../pages/card/card';
import { DeliveryAddressPage } from '../pages/delivery-address/delivery-address';
import { OrderStatusPage } from '../pages/order-status/order-status';
import { PromosPage } from '../pages/promos/promos';
import { SettingsPage } from '../pages/settings/settings';
import { StoresPage } from '../pages/stores/stores';
import { OrderStatusDetailPage } from "../pages/order-status-detail/order-status-detail";


// import { TranslateModule, TranslateLoader } from '@ngx-translate/core';
// import { TranslateHttpLoader } from '@ngx-translate/http-loader';

import { AutoCompleteModule } from 'ionic2-auto-complete';
import { SQLite } from '@ionic-native/sqlite';
import { HttpClientModule, HttpClient } from '@angular/common/http';
import { BarcodeScanner } from '@ionic-native/barcode-scanner';
import { ProfileMenuPage } from '../pages/profile-menu/profile-menu';
import { ProfilePage } from '../pages/profile/profile';
import { UserAddressesPage } from '../pages/user-addresses/user-addresses';
import { AddressFormPage } from '../pages/address-form/address-form';
import { UserBillingPage } from '../pages/user-billing/user-billing';
import { BillingAddressPage } from '../pages/billing-address/billing-address';
import { UserCardsPage } from '../pages/user-cards/user-cards';
import { CreditCardPage } from '../pages/credit-card/credit-card';
import { ShoppingListSchedulePage } from '../pages/shopping-list-schedule/shopping-list-schedule';
import { FileTransfer } from '@ionic-native/file-transfer';
import { DelportalDb } from '../service/delportal.db.service';


@NgModule({
	declarations: [
		MyApp,
		AboutFooterComponent,

		DetailCategoryPage,
		SearchPage,
		StorePage,
		WelcomePage,
		AccountPage,
		PreloginPage,
		LoginPage,
		SignupPage,
		ButtonCartComponent,
		ButtonSearchComponent,
		FooterTabsComponent,
		DetailPage,
		CartPage,
		ButtonQuantityComponent,
		Filter,
		ArrayJoin,
		ObjectToArray,
		CommentsPage,
		RatingPage,
		OrderPage,
		FavoritePage,
		TermsPage,
		PrivacyPage,
		ContactPage,
		AboutPage,
		PopupadsPage,
		ShoppingListsPage,
		CardPage,
		DetailShoppingListPage,
		HideShowComponent,
		OrderBy,
		ProfileMenuPage,
		ProfilePage,
		AddressPage,
		CheckoutPage,
		Range,
		Price,
		DetailOrderPage,
		ThanksPage,
		TimeAgo,
		LatestPage,
		Static,
		Viewmore,

		OrderCheckoutPage,
		DeliveryAddressPage,
		OrderStatusPage,
		OrderStatusDetailPage,
		PromosPage,

		StoresPage,
		SettingsPage,
		UserAddressesPage,
		UserBillingPage,
		AddressFormPage,
		BillingAddressPage,
		UserCardsPage,
		CreditCardPage,
		ShoppingListSchedulePage
	],
	imports: [
		BrowserModule,
		IonicModule.forRoot(MyApp, {
			backButtonText: '',
			backButtonIcon: 'md-arrow-back',
			mode: 'md',
			pageTransition: 'md-transition',
			animate: false,
			scrollAssist: false,
			autoFocusAssist: false,
			platforms: {
				ios: {
					statusbarPadding: true,
					tabsHideOnSubPages: true
				}
			}
		}),
		HttpModule,
		TranslateModule.forRoot({
			provide: TranslateLoader,
			useFactory: (createTranslateLoader),
			deps: [Http]
		}),
		IonicStorageModule.forRoot({
			name: 'woocommerce_application',
			driverOrder: ['sqlite', 'websql', 'indexeddb']
		}),
		HttpClientModule,
		NgXCreditCardsModule,
		IonicImageLoader.forRoot(),
		AutoCompleteModule
	],
	bootstrap: [IonicApp],
	entryComponents: [
		MyApp,
		DetailCategoryPage,
		SearchPage,
		StorePage,
		AccountPage,
		PreloginPage,
		LoginPage,
		SignupPage,
		DetailPage,
		CartPage,
		CommentsPage,
		RatingPage,
		OrderPage,
		FavoritePage,
		TermsPage,
		PrivacyPage,
		ContactPage,
		CardPage,
		AboutPage,
		ProfileMenuPage,
		PopupadsPage,
		AddressPage,
		CheckoutPage,
		DetailOrderPage,
		ThanksPage,
		LatestPage,
		DetailShoppingListPage,
		ShoppingListsPage,
		WelcomePage,
		OrderCheckoutPage,
		DeliveryAddressPage,
		PromosPage,
		StoresPage,
		SettingsPage,
		OrderStatusPage,
		OrderStatusDetailPage,
		ProfilePage,
		UserAddressesPage,
		UserBillingPage,
		AddressFormPage,
		BillingAddressPage,
		UserCardsPage,
		CreditCardPage,
		ShoppingListSchedulePage
	],
	providers: [
		Config,
		DatePipe,
		SplashScreen,
		StatusBar,
		Camera,
		CardIO,
		InAppBrowser,
		Network,
		OneSignal,
		SocialSharing,
		Toast,
		BarcodeScanner,
		FileTransfer,
		SQLite,
		DelportalDb,
		{ provide: ErrorHandler, useClass: IonicErrorHandler },
		/*Facebook*/
	]
})
export class AppModule { }
