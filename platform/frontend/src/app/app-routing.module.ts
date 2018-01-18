import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { IndexComponent } from './index/index.component';
import { WifimapComponent } from './wifimap/wifimap.component';
import { MaclocationComponent } from './maclocation/maclocation.component';

const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    component: IndexComponent
  },
  {
    path: 'wifi_map',
    component: WifimapComponent
  },
  {
    path: 'mac_location',
    component: MaclocationComponent
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
