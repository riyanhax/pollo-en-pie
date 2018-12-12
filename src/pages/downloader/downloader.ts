import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { DeliveryAddressPage } from '../delivery-address/delivery-address';
import { Storage } from '@ionic/storage';

import { FileTransfer, FileTransferObject } from '@ionic-native/file-transfer';
import { File } from '@ionic-native/file';

/**
 * Generated class for the DownloaderPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

declare var wordpress_url: string;


@IonicPage()
@Component({
	selector: 'page-downloader',
	templateUrl: 'downloader.html',
})
export class DownloaderPage {

	loadProgress: number;
	serverCatalogVersion: number;
	DeliveryAddressPage: DeliveryAddressPage;
	fileTransfer: FileTransferObject;
	searching: Boolean = true;

	constructor(public navCtrl: NavController, 
		public navParams: NavParams,
		public storage: Storage,
		private transfer: FileTransfer, private file: File
		) {

			this.fileTransfer = this.transfer.create();
			this.fileTransfer.onProgress((progress) => {
				console.log(progress);
			});
	}

	ionViewDidEnter() {
		this.storage.get('serverCatalogVersion').then((serverCatalogVersion) => {
			
			this.fileTransfer.download(wordpress_url + '/wp-content/uploads/delportal.db', this.file.applicationStorageDirectory + 'databases/delportal.db')
				.then((entry) => {
					this.storage.set('catalog_version', serverCatalogVersion);
					this.searching = false;
					this.navCtrl.setRoot(DeliveryAddressPage);
				}, (error) => {
					console.log("error al descargar ");
					console.log(JSON.stringify(error));
				});
		});

	}

}
