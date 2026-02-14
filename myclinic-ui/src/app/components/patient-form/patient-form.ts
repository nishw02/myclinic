import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { PatientService } from '../../service/patient-service';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';

@Component({
  standalone: true,
  imports: [
    CommonModule, 
    FormsModule, 
    RouterLink, 
    MatCardModule, 
    MatButtonModule, 
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule
  ],
  selector: 'app-patient-form',
  templateUrl: './patient-form.html',
  styleUrl: './patient-form.scss'
})
export class PatientFormComponent implements OnInit {

  name = '';
  age: any = '';
  gender = 'Male';
  phone = '';
  successMessage = '';
  errorMessage = '';

  constructor(private readonly patientService: PatientService) { }

  ngOnInit() {
    this.resetForm();
  }

  submit() {
    this.errorMessage = '';
    this.successMessage = '';

    if (!this.name || !this.age) {
      this.errorMessage = 'Please fill all fields';
      return;
    }

    const patient = {
      name: this.name,
      age: this.age,
      gender: this.gender
      , phone: this.phone
    };

    const created = this.patientService.addPatient(patient);
    this.successMessage = `Patient registered successfully! PHID: ${created.phid}`;
    this.resetForm();

    setTimeout(() => {
      this.successMessage = '';
    }, 3000);
  }

  resetForm() {
    this.name = '';
    this.age = '';
    this.gender = 'Male';
    this.phone = '';
  }
}
