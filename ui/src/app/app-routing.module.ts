import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { SwarmIndexComponent } from './swarm/swarm-index/swarm-index.component';

const routes: Routes = [
  {
    path: '',
    component: SwarmIndexComponent
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
