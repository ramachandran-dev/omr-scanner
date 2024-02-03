// app.module.ts

import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouterModule, Routes } from '@angular/router';
import { AppComponent } from './app.component';
import { TeacherInterfaceComponent } from './components/teacher-interface/teacher-interface.component';
import { ResultsDisplayComponent } from './components/results-display/results-display.component';
import { MatCardModule } from '@angular/material/card';
import { MatToolbarModule } from '@angular/material/toolbar';
import { AppRoutingModule } from './app-routing.module';
import { WebcamModule } from 'ngx-webcam';
import { Component, NgZone } from '@angular/core';
import { CameraCaptureComponent } from './components/camera-capture/camera-capture.component';
import { HomeComponent } from './components/home/home.component';
import { HttpClientModule } from '@angular/common/http';


declare const cv: any;
// Define routes
const routes: Routes = [
  { path: '', redirectTo: '/home', pathMatch: 'full' },
  { path: 'teacher', component: TeacherInterfaceComponent },
  { path: 'results', component: ResultsDisplayComponent },

  // Add more routes as needed
];

@NgModule({
  declarations: [
    AppComponent,
    TeacherInterfaceComponent,
    ResultsDisplayComponent,
    CameraCaptureComponent,
    HomeComponent,
    
   
    
    // Add other components here
  ],
  imports: [
    BrowserModule,
    MatCardModule,
    MatToolbarModule,
    WebcamModule,
    AppRoutingModule,
    HttpClientModule,
    RouterModule.forRoot(routes),
    
  ], providers: [],
  bootstrap: [AppComponent]
})
export class AppModule {
  constructor(private zone: NgZone) {}
 }
