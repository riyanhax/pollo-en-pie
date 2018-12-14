import { Injectable } from '@angular/core';

import { Storage } from '@ionic/storage';
import { Core } from './core.service';
import { Toast } from '@ionic-native/toast';
import { Http, Headers } from '@angular/http';

declare var wordpress_url: string;


@Injectable()
export class Delportal {

    constructor(private storage: Storage,
        public core: Core,
        public http: Http,
        public toast: Toast) { }

    getAllLists(login: Object) {
        return new Promise<Object>((resolve, reject) => {
            let option = {};
            if (login && login['token']) {
                let headers = new Headers();
                headers.set('Content-Type', 'application/x-www-form-urlencoded; charset=UTF-8');
                headers.set('Authorization', 'Bearer ' + login["token"]);
                option['withCredentials'] = true;
                option['headers'] = headers;
                this.core.showLoading();
                this.http.get(wordpress_url + '/wp-json/delportal/v1/user_lists', option)
                    .subscribe((res) => {
                        let result = res.json();
                        let shoppingLists = this.setShoppingLists(result.shopping_lists);
                        
                        let billingAdresses = this.setBillingAddresses(result.billing_addresses);
                        let deliveryAdresses = this.setDeliveryAddresses(result.delivery_addresses);
                        let userCards = this.setCreditCards(result.payment_data);
                        this.storage.set('userShoppingLists', shoppingLists);
                        this.storage.set('userBillingAddresses', billingAdresses);
                        this.storage.set('userDeliveryAddresses', deliveryAdresses);
                        this.storage.set('userCards', userCards);
                        this.core.hideLoading();
                        resolve({
                            shoppingLists: shoppingLists,
                            billingAddresses: billingAdresses,
                            deliveryAddresses: deliveryAdresses,
                            userCards: userCards
                        });
                    });
            }
        });

    }

    getUserShoppingLists(login: Object) {
        return new Promise<Object[]>((resolve, reject) => {
            this.storage.get('userShoppingLists').then((val) => {
                resolve(val);
            });
        });
    }

    addUserShoppingList(login: Object, name: String, products: Object[] = null) {
        return new Promise<Object[]>((resolve, reject) => {
            this.core.showLoading();
            let params = {};

            params['title'] = name;
            if (products != null && products.length) {
                params['products'] = JSON.stringify(products);
            }
            let option = {};
            if (login && login['token']) {
                let headers = new Headers();
                headers.set('Content-Type', 'application/x-www-form-urlencoded; charset=UTF-8');
                headers.set('Authorization', 'Bearer ' + login["token"]);
                option['withCredentials'] = true;
                option['headers'] = headers;
            }
            this.http.post(wordpress_url + '/wp-json/delportal/v1/add_shopping_list', this.core.objectToURLParams(params), option)
                .subscribe(res => {
                    let shoppingLists: Object[] = this.setShoppingLists(res.json());

                    this.storage.set('userShoppingLists', shoppingLists);
                    this.core.hideLoading();

                    this.toast.showShortBottom("Lista Agregada").subscribe(
                        toast => { },
                        error => { console.log(error); }
                    );
                    resolve(shoppingLists);
                });
        });

    }

    cancelUserShoppingList(login: Object, id: Number){
        return new Promise<Object[]>((resolve, reject) => {
            this.core.showLoading();
            let params = {};
            params['id'] = id;
            let option = {};
            if (login && login['token']) {
                let headers = new Headers();
                headers.set('Content-Type', 'application/x-www-form-urlencoded; charset=UTF-8');
                headers.set('Authorization', 'Bearer ' + login["token"]);
                option['withCredentials'] = true;
                option['headers'] = headers;
            }
            this.http.post(wordpress_url + '/wp-json/delportal/v1/cancel_shopping_list_schedule', this.core.objectToURLParams(params), option)
            .subscribe(res => {
                let shoppingLists: Object[] = this.setShoppingLists(res.json());

                this.storage.set('userShoppingLists', shoppingLists);
                this.core.hideLoading();




                this.toast.showShortBottom("Lista Actualizada").subscribe(
                    toast => { },
                    error => { console.log(error); }
                );
                resolve(shoppingLists);
            });
        });
    }

