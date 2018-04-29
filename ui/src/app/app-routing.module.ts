import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { SwarmIndexComponent } from './swarm/swarm-index/swarm-index.component';
import { SwarmConfigComponent } from './swarm/swarm-config/swarm-config.component';

const routes: Routes = [
  {
    path: '',
    component: SwarmIndexComponent
  },
  {
    path: 'config',
    component: SwarmConfigComponent
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
