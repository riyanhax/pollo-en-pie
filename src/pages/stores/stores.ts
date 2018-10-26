import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { Http } from '@angular/http';

import { Core } from '../../service/core.service';
import {
	GoogleMaps,
	GoogleMap,
	GoogleMapsEvent,
	GoogleMapOptions,
	CameraPosition,
	MarkerOptions,
	Marker,
	LatLngBounds,
	LatLng,
	ILatLng,
	MarkerIcon
} from '@ionic-native/google-maps';
import { Observable } from '../../../node_modules/rxjs/Observable';
import { DelportalDb } from '../../service/delportal.db.service';
/**
 * Generated class for the StoresPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */
declare var wordpress_url: string;


@IonicPage()
@Component({
	selector: 'page-stores',
	templateUrl: 'stores.html',
})
export class StoresPage {

	points: ILatLng[] = [];
	bounds: LatLngBounds;
	map: GoogleMap;
	selectedMarker: Object = {};
	storesList: Object[] = [];
	markersList: Marker[] = [];
	normalMarkerIcon: MarkerIcon = {
		url: 'assets/images/marker.png'
	}
	selectedMarkerIcon: MarkerIcon = {
		url: 'assets/images/marker_red.png'
	}

	constructor(public navCtrl: NavController,
		public navParams: NavParams,
		public core: Core,
		public http: Http,
		public dpdb: DelportalDb
	) {

	}

	ionViewDidLoad() {
		this.loadMap();
		this.getData();
	}
	loadMap() {
		let mapOptions: GoogleMapOptions = {
			camera: {
				target: {
					lat: -2.1444901, // default location
					lng: -79.9685455 // default location
				},
				zoom: 11
			}
		};
		this.map = GoogleMaps.create('map_canvas_stores', mapOptions);

		// Wait the MAP_READY before using any methods.
		this.map.one(GoogleMapsEvent.MAP_READY)
			.then(() => {
				// Now you can use all methods safely.
				this.getData();
			})
			.catch(error => {
				console.log(error);
			});

	}
	getData() {
		this.core.showLoading();
		this.dpdb.getStores().then((stores) => {
			this.storesList = stores;
			this.addMarkersToMap().subscribe(() => {
				this.bounds = new LatLngBounds(this.points);
				this.map.setCameraTarget(this.bounds.getCenter());
			});
			this.core.hideLoading();
		});
	}
	addMarkersToMap(): Observable<Object> {

		return new Observable(observable => {
			let counter = 0;
			
			for (let markerData of this.storesList) {
				let markerOptions: MarkerOptions = {
					icon: {
						url: 'assets/images/marker.png',
					},
					position: {
						lat: markerData['latitude'],
						lng: markerData['longitude']
					},
					title: markerData['name'],
					metaData: markerData['id']
				}
				if (this.map != null)
					this.map.addMarker(markerOptions).then((marker: Marker) => {
						this.markersList = this.markersList.concat(marker);
						marker.on(GoogleMapsEvent.MARKER_CLICK)
							.subscribe(() => {
								this.markersList.forEach(m => {
									if (m.get('metaData') == marker.get('metaData')){
										m.setIcon(this.selectedMarkerIcon);
									} else m.setIcon(this.normalMarkerIcon);
								});
								/*this.data.forEach(markerItem => {
									if (markerItem['id'] == index) {
										this.selectedMarker['id'] = markerItem['id'];
										this.selectedMarker['name'] = markerItem['name'];
										this.selectedMarker['address'] = markerItem['address'];
										this.selectedMarker['opening'] = markerItem['opening'];
										this.selectedMarker['closing'] = markerItem['closing'];
										this.selectedMarker['phone'] = markerItem['phone'];
									}
								});*/

							});

						this.points = this.points.concat(marker.getPosition());
						counter++;
						if (counter == this.storesList.length) {
							observable.next();
							observable.complete();
						}
					});

			}

		});



	}
	setCenter(store) {
		let position = new LatLng(store.latitude, store.longitude);
		this.map.setCameraTarget(position);
		
		this.markersList.forEach(m => {
			if (m.get('metaData') == store.id){
				/*m.setIcon(this.selectedMarkerIcon);*/
				m.trigger(GoogleMapsEvent.MARKER_CLICK);
				/*this.map.trigger(GoogleMapsEvent.MARKER_CLICK)*/
			}/* else m.setIcon(this.normalMarkerIcon);*/
		});
		
	}
}
