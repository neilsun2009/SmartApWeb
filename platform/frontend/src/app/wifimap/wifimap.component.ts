import { Component, OnInit } from '@angular/core';
import { HttpService } from '../services/http.service';

@Component({
  selector: 'app-wifimap',
  templateUrl: './wifimap.component.html',
  styleUrls: ['./wifimap.component.less']
})
export class WifimapComponent implements OnInit {
  
  private bm: any;
  showLoading: boolean;

  constructor(
    private httpService: HttpService
  ) { 
    this.showLoading = false;
  }

  ngOnInit() {
    this.bm = new window['BMap'].Map("container");
    this.bm.addControl(new window['BMap'].NavigationControl());
    this.bm.enableScrollWheelZoom(true);
    this.getData();
  }

  getData() {
    this.showLoading = true;
    this.httpService.get('http://localhost:8983/solr/wifi_ssid_db/select?fl=name,intro,address,baidu_lat,baidu_lon&q=*:*&rows=1000',
    (data) => {
      this.drawWifiMap(data) 
    },
    (err) => {
      alert('err');
    })
  }

  drawWifiMap(data) {
    let arr = data.response.docs,
      points = [],
      markers = [],
      // times = [],
      markerClusterer,
      // convertor = new BMap.Convertor(),
      i, len, current, prev = null, first = true;
    if (arr.length === 0) {
      alert('已无记录');
      this.showLoading = false;
      return;
    }
    this.bm.clearOverlays();
    for (len = arr.length, i = 0; i < len; ++i) {
      if (arr[i].baidu_lon && arr[i].baidu_lat) {
        // console.log(current);
        let marker;
        current = arr[i];
        points.push(new window['BMap'].Point(current.baidu_lon, current.baidu_lat))
        marker = new window['BMap'].Marker(points[i]);
        marker.setTitle(current.name);
        (function(current, marker) {
          marker.addEventListener('click', function(e) {
            var str = current.name + '\n' + (current.intro ? current.intro + '\n' : '') + current.address
            alert(str);
          });
        })(current, marker);
        markers.push(marker);
        // bm.addOverlay(marker);
        if  (i === 0) { // first
          this.bm.centerAndZoom(points[0], 15);
        }
      }
    }
    markerClusterer = new window['BMapLib'].MarkerClusterer(this.bm, {markers:markers});
    this.showLoading = false;
  }

}
