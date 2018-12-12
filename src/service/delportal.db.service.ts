import { Injectable } from '@angular/core';
import { HttpClientModule, HttpClient } from '@angular/common/http';
import { Storage } from '@ionic/storage';

import { Toast } from '@ionic-native/toast';
import { SQLite, SQLiteObject } from '@ionic-native/sqlite';
import { Observable } from 'rxjs/Observable';



declare var wordpress_per_page: number;

@Injectable()
export class DelportalDb {

	public db: SQLiteObject = null;

	constructor(private storage: Storage,
		public http: HttpClient,
		public toast: Toast,
		private sqlite: SQLite
	) {

	}

	openDb(){
		
		return this.sqlite.create({
			name: 'delportal.db',
			location: 'default',
			createFromLocation: 1
		}).then((db: SQLiteObject) => {
			this.db = db;
		}).catch((error) => console.log("error Opening" + JSON.stringify(error)));
	}

	/*syncDb(catalog_version: number){
		return this.sqlite.create({
			name: 'delportal.db',
			location: this.file.dataDirectory
		}).then((db: SQLiteObject) => {
			this.db = db;
			return this.db.executeSql(this.ddlSentence1, []);
		}).then( () => {
			return this.db.executeSql(this.ddlSentence2, []);
		})
		.then(() => {
			return this.db.executeSql("SELECT value FROM dp_params where id='catalog_version'", []).then(res => {
				if (res.rows.length <= 0){
					return this.downloadAndSync();
	
				} else {
					let currentVersion = res.rows.item(0)['value'];
					if (currentVersion < catalog_version){
						return this.downloadAndSync();
					}
					return true; 
				}
			})
		})
		.catch((error) => console.log("error ddl " + JSON.stringify(error)));	;
	}*/

	compareAndSync(version: number) {
		return new Promise<any>((resolve, reject) => {
			this.db.executeSql("SELECT value FROM parameters where id='catalog_version'", []).then(response => {
				if (response) {
					if (response.rows.item(0)[0] < version) {

					}
				};

			});
		});
	}

	

	downloadProductsFile(serverCatalogVersion) {
		
		
		/*return new Promise<any> ((reject, resolve) => {
			this.http.get(wordpress_url + '/wp-content/uploads/delportal.db', { responseType: 'blob'}).subscribe((db: Blob) => {
				return this.file.writeFile(this.file.applicationStorageDirectory + 'databases', 'delportal.db', db, {replace : true});
			}, (error) => {console.log(JSON.stringify(error))} 
			);
		});*/
					
	}

	getBestSales(storeCode: string, page: number, sortOrder?: string) {
		return new Promise<Object[]>((resolve, reject) => {
			let offset = wordpress_per_page * (page-1);
			let sortSql = this.getSortOrder(sortOrder);
			this.openDb().then( () => {
				this.db.executeSql("SELECT p.* FROM products p JOIN productsStore ps ON ps.idProduct = p.id WHERE ps.idStore = '''" + storeCode + "''' ORDER BY total_sales DESC, " + sortSql + " LIMIT " + wordpress_per_page + " OFFSET " + offset, [])
				.then((res) => {
					var all_rows = [];
					for (let index = 0; index < res.rows.length; index++) {
						all_rows.push(res.rows.item(index));
					}
					this.db.close();
					
					resolve(all_rows);
				}).catch((errorSQL) => console.log("error getbestsales " + JSON.stringify(errorSQL)));
			});
			
		});
		
		
	}

	getProducts(page: number, category: number, storeCode: string, sortOrder?: string){
		return new Promise<Object[]>((resolve, reject) => {
			let offset = wordpress_per_page * (page-1);
			let sortSql = this.getSortOrder(sortOrder);
			this.openDb().then( () => {
				this.db.executeSql("SELECT p.* FROM products p JOIN productsStore ps ON ps.idProduct = p.id where category=" + category + " AND ps.idStore = '''" + storeCode + "''' ORDER BY " + sortSql + " LIMIT " + wordpress_per_page + " OFFSET " + offset, [])
				.then((res) => {
					var all_rows = [];
					for (let index = 0; index < res.rows.length; index++) {
						all_rows.push(res.rows.item(index));
					}
					this.db.close();
					resolve(all_rows);
				}).catch((errorSQL) => console.log("error products " + JSON.stringify(errorSQL) ));
			});
		});

	}

