import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DashboardComponent } from './dashboard/dashboard.component';
const appRoutes: Routes = [
  {
    path: 'dashboard',
    component: DashboardComponent
  },

  {
    path: '',
    redirectTo: 'dashboard',
    pathMatch: 'full'
  }];
@NgModule({
  imports: [
    RouterModule.forRoot(appRoutes)
  ],
  exports: [
    RouterModule
  ],
  declarations: []
})
export class AppRoutingModule { }
