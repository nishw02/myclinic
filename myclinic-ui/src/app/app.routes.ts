import { Routes } from '@angular/router';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { LoginComponent } from './components/login/login.component';
import { PatientFormComponent } from './components/patient-form/patient-form';
import { PatientListComponent } from './components/patient-list/patient-list';
import { PatientDetailComponent } from './components/patient-detail/patient-detail';
import { authGuard } from './service/auth.guard';

export const routes: Routes = [
  { path: '', component: LoginComponent },
  { path: 'dashboard', component: DashboardComponent, canActivate: [authGuard] },
  { path: 'registration', component: PatientFormComponent, canActivate: [authGuard] },
  { path: 'patient-list', component: PatientListComponent, canActivate: [authGuard] },
  { path: 'patient/:id', component: PatientDetailComponent, canActivate: [authGuard] }
];
