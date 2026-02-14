import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private isLoggedInSubject = new BehaviorSubject<boolean>(this.checkLoggedIn());
  public isLoggedIn$ = this.isLoggedInSubject.asObservable();

  private currentUserSubject = new BehaviorSubject<string | null>(this.getStoredUser());
  public currentUser$ = this.currentUserSubject.asObservable();

  constructor() { }

  private checkLoggedIn(): boolean {
    return !!localStorage.getItem('currentUser');
  }

  private getStoredUser(): string | null {
    return localStorage.getItem('currentUser');
  }

  login(username: string, password: string): boolean {
    // Simple authentication (in real app, call backend API)
    if (username === 'admin' && password === 'admin123') {
      localStorage.setItem('currentUser', username);
      this.isLoggedInSubject.next(true);
      this.currentUserSubject.next(username);
      return true;
    }
    return false;
  }

  logout(): void {
    localStorage.removeItem('currentUser');
    this.isLoggedInSubject.next(false);
    this.currentUserSubject.next(null);
  }

  isLoggedIn(): boolean {
    return this.isLoggedInSubject.value;
  }

  getCurrentUser(): string | null {
    return this.currentUserSubject.value;
  }
}