    updateUserShoppingListSchedule(login: Object, shoppingList: Object){
        return new Promise<Object[]>((resolve, reject) => {
            this.core.showLoading();
            let params = {};
            params['id'] = shoppingList['id'];
            params['recurrence'] = shoppingList['recurrence'];
			params['recurrence_number'] = shoppingList['recurrence_number'];
			params['weekdays'] = shoppingList['weekdays'],
			params['startDate'] = shoppingList['startDate']
			params['endDate'] = shoppingList['endDate']

            let option = {};
            if (login && login['token']) {
                let headers = new Headers();
                headers.set('Content-Type', 'application/x-www-form-urlencoded; charset=UTF-8');
                headers.set('Authorization', 'Bearer ' + login["token"]);
                option['withCredentials'] = true;
                option['headers'] = headers;
            }
            this.http.post(wordpress_url + '/wp-json/delportal/v1/update_shopping_list_schedule', this.core.objectToURLParams(params), option)
                .subscribe(res => {
                    let shoppingLists: Object[] = this.setShoppingLists(res.json());

                    this.storage.set('userShoppingLists', shoppingLists);
                    this.core.hideLoading();

                    this.toast.showShortBottom("Lista Actualizada").subscribe(
                        toast => { },
                        error => { console.log(error); }
                    );
                    resolve(shoppingLists);
                });
        });
    }

    updateUserShoppingList(login: Object, shoppingList: Object) {
        return new Promise<Object[]>((resolve, reject) => {
            this.core.showLoading();
            let params = {};
            params['id'] = shoppingList['id'];
            params['title'] = shoppingList['title'];
            params['type'] = shoppingList['type'];
            params['products'] = JSON.stringify(shoppingList['products']);

            let option = {};
            if (login && login['token']) {
                let headers = new Headers();
                headers.set('Content-Type', 'application/x-www-form-urlencoded; charset=UTF-8');
                headers.set('Authorization', 'Bearer ' + login["token"]);
                option['withCredentials'] = true;
                option['headers'] = headers;
            }
            this.http.post(wordpress_url + '/wp-json/delportal/v1/update_shopping_list', this.core.objectToURLParams(params), option)
                .subscribe(res => {
                    let shoppingLists: Object[] = this.setShoppingLists(res.json());

                    this.storage.set('userShoppingLists', shoppingLists);
                    this.core.hideLoading();

                    this.toast.showShortBottom("Lista Actualizada").subscribe(
                        toast => { },
                        error => { console.log(error); }
                    );
                    resolve(shoppingLists);
                });
        });
    }

    renameShoppingList(login: Object, id:Number, newName: string){
        return new Promise<Object[]>((resolve, reject) => {
            this.core.showLoading();
            let params = {};

            params['id'] = id;
            params['title'] = newName;
            let option = {};
            if (login && login['token']) {
                let headers = new Headers();
                headers.set('Content-Type', 'application/x-www-form-urlencoded; charset=UTF-8');
                headers.set('Authorization', 'Bearer ' + login["token"]);
                option['withCredentials'] = true;
                option['headers'] = headers;
            }
            this.http.post(wordpress_url + '/wp-json/delportal/v1/rename_shopping_list', this.core.objectToURLParams(params), option)
                .subscribe(res => {
                    let shoppingLists: Object[] = this.setShoppingLists(res.json());

                    this.storage.set('userShoppingLists', shoppingLists);
                    this.core.hideLoading();

                    this.toast.showShortBottom("Lista Actualizada").subscribe(
                        toast => { },
                        error => { console.log(error); }
                    );
                    resolve(shoppingLists);
                });
        });
    }

