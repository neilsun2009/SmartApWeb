import { Component, OnInit } from '@angular/core';
import { HttpService } from '../services/http.service';

const x_PI = 3.14159265358979324 * 3000.0 / 180.0;
const PI = 3.1415926535897932384626;
const a = 6378245.0;
const ee = 0.00669342162296594323;

@Component({
  selector: 'app-maclocation',
  templateUrl: './maclocation.component.html',
  styleUrls: ['./maclocation.component.less']
})
export class MaclocationComponent implements OnInit {
  
  private bm: any;
  private startNow: number;
  private macOffsetNow: number;
  currentMac: string;
  private startTime: string;
  private endTime: string;
  startTimeOut: string;
  endTimeOut:string;
  macs: any[];
  showLoading: boolean;

  constructor(
    private httpService: HttpService
  ) { 
    this.currentMac = '00-00-00-00-00-00';
    this.startTime = '2017-05-10T00:00:00Z';
    this.endTime = '2017-05-15T00:00:00Z';
    this.startTimeOut = this.startTime;
    this.endTimeOut = this.endTime;
    this.startNow = 0;
    this.macOffsetNow = 0;
    this.showLoading = false;
  }

  ngOnInit() {
    this.bm = new window['BMap'].Map("container");
    this.bm.addControl(new window['BMap'].NavigationControl());
    this.bm.enableScrollWheelZoom(true);
    this.getMacs(this.macOffsetNow);
    this.changeMac(this.currentMac);
  }

  getMacs(offset) {
    this.httpService.get(`http://localhost:8983/solr/terminal_feature_db/select?facet.field=mac&facet=on&q=*:*&rows=0&sort=mac%20asc&facet.limit=50&facet.offset=${offset}`,
    (data) => {
      let arr = data.facet_counts.facet_fields.mac,
        macs = [];
      for (let i = 0, len = arr.length; i < len; i += 2) {
        macs.push({mac: arr[i],count: arr[i+1]});
      }
      this.macs = macs;
    },
    (err) => {
      alert('err');
    })
  }

  getLocations(mac, start, startTime, endTime) {
    this.showLoading = true;
    this.httpService.get(`http://localhost:8983/solr/terminal_feature_db/select?fl=latitude,longitude,mac_type,cap_time&q=mac:${mac}&rows=10000&sort=cap_time%20desc&start=${start}& fq=cap_time:[${startTime}%20TO%20${endTime}]`,
    (data) => {
      function draw(data, that) {
        let label, marker;
        // console.log(data);
        points.push(that.wgs84togcj02(data.longitude, data.latitude));
          // times.push(arr[i].cap_time);
        marker = new window['BMap'].Marker(points[points.length - 1]);
        that.bm.addOverlay(marker);
        label = new window['BMap'].Label(labelStr.st + ' ~ ' + labelStr.en);
        marker.setLabel(label);
      };
			let arr = data.response.docs,
				points = [],
				// times = [],
				labelStr = {
					st: '',
					en: ''
        },
        polyline,
				// convertor = new BMap.Convertor(),
				current, prev = null, first = true;
      // console.log(arr);
      if (arr.length === 0) {
				alert('已无记录');
				return;
			}
			this.bm.clearOverlays();
			for (let len = arr.length, i = len - 1; i >= 0; --i) {
				if (arr[i].longitude && arr[i].latitude) {
					// console.log(current);
					current = arr[i];
					if (!prev) {
						labelStr.st = current.cap_time;
					} else {
						// console.log(current);
						if (current.longitude !== prev.longitude && current.latitude !== prev.latitude) {
							labelStr.en = prev.cap_time;
							// points.push(new BMap.Point(arr[i].longitude, arr[i].latitude));
							draw(prev, this);
						    labelStr.st = current.cap_time;
						    labelStr.en = '';
						    if  (points.length === 1) { // first
							this.bm.centerAndZoom(points[0], 15);
						    }		
						}
					}
					if (i === 0) {
						labelStr.en = current.cap_time;
						draw(current, this);
					}
				    prev = current;
				}
			}
			this.bm.centerAndZoom(points[points.length - 1], 15);
			polyline = new window['BMap'].Polyline(points);
			this.bm.addOverlay(polyline);
      this.showLoading = false;
    },
    (err) => {
      alert('err');
    })
  }

  last10000() {
    if (this.startNow < 10000) {
      alert('已到最早1000条');
      return;
    }
    this.startNow -= 10000;
    this.getLocations(this.currentMac, this.startNow, this.startTime, this.endTime);    
  }

