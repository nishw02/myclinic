import { Component, OnInit, OnDestroy, NgZone } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
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
    ReactiveFormsModule,
    MatCardModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule
  ],
  selector: 'app-patient-detail',
  templateUrl: './patient-detail.html',
  styleUrl: './patient-detail.scss'
})
export class PatientDetailComponent implements OnInit {

  patient: any = null;
  patientId: number | null = null;
  medicineForm: FormGroup;
  labForm: FormGroup;
  showMedicineForm = false;
  showLabForm = false;
  medicineSuccess = false;
  labSuccess = false;
  printView = false;
  // Voice capture / doctor's notes
  recognition: any = null;
  recognizing = false;
  transcript = '';
  notesSaved = false;

  // Doctor Information
  doctorInfo = {
    name: 'Dr. Priyanka Shahi',
    qualification: 'MBBS, Ms (OBG)',
    specialization: 'Gynecology',
    clinicName: 'Sri Sai Hospital Chapra',
    clinicAddress: 'Kashi Bazar chapra, Bihar',
    phone: '+91-9430811466',
    email: 'drpriyankashahi@gmail.com'
  };

  constructor(
    private readonly route: ActivatedRoute,
    private readonly router: Router,
    private readonly patientService: PatientService,
    private readonly fb: FormBuilder,
    private readonly ngZone: NgZone
  ) {
    this.medicineForm = this.fb.group({
      name: ['', Validators.required],
      dosage: ['', Validators.required],
      duration: ['', Validators.required]
    });

    this.labForm = this.fb.group({
      name: ['', Validators.required],
      result: ['', Validators.required],
      date: ['', Validators.required]
    });
  }

  ngOnInit() {
    this.patientId = Number(this.route.snapshot.paramMap.get('id'));
    if (this.patientId) {
      this.patient = this.patientService.getPatientById(this.patientId);
      if (!this.patient) {
        this.router.navigate(['/patient-list']);
      }
      // populate transcript from existing notes
      if (this.patient && this.patient.doctorNotes) {
        this.transcript = this.patient.doctorNotes;
      }
    }
    // doctorInfo is static and not editable
    this.initRecognition();
  }

  ngOnDestroy(): void {
    if (this.recognition && this.recognition.stop) {
      try { this.recognition.stop(); } catch (e) { /* ignore */ }
    }
  }

  initRecognition() {
    const win: any = window as any;
    const SpeechRecognition = win.SpeechRecognition || win.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      this.recognition = null;
      return;
    }
    this.recognition = new SpeechRecognition();
    // keep recognition running for longer dictation
    this.recognition.continuous = true;
    this.recognition.lang = 'en-IN';
    this.recognition.interimResults = true;
    this.recognition.maxAlternatives = 1;

    this.recognition.onstart = () => {
      this.ngZone.run(() => this.recognizing = true);
    };

    this.recognition.onend = () => {
      this.ngZone.run(() => this.recognizing = false);
    };

    this.recognition.onerror = (event: any) => {
      this.ngZone.run(() => this.recognizing = false);
      console.warn('Speech recognition error', event);
    };

    this.recognition.onresult = (event: any) => {
      this.ngZone.run(() => {
        let interim = '';
        let final = this.transcript || '';
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          const res = event.results[i];
          if (res.isFinal) {
            final += (final ? ' ' : '') + res[0].transcript.trim();
          } else {
            interim += res[0].transcript;
          }
        }
        // show combined transcript (final + interim)
        this.transcript = final + (interim ? ' ' + interim : '');
      });
    };
  }

  startRecognition() {
    if (!this.recognition) return;
    try {
      this.recognition.start();
      this.notesSaved = false;
    } catch (e) {
      console.warn('recognition start failed', e);
    }
  }

  stopRecognition() {
    if (!this.recognition) return;
    try { this.recognition.stop(); } catch (e) { /* ignore */ }
  }

  toggleRecognition() {
    if (!this.recognition) return;
    if (this.recognizing) {
      this.stopRecognition();
    } else {
      this.startRecognition();
    }
  }

  saveNotes() {
    if (!this.patient) return;
    this.patient.doctorNotes = this.transcript;
    const success = this.patientService.updatePatient(this.patient);
    this.notesSaved = !!success;
    // refresh local copy
    if (success) this.patient = this.patientService.getPatientById(this.patientId as number);
    setTimeout(() => this.notesSaved = false, 3000);
  }

  /**
   * Append the current transcript as a new dated note instead of replacing.
   * Useful when speech recognition isn't available and the doctor types notes.
   */
  appendNote() {
    if (!this.patient) return;
    const text = (this.transcript || '').trim();
    if (!text) return;
    const timestamp = new Date().toLocaleString('en-IN');
    const author = this.doctorInfo?.name || 'Doctor';
    const noteBlock = `${timestamp} — ${author}: ${text}`;

    const existing = this.patient.doctorNotes && this.patient.doctorNotes.trim().length > 0
      ? this.patient.doctorNotes + '\n\n' + noteBlock
      : noteBlock;

    this.patient.doctorNotes = existing;
    const success = this.patientService.updatePatient(this.patient);
    this.notesSaved = !!success;
    if (success) this.patient = this.patientService.getPatientById(this.patientId as number);
    // clear transcript after appending to indicate success
    this.transcript = '';
    setTimeout(() => this.notesSaved = false, 3000);
  }

  addMedicine() {
    if (this.medicineForm.valid && this.patientId) {
      const success = this.patientService.addMedicine(this.patientId, this.medicineForm.value);
      if (success) {
        this.patient = this.patientService.getPatientById(this.patientId);
        this.medicineSuccess = true;
        this.medicineForm.reset();
        this.showMedicineForm = false;
        setTimeout(() => this.medicineSuccess = false, 3000);
      }
    }
  }

  removeMedicine(medicineId: number) {
    if (this.patientId && confirm('Remove this medicine?')) {
      this.patientService.removeMedicine(this.patientId, medicineId);
      this.patient = this.patientService.getPatientById(this.patientId);
    }
  }

  addLabTest() {
    if (this.labForm.valid && this.patientId) {
      const success = this.patientService.addLabTest(this.patientId, this.labForm.value);
      if (success) {
        this.patient = this.patientService.getPatientById(this.patientId);
        this.labSuccess = true;
        this.labForm.reset();
        this.showLabForm = false;
        setTimeout(() => this.labSuccess = false, 3000);
      }
    }
  }

  removeLabTest(labId: number) {
    if (this.patientId && confirm('Remove this lab test?')) {
      this.patientService.removeLabTest(this.patientId, labId);
      this.patient = this.patientService.getPatientById(this.patientId);
    }
  }

  goBack() {
    this.router.navigate(['/patient-list']);
  }

  printPrescription() {
    this.printView = true;
    // Wait for DOM to update before printing
    setTimeout(() => {
      globalThis.print();
      // Reset after print dialog closes
      setTimeout(() => {
        this.printView = false;
      }, 500);
    }, 100);
  }

  getCurrentDate(): string {
    const today = new Date();
    const options: Intl.DateTimeFormatOptions = { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    };
    return today.toLocaleDateString('en-IN', options);
  }

  // doctorInfo is intentionally read-only; no save method
}
