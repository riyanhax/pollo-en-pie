import { Component } from '@angular/core';
import { NavController, AlertController, Events } from 'ionic-angular';

import { Storage } from '@ionic/storage';
import { Toast } from '@ionic-native/toast';

import { LoginPage } from '../login/login';
import { DetailShoppingListPage } from '../shopping-list-detail/shopping-list-detail';
import { Core } from '../../service/core.service';
import { StorageMulti } from '../../service/storage-multi.service';
import { Delportal } from '../../service/delportal.service';


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
                        let existing = this.shoppingLists.findIndex((sl) => sl['title'] == data.listName);
                        if (existing > -1){
                            this.toast.showLongBottom("Ya hay otra lista con ese nombre").subscribe(
                                toast => { },
                                error => { console.log(error); }
                            );
                        } else {
                            this.dp.addUserShoppingList(this.login, data.listName).then((val) => {
                                let prevShoppingLists = this.shoppingLists;
                                let newId = 0;
                                this.shoppingLists = val;
                                if (prevShoppingLists.length == 0){
                                    newId = this.shoppingLists[0]['id'];
                                } else {
                                    let newItem = this.shoppingLists.find(item => item['title'] == data.listName);
                                    newId = newItem['id'];
                                    
                                }
                                
                                this.noResult = false;
                                this.navCtrl.push(DetailShoppingListPage, {id: newId});
                            });
                        }
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

    rename(shoppingListId: number){
        let alert = this.alertCtrl.create({
            title: "Cambiar Nombre",
            subTitle: "Cambiar nombre a lista",

            inputs: [
                {
                    name: 'listName',
                    placeholder: 'Ingrese el nuevo nombre de la lista'
                }
            ],
            buttons: [
                {
                    text: "Cancelar",
                    role: 'cancel'
                },
                {
                    text: "Grabar",
                    role: 'cancel',
                    handler: (data) => {
                        let existing = this.shoppingLists.findIndex((sl) => sl['title'] == data.listName);
                        if (existing > -1){
                            this.toast.showShortBottom("Ya hay otra con ese nombre").subscribe(
                                toast => { },
                                error => { console.log(error); }
                            );
                        }else {
                            this.dp.renameShoppingList(this.login, shoppingListId, data.listName).then((val) => {
                                this.shoppingLists = val;
                            });
                        }
                    }
                }
            ]
        });
        alert.present();
    }
}