    deleteShoppingList(login: Object, id: Number) {
        return new Promise<Object[]>((resolve, reject) => {
            this.core.showLoading();
            let params = {};

            params['id'] = id;
            let option = {};
            if (login && login['token']) {
                let headers = new Headers();
                headers.set('Content-Type', 'application/x-www-form-urlencoded; charset=UTF-8');
                headers.set('Authorization', 'Bearer ' + login["token"]);
                option['withCredentials'] = true;
                option['headers'] = headers;
            }
            this.http.post(wordpress_url + '/wp-json/delportal/v1/delete_shopping_list', this.core.objectToURLParams(params), option)
                .subscribe(res => {
                    let shoppingLists: Object[] = this.setShoppingLists(res.json());

                    this.storage.set('userShoppingLists', shoppingLists);
                    this.core.hideLoading();

                    this.toast.showShortBottom("Lista Eliminada").subscribe(
                        toast => { },
                        error => { console.log(error); }
                    );
                    resolve(shoppingLists);
                });
        });
    }

    setShoppingLists(lists: Object[]) {
        let shoppingLists: Object[] = [];
        if (lists.length > 0) {
            lists.forEach(list => {
                
                if (list && list['_dp_user_shopping_list_id'] != null) {

                    let newList = {
                        'id': list['_dp_user_shopping_list_id'],
                        'title': list['_dp_user_shopping_list_title'],
                        'type': list['_dp_user_shopping_list_type'],
                        'recurrence': list['_dp_user_shopping_list_recurrence'],
                        'recurrence_number': list['_dp_user_shopping_list_recurrence_number'],
                        'weekdays': list['_dp_user_shopping_list_weekdays'],
                        'startDate': list['_dp_user_shopping_list_recurrence_begin'],
                        'endDate': list['_dp_user_shopping_list_recurrence_end'],
                        'products': []
                    };
                    if (list['_dp_user_shopping_list_products']) {
                        if (list['_dp_user_shopping_list_products'] != "") {
                            newList['products'] = JSON.parse(list['_dp_user_shopping_list_products']);
                        }
                    }

                    shoppingLists = shoppingLists.concat(newList);
                }

            });
        }
        return shoppingLists;
    }

    getShoppingList(login: Object, id: Number) {

        return new Promise((resolve, reject) => {
            this.getUserShoppingLists(login).then((list) => {
                let userList = list.find((ul) => ul['id'] == id);
                resolve(userList);
            });
        });

    }

    addProductToShoppingList(login: Object, id: Number, products: Object[]) {
        return new Promise<Object[]>((resolve, reject) => {
            this.core.showLoading();
            let params = {};

            params['id'] = id;
            params['product'] = JSON.stringify(products);
            let option = {};
            if (login && login['token']) {
                let headers = new Headers();
                headers.set('Content-Type', 'application/x-www-form-urlencoded; charset=UTF-8');
                headers.set('Authorization', 'Bearer ' + login["token"]);
                option['withCredentials'] = true;
                option['headers'] = headers;
            }
            this.http.post(wordpress_url + '/wp-json/delportal/v1/add_product_to_shopping_list', this.core.objectToURLParams(params), option)
                .subscribe(res => {
                    let shoppingLists: Object[] = this.setShoppingLists(res.json());

                    this.storage.set('userShoppingLists', shoppingLists);
                    this.core.hideLoading();

                    this.toast.showShortBottom("Lista Actualizada").subscribe(
                        toast => { },
                        error => { console.log(error); }
                    );
                    resolve(shoppingLists);
                });
        });
    }

    getUserBillingAddresses(login: Object) {
        return new Promise<Object[]>((resolve, reject) => {
            this.storage.get('userBillingAddresses').then((val) => {
                resolve(val);
            });
        });
    }

