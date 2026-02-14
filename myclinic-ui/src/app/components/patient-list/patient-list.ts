import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { PatientService } from '../../service/patient-service';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';

@Component({
  standalone: true,
  imports: [
    CommonModule, 
    FormsModule, 
    RouterLink,
    MatCardModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule
  ],
  selector: 'app-patient-list',
  templateUrl: './patient-list.html',
  styleUrl: './patient-list.scss'
})
export class PatientListComponent implements OnInit {

  patients: any[] = [];
  filteredPatients: any[] = [];
  searchText = '';
  selectedDate: string = '';

  constructor(private readonly patientService: PatientService) { }

  ngOnInit() {
    // default selected date to today
    const today = new Date();
    this.selectedDate = today.toISOString().slice(0,10);

    this.patientService.getPatientsObservable().subscribe(data => {
      this.patients = data;
      this.filterPatients();
    });
  }

  filterPatients() {
    const dateFilter = (p: any) => {
      if (!this.selectedDate) return true;
      const created = p.createdAt ? p.createdAt.slice(0,10) : '';
      return created === this.selectedDate;
    };

    const text = this.searchText.trim().toLowerCase();

    this.filteredPatients = this.patients.filter(p => {
      if (!dateFilter(p)) return false;
      if (!text) return true;
      return (
        p.name?.toLowerCase().includes(text) ||
        p.phone?.toLowerCase().includes(text) ||
        p.phid?.toLowerCase().includes(text)
      );
    });
  }

  deletePatient(id: number) {
    if (confirm('Are you sure you want to delete this patient?')) {
      this.patientService.deletePatient(id);
    }
  }

  trackByPatientId(index: number, patient: any): number {
    return patient.id;
  }
}
