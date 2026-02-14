import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class PatientService {

  private readonly patientsSubject = new BehaviorSubject<any[]>([
    { id: 1, name: 'Rahul Sharma', age: 30, gender: 'Male', medicines: [], labs: [] },
    { id: 2, name: 'Priya Singh', age: 25, gender: 'Female', medicines: [], labs: [] }
  ]);

  patients$ = this.patientsSubject.asObservable();

  constructor() { }

  getPatients(): any[] {
    return this.patientsSubject.value;
  }

  getPatientsObservable(): Observable<any[]> {
    return this.patients$;
  }

  addPatient(patient: any): any {
    patient.id = Date.now();
    // assign unique PHID and creation timestamp
    patient.phid = 'PH' + patient.id.toString();
    patient.createdAt = new Date().toISOString();
    const currentPatients = this.patientsSubject.value;
    this.patientsSubject.next([...currentPatients, patient]);
    return patient;
  }

  updatePatient(updated: any): boolean {
    const currentPatients = this.patientsSubject.value;
    const index = currentPatients.findIndex(p => p.id === updated.id);
    if (index !== -1) {
      const updatedPatients = [...currentPatients];
      updatedPatients[index] = updated;
      this.patientsSubject.next(updatedPatients);
      return true;
    }
    return false;
  }

  deletePatient(id: number) {
    const currentPatients = this.patientsSubject.value;
    const updatedPatients = currentPatients.filter(p => p.id !== id);
    this.patientsSubject.next(updatedPatients);
  }

  getPatientById(id: number): any {
    const patients = this.patientsSubject.value;
    return patients.find(p => p.id === id);
  }

  addMedicine(patientId: number, medicine: any): boolean {
    const currentPatients = this.patientsSubject.value;
    const patientIndex = currentPatients.findIndex(p => p.id === patientId);
    
    if (patientIndex !== -1) {
      if (!currentPatients[patientIndex].medicines) {
        currentPatients[patientIndex].medicines = [];
      }
      medicine.id = Date.now();
      currentPatients[patientIndex].medicines.push(medicine);
      this.patientsSubject.next([...currentPatients]);
      return true;
    }
    return false;
  }

  removeMedicine(patientId: number, medicineId: number): boolean {
    const currentPatients = this.patientsSubject.value;
    const patientIndex = currentPatients.findIndex(p => p.id === patientId);
    
    if (patientIndex !== -1 && currentPatients[patientIndex].medicines) {
      currentPatients[patientIndex].medicines = currentPatients[patientIndex].medicines.filter((m: any) => m.id !== medicineId);
      this.patientsSubject.next([...currentPatients]);
      return true;
    }
    return false;
  }

  addLabTest(patientId: number, lab: any): boolean {
    const currentPatients = this.patientsSubject.value;
    const patientIndex = currentPatients.findIndex(p => p.id === patientId);
    
    if (patientIndex !== -1) {
      if (!currentPatients[patientIndex].labs) {
        currentPatients[patientIndex].labs = [];
      }
      lab.id = Date.now();
      currentPatients[patientIndex].labs.push(lab);
      this.patientsSubject.next([...currentPatients]);
      return true;
    }
    return false;
  }

  removeLabTest(patientId: number, labId: number): boolean {
    const currentPatients = this.patientsSubject.value;
    const patientIndex = currentPatients.findIndex(p => p.id === patientId);
    
    if (patientIndex !== -1 && currentPatients[patientIndex].labs) {
      currentPatients[patientIndex].labs = currentPatients[patientIndex].labs.filter((l: any) => l.id !== labId);
      this.patientsSubject.next([...currentPatients]);
      return true;
    }
    return false;
  }
}