    setBillingAddresses(addresses: Object[]) {
        let billingAddresses: Object[] = [];
        if (addresses.length > 0) {
            addresses.forEach(address => {
                if (address && address['_dp_user_billing_address_id'] != null) {
                    let newAddress = {
                        'id': address['_dp_user_billing_address_id'],
                        'title': address['_dp_user_billing_address_title'],
                        'first_name': address['_dp_user_billing_address_first_name'],
                        'last_name': address['_dp_user_billing_address_last_name'],
                        'document_type': address['_dp_user_billing_address_document_type'],
                        'document_number': address['_dp_user_billing_address_document_number'],
                        'line_1': address['_dp_user_billing_address_line_1'],
                        'city': address['_dp_user_billing_address_city'],
                        'state': address['_dp_user_billing_address_state'],
                        'country': address['_dp_user_billing_address_country'],
                        'email': address['_dp_user_billing_address_email'],
                        'phone': address['_dp_user_billing_address_phone'],
                        'is_default': address['_dp_user_billing_address_default']
                    };
                    billingAddresses = billingAddresses.concat(newAddress);
                }

            });
        }
        return billingAddresses;
    }

    saveBillingAddress(login: Object, billingAddress: Object) {
        return new Promise<Object[]>((resolve, reject) => {
            this.core.showLoading();

            let option = {};
            if (login && login['token']) {
                let headers = new Headers();
                headers.set('Content-Type', 'application/x-www-form-urlencoded; charset=UTF-8');
                headers.set('Authorization', 'Bearer ' + login["token"]);
                option['withCredentials'] = true;
                option['headers'] = headers;
            }
            let url: string = '';
            if (billingAddress['id'] == 0) {
                url = wordpress_url + '/wp-json/delportal/v1/add_billing_address'
            } else {
                url = wordpress_url + '/wp-json/delportal/v1/update_billing_address'
            }

            if (billingAddress['is_default'] == "true"){
                billingAddress['is_default'] = "on"
            } else {
                billingAddress['is_default'] = "off"
            }

            let params = this.core.objectToURLParams(billingAddress);
            this.http.post(url, params, option)
                .subscribe(res => {
                    let billingAdresses: Object[] = this.setBillingAddresses(res.json());

                    this.storage.set('userBillingAddresses', billingAdresses);
                    this.core.hideLoading();

                    this.toast.showShortBottom("Datos Grabados").subscribe(
                        toast => { },
                        error => { console.log(error); }
                    );
                    resolve(billingAdresses);
                });
        });
    }

    deleteBillingAddress(login: Object, id:Number){
        return new Promise<Object[]>((resolve, reject) => {
            this.core.showLoading();
            let params = {};

            params['id'] = id;
            let option = {};
            if (login && login['token']) {
                let headers = new Headers();
                headers.set('Content-Type', 'application/x-www-form-urlencoded; charset=UTF-8');
                headers.set('Authorization', 'Bearer ' + login["token"]);
                option['withCredentials'] = true;
                option['headers'] = headers;
            }
            this.http.post(wordpress_url + '/wp-json/delportal/v1/delete_billing_address', this.core.objectToURLParams(params), option)
                .subscribe(res => {
                    let billingAddresses: Object[] = this.setBillingAddresses(res.json());

                    this.storage.set('userBillingAddresses', billingAddresses);
                    this.core.hideLoading();

                    this.toast.showShortBottom("Dirección Eliminada").subscribe(
                        toast => { },
                        error => { console.log(error); }
                    );
                    resolve(billingAddresses);
                });
        });
    }

    getUserDeliveryAddress(login: Object, id: Number) {

        return new Promise((resolve, reject) => {
            this.getUserDeliveryAddresses(login).then((list) => {
                let userList = list.find((ul) => ul['id'] == id);
                resolve(userList);
            });
        });

    }

