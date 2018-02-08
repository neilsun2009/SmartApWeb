import { Component, OnInit } from '@angular/core';
import { HttpService } from '../services/http.service';

@Component({
  selector: 'app-relatedusers',
  templateUrl: './relatedusers.component.html',
  styleUrls: ['./relatedusers.component.less']
})
export class RelatedusersComponent implements OnInit {

  showLoading: boolean;
  macs = [];
  macOffset = 0;
  private ssids = {};
  macSelected = '';
  relationTxt = 'Please select a MAC address';
  macRelList = [];

  constructor(
    private httpService: HttpService
  ) { }

  ngOnInit() {
    this.getSSIDs();
  }

  getSSIDs() {
    this.showLoading = true;
    this.httpService.get(`http://localhost:8983/solr/italy_data_test/select?facet.pivot={!stats=piv}ssid&facet=on&facet.limit=-1&rows=0&q=*:*&stats.field={!tag=piv%20countDistinct=true}src_mac&stats=true`,
    (data) => {
      this.showLoading = false;
      let arr = data.facet_counts.facet_pivot.ssid,
        ssids = [];
      for (let i = 0, len = arr.length; i < len; i += 1) {
        ssids[arr[i].value] = arr[i].stats.stats_fields.src_mac.countDistinct;
      }
      this.ssids = ssids;
      // console.log(this.ssids['ssid_134927']);
      this.getMacs(0);
    },
    (err) => {
      alert('err');
    });
  }

  getMacs(offset) {
    this.showLoading = true;
    this.httpService.get(`http://localhost:8983/solr/italy_data_test/select?facet.field=src_mac&facet=on&q=*:*&rows=0&facet.limit=1000&facet.offset=${offset}`,
    (data) => {
      this.showLoading = false;
      let arr = data.facet_counts.facet_fields.src_mac,
        macs = [];
      for (let i = 0, len = arr.length; i < len; i += 2) {
        macs.push(arr[i]);
      }
      this.macs = macs;
    },
    (err) => {
      alert('err');
    });
  }

  getSSIDList(mac) {
    if (!mac.length) {
      return;
    }
    this.showLoading = true;
    this.httpService.get(`http://localhost:8983/solr/italy_data_test/select?facet.pivot=ssid&facet.limit=-1&facet=on&rows=0&q=src_mac:%22${mac}%22`,
    (data) => {
      // this.showLoading = false;
      let arr = data.facet_counts.facet_pivot.ssid,
        query = '';
      for (let i = 0, len = arr.length; i < len; i += 1) {
        query += (i === 0 ? '' : '%20OR%20') + arr[i].value;
      }
      // console.log(query);
      this.getRelations(query, mac);
    },
    (err) => {
      alert('err');
    });
  }

  getRelations(query, mac) {
    if (!query.length) {
      return;
    }
    this.httpService.get(`http://localhost:8983/solr/italy_data_test/select?facet.pivot={!stats=piv}ssid&facet=on&rows=0&q=ssid:${query}&stats.field={!tag=piv%20distinctValues=true}src_mac&stats=true`,
    (data) => {
      // this.showLoading = false;
      let arr = data.facet_counts.facet_pivot.ssid,
        query = '',
        macRels = {}; 
      for (let i = 0, len = arr.length; i < len; i += 1) {
        let ssidCount = this.ssids[arr[i].value],
          score = 1 / Math.log2(ssidCount),
          macsArr = arr[i].stats.stats_fields.src_mac.distinctValues;    
        // console.log(ssidCount, arr[i].value);
        if (macsArr.length > 1) {
          for (let j = 0, len2 = macsArr.length; j < len2; ++j) {
            if (macsArr[j] !== mac) {
              if (macRels[macsArr[j]]) {
                macRels[macsArr[j]] += score;
              } else {
                macRels[macsArr[j]] = score;
              }
            }
          }
        }
      }
      this.macRelList = [];
      for (let i in macRels) {
        this.macRelList.push({mac: i, score: macRels[i]});
      }
      this.macRelList.sort((a, b) => {
        return b.score - a.score;
      })
      this.showLoading = false;
    },
    (err) => {
      alert('err');
    });
  }

  last500Mac() {
    if (this.macOffset < 500) {
      alert('已到最早500条');
      return;
    }
    this.macOffset -= 500;
    this.getMacs(this.macOffset);
  }

  next500Mac() {
    this.macOffset += 500;
    this.getMacs(this.macOffset);
  }

  changeMac(mac) {
    this.macSelected = mac;
    this.getSSIDList(this.macSelected);
  }

}