  next10000() {
    this.startNow += 10000;
    this.getLocations(this.currentMac, this.startNow, this.startTime, this.endTime);
  }

  changeDate() {
    function getTime(date) {
      var year = date.getUTCFullYear(),
        month = date.getUTCMonth() + 1,
        day = date.getUTCDate(),
        hour = date.getUTCHours();
      return year + '-' + month + '-' + day + 'T' + hour + ':00:00Z';
    }
    // con
    this.startTime = getTime(new Date(this.startTimeOut)),
    this.endTime = getTime(new Date(this.endTimeOut));
    // console.log(start.value);
    this.getLocations(this.currentMac, this.startNow, this.startTime, this.endTime);
    
    // console.log(Date.now());
  }

  changeMac(mac) {
    this.startNow = 0;
    this.currentMac = mac;
    this.getLocations(this.currentMac, this.startNow, this.startTime, this.endTime);
  }

  last50Mac() {
    if (this.macOffsetNow < 50) {
      alert('已到最早50条');
      return;
    }
    this.macOffsetNow -= 50;
    this.getMacs(this.macOffsetNow);
  }

  next50Mac() {
    this.macOffsetNow += 50;
    this.getMacs(this.macOffsetNow);
    
  }

  out_of_china(lng, lat) {
    return (lng < 72.004 || lng > 137.8347) || ((lat < 0.8293 || lat > 55.8271) || false);
  }

  transformlat(lng, lat) {
    var ret = -100.0 + 2.0 * lng + 3.0 * lat + 0.2 * lat * lat + 0.1 * lng * lat + 0.2 * Math.sqrt(Math.abs(lng));
    ret += (20.0 * Math.sin(6.0 * lng * Math.PI) + 20.0 * Math.sin(2.0 * lng * Math.PI)) * 2.0 / 3.0;
    ret += (20.0 * Math.sin(lat * Math.PI) + 40.0 * Math.sin(lat / 3.0 * Math.PI)) * 2.0 / 3.0;
    ret += (160.0 * Math.sin(lat / 12.0 * Math.PI) + 320 * Math.sin(lat * Math.PI / 30.0)) * 2.0 / 3.0;
    return ret
  }

  transformlng(lng, lat) {
    var ret = 300.0 + lng + 2.0 * lat + 0.1 * lng * lng + 0.1 * lng * lat + 0.1 * Math.sqrt(Math.abs(lng));
    ret += (20.0 * Math.sin(6.0 * lng * Math.PI) + 20.0 * Math.sin(2.0 * lng * Math.PI)) * 2.0 / 3.0;
    ret += (20.0 * Math.sin(lng * Math.PI) + 40.0 * Math.sin(lng / 3.0 * Math.PI)) * 2.0 / 3.0;
    ret += (150.0 * Math.sin(lng / 12.0 * Math.PI) + 300.0 * Math.sin(lng / 30.0 * Math.PI)) * 2.0 / 3.0;
    return ret;
  }

  gcj02tobd09(lng, lat) {
    var z = Math.sqrt(lng * lng + lat * lat) + 0.00002 * Math.sin(lat * x_PI);
    var theta = Math.atan2(lat, lng) + 0.000003 * Math.cos(lng * x_PI);
    var bd_lng = z * Math.cos(theta) + 0.0065;
    var bd_lat = z * Math.sin(theta) + 0.006;
    return new window['BMap'].Point(bd_lng, bd_lat);
  }

  wgs84togcj02(lng, lat) {
    if (this.out_of_china(lng, lat)) {
        return this.gcj02tobd09(lng, lat);
    }
    else {
        var dlat = this.transformlat(lng - 105.0, lat - 35.0);
        var dlng = this.transformlng(lng - 105.0, lat - 35.0);
        var radlat = lat / 180.0 * Math.PI;
        var magic = Math.sin(radlat);
        magic = 1 - ee * magic * magic;
        var sqrtmagic = Math.sqrt(magic);
        dlat = (dlat * 180.0) / ((a * (1 - ee)) / (magic * sqrtmagic) * Math.PI);
        dlng = (dlng * 180.0) / (a / sqrtmagic * Math.cos(radlat) * Math.PI);
        var mglat = lat + dlat;
        var mglng = lng + dlng;
        return this.gcj02tobd09(mglng, mglat);
    }
  }

}