	getProduct(id: number){
		return new Promise<Object[]>((resolve, reject) => {
			
			this.openDb().then( () => {
				this.db.executeSql("SELECT * FROM products where id=" + id, [])
				.then((res) => {
					var all_rows = [];
					for (let index = 0; index < res.rows.length; index++) {
						all_rows.push(res.rows.item(index));
					}
					this.db.close();
					if (all_rows.length > 0)
						resolve(all_rows[0]);
					else resolve(null);
				}).catch((errorSQL) => console.log("error getProduct " + JSON.stringify(errorSQL) ));
			});
		});

	}

	getProductByBarcode(barcode: string){
		return new Promise<Object[]>((resolve, reject) => {
			this.openDb().then( () => {
				this.db.executeSql("SELECT * FROM products where barcode='" + barcode + "'", [])
				.then((res) => {
					var all_rows = [];
					for (let index = 0; index < res.rows.length; index++) {
						all_rows.push(res.rows.item(index));
					}
					this.db.close();
					resolve(all_rows);
				}).catch((errorSQL) => console.log("error barcode " + JSON.stringify(errorSQL) ));
			});
		});
	}

	searchProduct(keyword: string, page: number, sortOrder?: string){
		return new Promise<Object[]>((resolve, reject) => {
			let offset = wordpress_per_page * (page-1);
			let sortSql = this.getSortOrder(sortOrder);
			let sentence = "SELECT p.* FROM products p join categories subcat on subcat.id = p.category join categories cat on cat.id = subcat.parent_id where p.name LIKE '%" + keyword + "%' OR subcat.name LIKE '%" + keyword + "%' OR cat.name LIKE '%" + keyword + "%' ORDER BY " + sortSql + " LIMIT " + wordpress_per_page + " OFFSET " + offset;
			if (page == 0)
				sentence = "SELECT p.* FROM products p join categories subcat on subcat.id = p.category join categories cat on cat.id = subcat.parent_id where p.name LIKE '%" + keyword + "%' OR subcat.name LIKE '%" + keyword + "%' OR cat.name LIKE '%" + keyword + "%' ORDER BY " + sortSql;

			this.openDb().then( () => {
				
				this.db.executeSql(sentence, [])
				.then((res) => {
					var all_rows = [];
					console.log(res.rows.length);
					for (let index = 0; index < res.rows.length; index++) {
						all_rows.push(res.rows.item(index));
					}
					this.db.close();
					resolve(all_rows);
				}).catch((errorSQL) => console.log("error search " + JSON.stringify(errorSQL) ));
			});
		});
	}

	getProductsById(productIds: string){
		return new Promise<Object[]>((resolve, reject) => {
			
			this.openDb().then( () => {
				this.db.executeSql("SELECT * FROM products where id in (" + productIds + ")", [])
				.then((res) => {
					var all_rows = [];
					for (let index = 0; index < res.rows.length; index++) {
						all_rows.push(res.rows.item(index));
					}
					this.db.close();
					if (all_rows.length > 0)
						resolve(all_rows);
					else resolve([]);
				}).catch((errorSQL) => console.log("error getProduct " + JSON.stringify(errorSQL) ));
			});
		});
	}

	getStores() {
		return new Promise<Object[]>((resolve, reject) => {
			
			
			this.openDb().then( () => {
				this.db.executeSql("SELECT * FROM stores", [])
				.then((res) => {
					var all_rows = [];
					for (let index = 0; index < res.rows.length; index++) {
						all_rows.push(res.rows.item(index));
					}
					this.db.close();
					resolve(all_rows);
				}).catch((errorSQL) => console.log("error stores " + JSON.stringify(errorSQL) ));
			});
		});
	}

	getAllCats(){
		return new Promise<Object[]>((resolve, reject) => {
			this.openDb().then(() => {
				this.db.executeSql("SELECT * FROM categories", [])
				.then((res) => {
					var all_rows = [];
					for (let index = 0; index < res.rows.length; index++) {
						all_rows.push(res.rows.item(index));
					}
					this.db.close();
					resolve(all_rows);
				}).catch((errorSQL) => console.log("error categories " + JSON.stringify(errorSQL) ));
			})
		});
	}

	getSortOrder(sortOrder: string){
		let sortSql = "";
			switch (sortOrder) {
				case "-date":
					sortSql = " date_created DESC ";
					break;
				case "-bestsale":
					sortSql = " total_sales DESC ";
					break;
				case "price":
					sortSql = " price ASC";
					break;
				case "-price":
					sortSql = " price DESC";
					break;
				default:
					sortSql = " id ASC";
					break;
			}
		return sortSql;
	}

}