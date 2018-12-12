import { Component, ViewChild, ElementRef, NgZone } from '@angular/core';
import { IonicPage, NavController, NavParams, ViewController, AlertController } from 'ionic-angular';
import { GoogleMapsProvider } from '../../providers/google-maps/google-maps';
import { GoogleMapOptions, GoogleMaps, GoogleMapsEvent, ILatLng, GoogleMap, Marker, LatLng, Spherical, Geocoder, GeocoderResult } from '@ionic-native/google-maps';
import { DelportalDb } from '../../service/delportal.db.service';
import { Network } from '@ionic-native/network';
import { Storage } from '@ionic/storage';

import { google } from 'google-maps';
import { StorePage } from '../store/store';
import { AddressFormPage } from '../address-form/address-form';

/**
 * Generated class for the LocationSelectPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

declare var max_distance: number;
declare var google_maps_apiKey : string;

@IonicPage()
@Component({
    selector: 'page-location-select',
    templateUrl: 'location-select.html',
})
export class LocationSelectPage {

    @ViewChild('mapLocation') mapLocation: ElementRef;

    map: GoogleMap;
    latitude: number;
    longitude: number;
    autocompleteService: any;
    placesService: any;
    query: string = '';
    places: any = [];
    searchDisabled: boolean;
    saveDisabled: boolean;
    location: any;
    marker: Marker;
    stores: Object[];
    StorePage = StorePage;
    AddressFormPage = AddressFormPage;
    nearestStore: Object;
    selectedAddress: Object = {};
    noCoverage = true;
    source : string;
    lastLatLng: ILatLng = { lat: -2.0393651, lng: -79.9112325 };


    constructor(public navCtrl: NavController,
        public navParams: NavParams,
        public maps: GoogleMapsProvider,
        private storage: Storage,
        public zone: NgZone,
        public network: Network,
        public dpdb: DelportalDb,
        public viewCtrl: ViewController,
        private alertCtrl: AlertController, ) {

        this.searchDisabled = true;
        this.saveDisabled = true;

        this.dpdb.getStores().then((stores) => {
            this.stores = stores;
        });

        window['mapInit'] = () => {
            
        }

        if (document.getElementById('googleMaps') == null){

            let script = document.createElement("script");
            script.id = "googleMaps";
    
            if (google_maps_apiKey) {
                script.src = 'http://maps.google.com/maps/api/js?key=' + google_maps_apiKey + '&callback=mapInit&libraries=places';
            } else {
                script.src = 'http://maps.google.com/maps/api/js?callback=mapInit';
            }
            document.body.appendChild(script);
        }

    }

    ionViewDidEnter() {
        this.loadMap();
        this.source = this.navParams.get('source');
    }

    loadMap() {

        let mapOptions: GoogleMapOptions = {
            camera: {
                target: this.lastLatLng,
                zoom: 16,
                tilt: 30
            },
            controls: {
                compass: true,
                myLocationButton: true,
                myLocation: true,   // (blue dot)
                indoorPicker: true,
                zoom: true,          // android only
                mapToolbar: true     // android only
            },

            gestures: {
                scroll: true,
                tilt: true,
                zoom: true,
                rotate: true
            },
        };

        this.map = GoogleMaps.create('mapLocation', mapOptions);

        // Wait the MAP_READY before using any methods.
        this.map.one(GoogleMapsEvent.MAP_READY)
            .then(() => {
                // Now you can use all methods safely.
                this.getPosition();
                this.autocompleteService = new google.maps.places.AutocompleteService();
                this.placesService = new google.maps.places.PlacesService(this.mapLocation.nativeElement);
                this.searchDisabled = false;

            })
            .catch(error => {
                console.log(error);
            });
        this.map.on(GoogleMapsEvent.MAP_DRAG).subscribe(
            () => {
                let pos = this.map.getCameraTarget();

                this.marker.setPosition(pos);
            }
        );
        this.map.on(GoogleMapsEvent.MAP_DRAG_END).subscribe(
            () => {
                let pos = this.map.getCameraTarget();
                this.lastLatLng = pos;
                this.setReverseAddress(pos);
                this.setNearestStore(pos);
            }
        );
        this.map.on(GoogleMapsEvent.MY_LOCATION_BUTTON_CLICK).subscribe(
            () => {
                this.map.getMyLocation().then(response => {
                    this.marker.setPosition(response.latLng);
                    this.lastLatLng = response.latLng;
                    this.setReverseAddress(response.latLng);
                });

            }
        );


    }

    getPosition(): void {

        this.map.getMyLocation()
            .then(response => {
                this.map.moveCamera({
                    target: response.latLng
                });
                this.map.addMarker({
                    title: 'Mi ubicación',
                    icon: {
                        url: 'assets/images/marker.png'
                    },
                    animation: 'DROP',
                    position: response.latLng,
                }).then((marker) => {
                    this.marker = marker;
                });

                this.lastLatLng = response.latLng;

                this.setNearestStore(response.latLng);
            })
            .catch(error => {
                console.log(error);
            });
    }

    private setNearestStore(latlng: ILatLng) {
        let ns: Object = {};
        let minDistance = 999999999999999;
        this.stores.forEach(element => {
            let storeLatLng = new LatLng(element['latitude'], element['longitude']);
            let distance = Spherical.computeDistanceBetween(storeLatLng, latlng);
            if (distance < minDistance) {
                ns = element;
                minDistance = distance;
                this.nearestStore = ns;
            }
        });
        if (minDistance > max_distance) {
        }
        else {
            this.noCoverage = false;
            if (this.source != 'form') {
                this.validateHours(ns['opening'], ns['closing']);
            }
        }
    }

    validateHours(opening: string, closing: string) {
        let currentDate = new Date();
        let currentTime = Date.parse("01/01/2011 " + currentDate.getHours() + ":" + (currentDate.getMinutes() < 10 ? "0" : "") + currentDate.getMinutes());
        let openingTime = Date.parse("01/01/2011 " + opening);
        let closingTime = Date.parse("01/01/2011 " + closing);
        if (openingTime <= currentTime && currentTime <= closingTime) {
            this.noCoverage = false;
        } else {
            /* Almacén Cerrado */
            let alert = this.alertCtrl.create({
                cssClass: 'closedStore',
                title: '<span>😅</span> <br /> Lo sentimos, ha terminado el horario de entregas a domicilio',
                subTitle: 'Tu pedido será recibido pero será entregado el día de mañana',
                buttons: [{
                    text: 'Continuar',
                    handler: () => {
                        this.noCoverage = true;
                    }
                }
                ]
            });
            alert.present();
        }
    }

    private setReverseAddress(pos: ILatLng) {
        Geocoder.geocode({
            "position": pos
        }).then((results: GeocoderResult[]) => {
            if (results.length == 0) {
                return null;
            }
            this.zone.run(() => {
                this.query = results[0].extra.lines[0];
            })
        });

    }

    selectPlace(place) {

        this.places = [];

        let location = {
            lat: null,
            lng: null,
            name: place.name
        };

        this.placesService.getDetails({ placeId: place.place_id }, (details) => {

            this.zone.run(() => {

                location.name = details.name;
                location.lat = details.geometry.location.lat();
                location.lng = details.geometry.location.lng();
                this.saveDisabled = false;

                this.map.setCameraTarget({ lat: location.lat, lng: location.lng });

                this.map.addMarker({
                    title: 'Mi ubicación',
                    icon: {
                        url: 'assets/images/marker.png'
                    },
                    animation: 'DROP',
                    position: { lat: location.lat, lng: location.lng },
                }).then((marker) => this.marker = marker);

                this.location = location;

            });

        });

    }

    searchPlace() {

        this.saveDisabled = true;

        if (this.query.length > 0 && !this.searchDisabled) {

            let config = {
                types: ['geocode'],
                input: this.query,
                location: { lat: -2.2038, lng: -79.8975 },
                radius: 50000
            }

            this.autocompleteService.getPlacePredictions(config, (predictions, status) => {

                if (status == google.maps.places.PlacesServiceStatus.OK && predictions) {

                    this.places = [];

                    predictions.forEach((prediction) => {
                        this.places.push(prediction);
                    });
                }

            });

        } else {
            this.places = [];
        }

    }

    save() {
        this.selectedAddress['shipping_address_1'] = this.query;
		this.selectedAddress['shipping_latitude'] = this.lastLatLng.lat;
		this.selectedAddress['shipping_longitude'] = this.lastLatLng.lng;
		this.selectedAddress['shipping_store'] = this.nearestStore['store_id'];
        
        if (this.source == 'form'){
            this.storage.set("tempAddress", this.selectedAddress);
            this.navCtrl.pop();
        }
        else {
            this.storage.set('workingDeliveryAddress', this.selectedAddress );
            this.navCtrl.push(StorePage);
        }
		    
    }

    close() {
        this.navCtrl.pop();
    }

}
