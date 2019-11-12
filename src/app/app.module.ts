import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { AppComponent } from './app.component';
import { TopnavigationComponent } from './topnavigation/topnavigation.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { FooterComponent } from './footer/footer.component';
import { SonardetailsComponent } from './sonardetails/sonardetails.component';
import { HttpClientModule } from '@angular/common/http';
import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { AuthenticationHeaders } from './http.interceptor';
import { CommonModule } from '@angular/common';
import { SafeHtmlPipe } from './pipes/safe-html-pipe';
import { StorageServiceModule } from 'angular-webstorage-service';
import { AngularFontAwesomeModule } from 'angular-font-awesome';
import { ModalpopupComponent } from './modalpopup/modalpopup.component';
import { JirachartComponent } from './jirachart/jirachart.component';
/* import { AdminComponent } from './admin/admin.component';
 import { AppRoutingModule } from './app-routing.module';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material'; */
@NgModule({
  declarations: [
    AppComponent,
    TopnavigationComponent,
    DashboardComponent,
    FooterComponent,
    SonardetailsComponent,
    SafeHtmlPipe,
    ModalpopupComponent,
    JirachartComponent,
    // AdminComponent,
  ],
  imports: [
    BrowserModule,
    HttpClientModule,
    CommonModule,
    AngularFontAwesomeModule,
    StorageServiceModule,
    /*  AppRoutingModule,
      MatTableModule,
      MatButtonModule */
  ],
  providers: [{
    provide: HTTP_INTERCEPTORS,
    useClass: AuthenticationHeaders,
    multi: true
  }],
  bootstrap: [AppComponent]
})
export class AppModule { }
