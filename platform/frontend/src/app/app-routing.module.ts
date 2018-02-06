import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { IndexComponent } from './index/index.component';
import { WifimapComponent } from './wifimap/wifimap.component';
import { MaclocationComponent } from './maclocation/maclocation.component';
import { SocialrelationComponent } from './socialrelation/socialrelation.component';

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
  },
  {
    path: 'social_relation',
    component: SocialrelationComponent
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