    getUserDeliveryAddresses(login: Object) {

        return new Promise<Object[]>((resolve, reject) => {
            this.storage.get('userDeliveryAddresses').then((val) => {
                let deliveryAdresses: Object[] = val == null ? [] : val;
                if (deliveryAdresses.length == 0) {
                    this.getAllLists(login).then(val => {
                        resolve(val['deliveryAddresses']);
                    });
                } else {
                    resolve(deliveryAdresses);
                }
            });
        });
    }

    setDeliveryAddresses(lists: Object[]) {
        let deliveryAddresses: Object[] = [];
        if (lists.length > 0) {
            lists.forEach(list => {
                if (list && list['_dp_user_shipping_address_id'] != null) {
                    let newList = {
                        'id': list['_dp_user_shipping_address_id'],
                        'title': list['_dp_user_shipping_address_title'],
                        'shipping_address_line_1': list['_dp_user_shipping_address_line_1'],
                        'shipping_address_line_2': list['_dp_user_shipping_address_line_2'],
                        'shipping_phone': list['_dp_user_shipping_address_phone'],
                        'shipping_latitude': list['_dp_user_shipping_address_latitude'],
                        'shipping_longitude': list['_dp_user_shipping_address_longitude'],
                        'shipping_store': list['_dp_user_shipping_address_store_id'],
                        'shipping_reference': list['_dp_user_shipping_address_reference'],
                        'is_default': list['_dp_user_shipping_address_default']
                    };
                    deliveryAddresses = deliveryAddresses.concat(newList);
                }

            });
        }
        return deliveryAddresses;
    }

    saveDeliveryAddress(login: Object, deliveryAddress: Object) {
        return new Promise<Object[]>((resolve, reject) => {
            this.core.showLoading();

            let option = {};
            if (login && login['token']) {
                let headers = new Headers();
                headers.set('Content-Type', 'application/x-www-form-urlencoded; charset=UTF-8');
                headers.set('Authorization', 'Bearer ' + login["token"]);
                option['withCredentials'] = true;
                option['headers'] = headers;
            }
            let url: string = '';
            if (deliveryAddress['id'] == 0) {
                url = wordpress_url + '/wp-json/delportal/v1/add_delivery_address'
            } else {
                url = wordpress_url + '/wp-json/delportal/v1/update_delivery_address'
            }
            if (deliveryAddress['is_default'] == "true"){
                deliveryAddress['is_default'] = "on"
            } else {
                deliveryAddress['is_default'] = "off"
            }
            let params = this.core.objectToURLParams(deliveryAddress);
            console.log(deliveryAddress);
            this.http.post(url, params, option)
                .subscribe(res => {
                    let deliveryAdresses: Object[] = this.setDeliveryAddresses(res.json());

                    this.storage.set('userDeliveryAddresses', deliveryAdresses);
                    this.core.hideLoading();

                    this.toast.showShortBottom("Datos Grabados").subscribe(
                        toast => { },
                        error => { console.log(error); }
                    );
                    resolve(deliveryAdresses);
                });
        });
    }

    deleteDeliveryAddress(login: Object, id: number){
        return new Promise<Object[]>((resolve, reject) => {
            this.core.showLoading();
            let params = {};

            params['id'] = id;
            let option = {};
            if (login && login['token']) {
                let headers = new Headers();
                headers.set('Content-Type', 'application/x-www-form-urlencoded; charset=UTF-8');
                headers.set('Authorization', 'Bearer ' + login["token"]);
                option['withCredentials'] = true;
                option['headers'] = headers;
            }
            this.http.post(wordpress_url + '/wp-json/delportal/v1/delete_delivery_address', this.core.objectToURLParams(params), option)
                .subscribe(res => {
                    let deliveryAdresses: Object[] = this.setDeliveryAddresses(res.json());


                    this.storage.set('userDeliveryAddresses', deliveryAdresses);
                    this.core.hideLoading();

                    this.toast.showShortBottom("Dirección Eliminada").subscribe(
                        toast => { },
                        error => { console.log(error); }
                    );
                    resolve(deliveryAdresses);
                });
        });
    }

