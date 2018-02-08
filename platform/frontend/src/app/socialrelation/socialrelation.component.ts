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
  private ssids = {};
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
      this.getMacs(0, 0);
      this.getMacs(1, 0);
    },
    (err) => {
      alert('err');
    });
  }

  getMacs(side, offset) {
    this.showLoading = true;
    this.httpService.get(`http://localhost:8983/solr/italy_data_test/select?facet.field=src_mac&facet=on&q=*:*&rows=0&facet.limit=1000&facet.offset=${offset}`,
    (data) => {
      this.showLoading = false;
      let arr = data.facet_counts.facet_fields.src_mac,
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
    this.httpService.get(`http://localhost:8983/solr/italy_data_test/select?facet.pivot={!stats=piv}ssid&facet=on&facet.limit=-1&rows=0&q=src_mac:%22${mac1}%22%20OR%20src_mac:%22${mac2}%22&stats.field={!tag=piv%20countDistinct=true}src_mac&stats=true`,
    (data) => {
      this.showLoading = false;
      let arr = data.facet_counts.facet_pivot.ssid,
        score = 0,
        text = '';
      for (let i = 0, len = arr.length; i < len; i += 1) {
        if (arr[i].stats.stats_fields.src_mac.countDistinct === 2) {
          let ssidCount = this.ssids[arr[i].value];
          text += `${arr[i].value}: shared by ${ssidCount} users\n`;
          score += 1 / Math.log2(ssidCount);
        }
      }
      this.relationTxt = text;
      this.relationScore = score.toFixed(8);
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
