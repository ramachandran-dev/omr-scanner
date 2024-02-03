// app-routing.module.ts
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { TeacherInterfaceComponent } from './components/teacher-interface/teacher-interface.component';
import { ResultsDisplayComponent } from './components/results-display/results-display.component';
import { HomeComponent } from './components/home/home.component';
import { CameraCaptureComponent } from './components/camera-capture/camera-capture.component';

// app-routing.module.ts
const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'teacher', component: TeacherInterfaceComponent },
  { path: 'results', component: ResultsDisplayComponent },
     { path: 'camera', component:  CameraCaptureComponent},


];


@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
