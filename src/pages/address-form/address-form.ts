import { Component } from '@angular/core';
import { NavController, NavParams } from 'ionic-angular';
import { Http } from '@angular/http';
import { FormBuilder, FormGroup, Validators, FormControl } from '@angular/forms';
import { CoreValidator } from '../../validator/core';
import { CategoriesPage } from '../categories/categories';

import { Core } from '../../service/core.service';
import { Storage } from '@ionic/storage';
import { StorePage } from '../store/store';
import { DelportalDb } from '../../service/delportal.db.service';
import { Delportal } from '../../service/delportal.service';

/**
 * Generated class for the AddressFormPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */


@Component({
    selector: 'page-address-form',
    templateUrl: 'address-form.html',
})
export class AddressFormPage {
    formDeliveryAddress: FormGroup;
    storePage = StorePage;

    login: Object;
    data: Object;
    id: number;
    storesList: Object[] = [];


    constructor(
        private formBuilder: FormBuilder,
        private navCtrl: NavController,
        public core: Core,
        public http: Http,
        public dpdb: DelportalDb,
        public dp: Delportal,
        public navParams: NavParams,
        public storage: Storage
    ) {
        this.id = this.navParams.get('id');

        this.formDeliveryAddress = this.formBuilder.group({
            id: [0],
            title: ['', Validators.required],
            shipping_address_1: ['', Validators.required],
            shipping_address_2: [''],
            shipping_contact: ['', Validators.required],
            shipping_phone: ['', Validators.required],
            shipping_store: [0, Validators.required],
            shipping_latitude: [''],
            shipping_longitude: [''],
            is_default: [false]
        });
        this.dpdb.getStores().then(stores => {
            this.storesList = stores;
        });
        this.storage.get('login').then(val => {
            this.login = val;
            this.dp.getUserDeliveryAddresses(this.login).then(addresses => {
                if (this.id != 0) {
                    this.data = addresses.find(a => a['id'] == this.id);
                    this.reset();
                }
            });
        });
    }
    ionViewDidLoad() {

    }

    reset() {
        if (this.data == null) return;

        this.formDeliveryAddress.patchValue({
            id: this.data['id'],
            title: this.data['title'],
            shipping_address_1: this.data["shipping_line_1"],
            shipping_address_2: this.data["shipping_line_2"],
            shipping_contact: this.data["shipping_contact"],
            shipping_phone: this.data["shipping_phone"],
            shipping_store: this.data["shipping_store"],
            shipping_latitude: this.data["shipping_latitude"],
            shipping_longitude: this.data["shipping_longitude"],
            is_default: this.data['is_default']

        });
    }
    /*
        conf() {
            if (this.navCtrl.getPrevious() && this.navCtrl.getPrevious().component == this.CategoriesPage)
                this.navCtrl.pop();
            else this.navCtrl.push(this.CategoriesPage);
        }
    */
    save() {
        if (this.login){
            this.dp.saveDeliveryAddress(this.login, this.formDeliveryAddress.value).then(data => {
                this.navCtrl.pop();
            });
        } else {
            this.storage.set("workingDeliveryAddress", this.formDeliveryAddress.value).then(() => {
                this.navCtrl.setRoot(StorePage);
            });
        }
            
    }

}
