import { Component } from '@angular/core';
import { NavController, AlertController, Events } from 'ionic-angular';
import { Http } from '@angular/http';

import { Storage } from '@ionic/storage';
import { Toast } from '@ionic-native/toast';

import { LoginPage } from '../login/login';
import { DetailShoppingListPage } from '../shopping-list-detail/shopping-list-detail';
import { Core } from '../../service/core.service';
import { StorageMulti } from '../../service/storage-multi.service';
import { Delportal } from '../../service/delportal.service';

declare var wordpress_url: string;


@Component({
    selector: 'page-shopping-lists',
    templateUrl: 'shopping-lists.html'
})

export class ShoppingListsPage {
    DetailShoppingListPage = DetailShoppingListPage;
    LoginPage = LoginPage;
    shoppingLists: Object[] = [];
    loggedIn: boolean = false;
    login: Object;
    loggedUser: any = {};

    noResult: boolean = false;

    constructor(
        private navCtrl: NavController,
        private alertCtrl: AlertController,
        private storage: Storage,
        private storageMul: StorageMulti,
        private toast: Toast,
        private core: Core,
        private events: Events,

        private dp: Delportal
    ) {


        this.events.subscribe('loggedin', (user) => {
            this.getData();
        });

        this.events.subscribe('loggedOut', (user) => {
            this.login = null;
            this.loggedIn = false;
            this.shoppingLists = null;
        });

    }

    ionViewDidEnter() {
        this.getData();
    }

    private getData() {

        this.storage.get('login').then((val) => {

            if (val) {
                this.login = val;
                this.loggedIn = true;
                this.dp.getUserShoppingLists(this.login).then((val) => {
                    this.shoppingLists = val;
                    if (this.shoppingLists.length <= 0)
                        this.noResult = true;
                    else this.noResult = false;
                });
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

    gotoLogin() {
        this.navCtrl.push(LoginPage);
    }

    addNewList() {
        let alert = this.alertCtrl.create({
            title: "Nueva Lista",
            subTitle: "Crear una nueva lista de compras",

            inputs: [
                {
                    name: 'listName',
                    placeholder: 'Dale un nombre a la nueva lista'
                }
            ],
            buttons: [
                {
                    text: "Cancelar",
                    role: 'cancel'
                },
                {
                    text: "Grabar",
                    handler: (data) => {
                        this.dp.addUserShoppingList(this.login, data.listName).then((val) => {
                            this.shoppingLists = val;
                            if (this.shoppingLists.length <= 0)
                                this.noResult = true;
                            else this.noResult = false;
                        });;

                    }
                }
            ]
        });
        alert.present();
    }

    delete(shoppingListId: number) {
        this.dp.deleteShoppingList(this.login, shoppingListId).then(data => {
            this.shoppingLists = data;

            if (this.shoppingLists.length <= 0)
                this.noResult = true;
            else this.noResult = false;
        });
    }
}