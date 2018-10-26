import { AutoCompleteService } from 'ionic2-auto-complete';
import { Http } from '@angular/http';
import { Injectable } from "@angular/core";
import 'rxjs/add/operator/map'
import { Core } from './core.service';
import { DelportalDb } from './delportal.db.service';

declare var wordpress_url: string;


@Injectable()
export class DelportalSearchService /*implements AutoCompleteService*/ {
	labelAttribute = "name";


	constructor(private http: Http, public core: Core, public dpdb: DelportalDb ) {

	}
	getResults(keyword: string) {

		if (keyword.length < 3)
			return new Promise<Object[]>((resolve, reject) => {
				resolve([]);
			});
		return new Promise<Object[]>((resolve, reject) => {
			this.dpdb.searchProduct(keyword, 0).then((products) => {
				resolve(products);
			});
		});
	}
}