    getUserCreditCards(login: Object) {

        return new Promise<Object[]>((resolve, reject) => {
            this.storage.get('userCards').then((val) => {
                resolve(val);
            });
        });
    }


    setCreditCards(lists: Object[]) {
        let deliveryAddresses: Object[] = [];
        if (lists.length > 0) {
            lists.forEach(list => {
                if (list && list['_dp_user_cc_id'] != null) {
                    let newList = {
                        'id': list['_dp_user_cc_id'],
                        'title': list['_dp_user_cc_title'],
                        'type': list['_dp_user_cc_type'],
                        'expDate': list['_dp_user_cc_expDate'],
                        'mask': list['_dp_user_cc_mask'],
                        'is_default': list['_dp_user_cc_default']
                    };
                    deliveryAddresses = deliveryAddresses.concat(newList);
                }

            });
        }
        return deliveryAddresses;

    }

    saveUserCreditCard(login: Object, creditCard: Object) {
        return new Promise<Object[]>((resolve, reject) => {
            this.core.showLoading();

            let option = {};
            if (login && login['token']) {
                let headers = new Headers();
                headers.set('Content-Type', 'application/x-www-form-urlencoded; charset=UTF-8');
                headers.set('Authorization', 'Bearer ' + login["token"]);
                option['withCredentials'] = true;
                option['headers'] = headers;
            }
            let url: string = '';
            if (creditCard['id'] == 0) {
                url = wordpress_url + '/wp-json/delportal/v1/cc'
            } else {
                url = wordpress_url + '/wp-json/delportal/v1/update_cc'
            }
            let params = this.core.objectToURLParams(creditCard);
            this.http.post(url, params, option)
                .subscribe(res => {
                    let creditCards: Object[] = this.setCreditCards(res.json());

                    this.storage.set('userCards', creditCards);
                    this.core.hideLoading();

                    this.toast.showShortBottom("Datos Grabados").subscribe(
                        toast => { },
                        error => { console.log(error); }
                    );
                    resolve(creditCards);
                });
        });
    }

    deleteUserCreditCard(login: Object, creditCardId: number) {
        return new Promise<Object[]>((resolve, reject) => {
            this.core.showLoading();

            let option = {};
            if (login && login['token']) {
                let headers = new Headers();
                headers.set('Content-Type', 'application/x-www-form-urlencoded; charset=UTF-8');
                headers.set('Authorization', 'Bearer ' + login["token"]);
                option['withCredentials'] = true;
                option['headers'] = headers;
            }
            let url: string = '';

            url = wordpress_url + '/wp-json/delportal/v1/delete_cc'

            let params = {};
            params['id'] = creditCardId;
            this.http.post(url, this.core.objectToURLParams(params), option)
                .subscribe(res => {
                    let creditCards: Object[] = this.setCreditCards(res.json());

                    this.storage.set('userCards', creditCards);
                    this.core.hideLoading();

                    this.toast.showShortBottom("Datos Grabados").subscribe(
                        toast => { },
                        error => { console.log(error); }
                    );
                    resolve(creditCards);
                });
        });
    }

    /*************************** Clientes ***************************/
    getCustomerData(document_number: string){
        return new Promise<Object[]>((resolve, reject) => {
            this.core.showLoading("Estamos consultando tus datos");
            let url: string = wordpress_url + '/wp-json/delportal/v1/check_customer/' + document_number; 

            this.http.get(url)
                .subscribe(res => {
                    this.core.hideLoading();
                    resolve(res.json());
                });
        });
    }

    /*************************** Tracking **************************/
    getTracking(orderId){
        return new Promise<Object[]>((resolve, reject) => {
            let url: string = wordpress_url + '/wp-json/delportal/v1/check_order_traking/' + orderId; 

            this.http.get(url)
                .subscribe(res => {
                    this.core.hideLoading();
                    resolve(res.json());
                });
        });   
    }

}