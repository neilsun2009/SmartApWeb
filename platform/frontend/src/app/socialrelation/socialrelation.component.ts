import { Component, OnInit } from '@angular/core';
import { HttpService } from '../services/http.service';

@Component({
  selector: 'app-socialrelation',
  templateUrl: './socialrelation.component.html',
  styleUrls: ['./socialrelation.component.less']
})
export class SocialrelationComponent implements OnInit {

  showLoading: boolean;
  macs: string[][];
  macOffset = [0, 0];
  // private ssids = {};
  macSelected = ['', ''];
  relationScore: number|string = '?';
  relationTxt = 'Please select MAC addresses';

  constructor(
    private httpService: HttpService
  ) {
    this.showLoading = false;
    this.macs = [[],[]];
  }

  ngOnInit() {
    // this.getSSIDs();
    // this.showLoading = true;
    this.getMacs(0, 0);
    this.getMacs(1, 0);
  }

  // getSSIDs() {
  //   this.showLoading = true;
  //   this.httpService.get(`http://localhost:8983/solr/terminal_feature_db/select?facet.pivot={!stats=piv}terminal_ssid_list&facet=on&facet.limit=500&facet.offset=0&rows=0&q=*:*&stats.field={!tag=piv%20countDistinct=true}src_mac&stats=true`,
  //   (data) => {
  //     this.showLoading = false;
  //     let arr = data.facet_counts.facet_pivot.ssid,
  //       ssids = [];
  //     for (let i = 0, len = arr.length; i < len; i += 1) {
  //       ssids[arr[i].value] = arr[i].stats.stats_fields.src_mac.countDistinct;
  //     }
  //     this.ssids = ssids;
  //     // console.log(this.ssids['ssid_134927']);
  //     this.getMacs(0, 0);
  //     this.getMacs(1, 0);
  //   },
  //   (err) => {
  //     alert('err');
  //   });
  // }

  getMacs(side, offset) {
    this.showLoading = true;
    this.httpService.get(`http://localhost:8983/solr/terminal_feature_db/select?facet.field=mac&facet=on&q=terminal_ssid_list:*&rows=0&facet.limit=500&facet.offset=${offset}`,
    (data) => {
      this.showLoading = false;
      let arr = data.facet_counts.facet_fields.mac,
        macs = [];
      for (let i = 0, len = arr.length; i < len; i += 2) {
        macs.push(arr[i]);
      }
      this.macs[side] = macs;
    },
    (err) => {
      alert('err');
    });
  }

  getSSIDData(ssid) {
    this.showLoading = true;
    this.httpService.get(`http://localhost:8983/solr/terminal_feature_db/select?facet.pivot={!stats=piv}terminal_ssid_list&facet=on&facet.limit=-1&rows=0&q=terminal_ssid_list:%22${ssid}%22&stats.field={!tag=piv%20countDistinct=true}mac&stats=true`,
    (data) => {
      this.showLoading = false;      
      let arr = data.facet_counts.facet_pivot.terminal_ssid_list;
      for (let i = 0, len = arr.length; i < len; ++i) {
        if (arr[i].value === ssid) {
          let count = arr[i].stats.stats_fields.mac.countDistinct;
          this.relationTxt += `${ssid}: shared by ${count} users\n`;
          this.relationScore = +this.relationScore + 1 / Math.log2(count);
          break;
        }
      }
    },
    (err) => {
      alert('err');
    });
    
  }

  getRelation(mac1, mac2) {
    if (!mac1.length || !mac2.length) {
      return;
    }
    if (mac1 === mac2) {
      // alert('Do not choose two identical MACs.');
      this.relationScore = 'NaN'; 
      this.relationTxt = 'Do not choose two identical MACs';
      return;
    }
    this.showLoading = true;
    this.relationScore = 0;
    this.relationTxt = '';
    this.httpService.get(`http://localhost:8983/solr/terminal_feature_db/select?facet.pivot={!stats=piv}terminal_ssid_list&facet=on&facet.limit=-1&rows=0&q=mac:%22${mac1}%22%20OR%20mac:%22${mac2}%22&stats.field={!tag=piv%20countDistinct=true}mac&stats=true`,
    (data) => {
      this.showLoading = false;
      let arr = data.facet_counts.facet_pivot.terminal_ssid_list,
        score = 0,
        text = '';
      for (let i = 0, len = arr.length; i < len; i += 1) {
        if (arr[i].stats.stats_fields.mac.countDistinct === 2) {
          // let ssidCount = this.ssids[arr[i].value];
          this.getSSIDData(arr[i].value);
          // text += `${arr[i].value}: shared by ${ssidCount} users\n`;
          // score += 1 / Math.log2(ssidCount);
        }
      }
      // this.relationTxt = text;
      // this.relationScore = score.toFixed(8);
    },
    (err) => {
      alert('err');
    });
  }

  last500Mac(side) {
    if (this.macOffset[side] < 500) {
      alert('已到最早500条');
      return;
    }
    this.macOffset[side] -= 500;
    this.getMacs(side, this.macOffset[side]);
  }

  next500Mac(side) {
    this.macOffset[side] += 500;
    this.getMacs(side, this.macOffset[side]);
    
  }

  changeMac(side, mac) {
    this.macSelected[side] = mac;
    this.getRelation(this.macSelected[0], this.macSelected[1]);
  }

}
