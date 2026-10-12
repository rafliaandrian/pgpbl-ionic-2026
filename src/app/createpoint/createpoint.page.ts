import { Component, OnInit, inject } from '@angular/core';
import { NavController, AlertController } from '@ionic/angular';
import { DataService } from '../data.service';

import * as L from 'leaflet';
import { icon, Marker } from 'leaflet';

const iconRetinaUrl = 'assets/icon/marker-icon-2x.png';
const iconUrl = 'assets/icon/marker-icon.png';
const shadowUrl = 'assets/icon/marker-shadow.png';

const iconDefault = icon({
  iconRetinaUrl,
  iconUrl,
  shadowUrl,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  tooltipAnchor: [16, -28],
  shadowSize: [41, 41]
});

Marker.prototype.options.icon = iconDefault;

@Component({
  selector: 'app-createpoint',
  templateUrl: './createpoint.page.html',
  styleUrls: ['./createpoint.page.scss'],
  standalone: false
})
export class CreatepointPage implements OnInit {

  private navCtrl = inject(NavController);
  private alertCtrl = inject(AlertController);
  private dataService = inject(DataService);

  name = '';
  coordinates = '';
  description = '';

  map!: L.Map;

  ngOnInit() {
    setTimeout(() => {
      this.map = L.map('mapcreate').setView(
        [-7.7956, 110.3695],
        13
      );

      const osm = L.tileLayer(
        'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
        {
          attribution: '© OpenStreetMap contributors'
        }
      );

      const esri = L.tileLayer(
        'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
        {
          attribution: 'ESRI'
        }
      );

      osm.addTo(this.map);

      const baseMaps = {
        'OpenStreetMap': osm,
        'Esri World Imagery': esri
      };

      L.control.layers(baseMaps).addTo(this.map);

      const tooltip =
        'Drag the marker or move the map to change the coordinates of the location';

      const marker = L.marker(
        [-7.7956, 110.3695],
        {
          draggable: true
        }
      );

      marker.addTo(this.map);

      marker.bindPopup(tooltip);
      marker.openPopup();

      marker.on('dragend', (e) => {
        const latlng = e.target.getLatLng();

        const lat = latlng.lat.toFixed(9);
        const lng = latlng.lng.toFixed(9);

        this.coordinates = lat + ',' + lng;

        console.log(this.coordinates);
      });

      setTimeout(() => {
        this.map.invalidateSize();
      }, 200);
    }, 100);
  }

  async save() {
    if (this.name && this.coordinates && this.description) {
      try {
        const pointData = {
          name: this.name,
          coordinates: this.coordinates,
          description: this.description
        };

        await this.dataService.savePoint(pointData);

        this.navCtrl.back();

      } catch (error: any) {
        const alert = await this.alertCtrl.create({
          header: 'Save Failed',
          message: error.message,
          buttons: ['OK']
        });

        await alert.present();
      }
    }
  }
}
