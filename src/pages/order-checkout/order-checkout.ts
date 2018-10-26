import { Component, ViewChild } from '@angular/core';
import { NavController } from 'ionic-angular';
import { Http, Headers } from '@angular/http';

import { CreditCardValidator } from 'ngx-credit-cards';

import { LoginPage } from '../login/login';
import { SignupPage } from '../signup/signup';
import { ThanksPage } from '../thanks/thanks';
import { Delportal } from '../../service/delportal.service';
import { Storage } from '@ionic/storage';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Toast } from '@ionic-native/toast';
import { Core } from '../../service/core.service';
import { ObjectToArray } from '../../pipes/object-to-array';

declare var wordpress_url;
declare var wc_consumer_key;
declare var wc_consumer_secret_key;


@Component({
    selector: 'page-order-checkout',
    templateUrl: 'order-checkout.html'
})

export class OrderCheckoutPage {
    @ViewChild('cart') buttonCart;
    LoginPage = LoginPage;
    SignupPage = SignupPage;
    ThanksPage = ThanksPage;

    selectedDeliveryAddress: number;
    selectedBillingAddress: number;
    predefinedReceipt: number = 1;
    selectedCard: number = 1;
    login: Object;
    deliveryAddresses: Object[];
    billingAddresses: Object[];
    creditCards: Object[];
    orderCheckoutForm: FormGroup;
    userId: number;

    constructor(
        private navCtrl: NavController,
        public dp: Delportal,
        public storage: Storage,
        private formBuilder: FormBuilder,
        public http: Http,
        public core: Core,
        public toast: Toast
    ) {

        this.orderCheckoutForm = formBuilder.group({
            billingAddressId: [-1, Validators.required],
            shippingAddressId: [-1, Validators.required],
            creditCardId: [-1, Validators.required],
            cardCvv: ['', Validators.compose([CreditCardValidator.validateCardCvc, Validators.required])],
            additionalComments: ['']
        });

        this.storage.get('user').then(val => {
            this.userId = val['ID'];
        });

        this.storage.get('login').then(val => {
            this.login = val;
            this.dp.getUserBillingAddresses(this.login).then(bas => {
                this.billingAddresses = bas;

                let defaultBa = this.billingAddresses.find(b => b['is_default']);

                if (defaultBa != null)
                    this.orderCheckoutForm.patchValue({
                        billingAddressId: defaultBa['id']

                    });

            });
            this.dp.getUserDeliveryAddresses(this.login).then(das => {
                this.deliveryAddresses = das;
                let defaultDa = this.deliveryAddresses.find(b => b['is_default']);
                if (defaultDa != null)
                    this.orderCheckoutForm.patchValue({
                        shippingAddressId: defaultDa['id']
                    });

            });
            this.dp.getUserCreditCards(this.login).then(ccs => {
                this.creditCards = ccs;
                let defaultCC = this.creditCards.find(b => b['is_default']);
                if (defaultCC != null)
                    this.orderCheckoutForm.patchValue({
                        creditCardId: defaultCC['id']
                    });
            });

        })

    }

    confirm() {
        this.storage.get('cart').then(val => {
            let data = val;

            let products: Object[] = [];
            
            new ObjectToArray().transform(data).forEach(product => {
                let now = {};
                now['product_id'] = product['id'];
                now['quantity'] = product['quantity'];
                products.push(now);
            });
            
            let formValue = this.orderCheckoutForm.value;

            let selectedCC = this.creditCards.find(b => b['id'] == formValue['creditCardId']);
            let selectedBA = this.billingAddresses.find(b => b['id'] == formValue['billingAddressId']);
            let selectedDA = this.deliveryAddresses.find(b => b['id'] == formValue['shippingAddressId']);



            let order = {
                user_id: this.userId,
                payment_method: 'payme',
                payment_method_title: 'Tarjeta de Crédito o Débito - Alignet',
                set_paid: false,
                billing: {
                    first_name: selectedBA['first_name'],
                    last_name: selectedBA['last_name'],
                    address_1: selectedBA['line_1'],
                    address_2: '',
                    city: selectedBA['city'],
                    state: selectedBA['state'],
                    postcode: '',
                    country: selectedBA['country'],
                    email: selectedBA['email'],
                    phone: selectedBA['phone']
                },
                shipping: {
                    first_name: selectedDA['shipping_contact'],
                    last_name: '',
                    address_1: selectedDA['shipping_line_1'],
                    address_2: selectedDA['shipping_line_2'],
                    city: 'Guayaquil',
                    state: 'G',
                    postcode: '',
                    country: 'EC'
                },
                line_items: products,
                shipping_lines: [
                    {
                        method_id: 'flat_rate',
                        method_title: 'Precio Fijo',
                        total: 3
                    }
                ],
                meta_data: [
                    {
                        key: '_user_credit_card_id',
                        value: selectedCC['id']
                    },
                    {
                        key: '_cvv',
                        value: formValue['cardCvv']
                    }
                ],
                comments: formValue['additionalComments']
            };

            let headers = new Headers();
            let params = {};
            params['data'] = JSON.stringify(order);

            headers.set('Content-Type', 'application/x-www-form-urlencoded; charset=UTF-8');
            headers.set('Authorization', 'Bearer ' + this.login["token"]);
            this.core.showLoading();
            this.http.post(wordpress_url + '/wp-json/delportal/v1/order', this.core.objectToURLParams(params), {
                headers: headers,
                withCredentials: true
            }).subscribe(res => {
                this.core.hideLoading();
                let retValue = res.json();
                if (retValue['error'] == 0) {
                    this.storage.remove('cart').then(() => { 
                        this.buttonCart.update();
                        this.thankyou(retValue['id']);
                    });
                } else {
                    this.toast.showLongBottom("Ocurrió un error:" + retValue['message']).subscribe(
                        toast => { },
                        error => { console.log(error); }
                    );
                }
            }, err => {
                console.log('Checkout process err', err);
                this.core.hideLoading();
                this.toast.showLongBottom("Ocurrió un error").subscribe(
                    toast => { },
                    error => { console.log(error); }
                );
                
            });
        });


    }

    thankyou(orderId) {
        this.navCtrl.push(this.ThanksPage, { id: orderId});
    }
}
