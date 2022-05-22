import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Router } from "@angular/router";
import { BehaviorSubject, Observable, Subject } from "rxjs";

import { AuthData } from "./auth-data.model";
import { environment } from "../../environments/environment";


const BACKEND_URL = environment.apiUrl + '/user/';

@Injectable({ providedIn: "root"})
export class AuthService {
  private isAuthenticated = false;
  private token: string;
  private tokenTimer: any;
  private userId: string;
  private authStatusListener = new Subject<boolean>();
  private roleSubject: BehaviorSubject<string>;
  public role: Observable<string>;
  private userIdSubject: BehaviorSubject<string>;
  public userIdObs: Observable<string>;


  constructor(private http: HttpClient, private router: Router) {
    this.roleSubject = new BehaviorSubject<string>(localStorage.getItem('role'));
    this.role = this.roleSubject.asObservable();
    this.userIdSubject = new BehaviorSubject<string>(localStorage.getItem('userId'));
    this.userIdObs = this.userIdSubject.asObservable();
  }

  get userIdValue(): string {
    return this.userIdSubject.value;
  }

  get roleValue(): string {
    return this.roleSubject.value;
  }

  getToken() {
    return this.token;
  }

  getIsAuth() {
    return this.isAuthenticated
  }

  getUserId() {
    return this.userId;
  }

  getAuthStatusListener() {
    return this.authStatusListener.asObservable();
  }

  createUser(email: string, password: string) {
    const authData: AuthData = { email: email, password: password }
    this.http.post(BACKEND_URL + "signup", authData)
      .subscribe(
        () => {
        this.router.navigate(['/']);
        },
        error => {
          this.authStatusListener.next(false);
        })
  }

  login(email: string, password: string) {
    const authData : AuthData = { email: email, password: password }
    this.http.post<{ token: string, expiresIn: number, userId: string, role: string }>(BACKEND_URL + "/login", authData)
      .subscribe(response => {
        const token = response.token;
        this.token = token;
        if (token) {
          const expiresInDuration = response.expiresIn;
          this.setAuthTimer(expiresInDuration);
          this.isAuthenticated = true;
          this.userId = response.userId;
          this.authStatusListener.next(true);
          this.roleSubject.next(response.role);
          this.userIdSubject.next(response.userId);
          const now = new Date();
          const expirationDate = new Date(
            now.getTime() + expiresInDuration * 1000
            );
          this.saveAuthData(token, expirationDate, this.userId, response.role);
          this.router.navigate(['/']);
        }
      }, error => {
        this.authStatusListener.next(false);
      })
  }

  autoAuthUser() {
    const authInformation = this.getAuthData();
    if (!authInformation) {
      return;
    }
    const now = new Date();
    const expiresIn  = authInformation.expirationDate.getTime() - now.getTime();
    if (expiresIn > 0) {
      this.token = authInformation.token;
      this.isAuthenticated = true;
      this.userId = authInformation.userId;
      this.setAuthTimer(expiresIn / 1000);
      this.authStatusListener.next(true);
    }
  }

  logout() {
    this.token = null;
    this.isAuthenticated = false;
    this.authStatusListener.next(false);
    this.userId = null;
    clearTimeout(this.tokenTimer);
    this.clearAuthData();
    this.roleSubject.next(null);
    this.userIdSubject.next(null);
    this.router.navigate(['/']);
  }

  private setAuthTimer(duration: number) {
    this.tokenTimer = setTimeout(() => {
      this.logout();
    }, duration * 1000)
  }

  private saveAuthData(token: string, expirationDate: Date, userId: string, role: string) {
    localStorage.setItem('token', token);
    localStorage.setItem("expiration", expirationDate.toISOString());
    localStorage.setItem("userId", userId);
    localStorage.setItem('role', role);
  }

  private clearAuthData() {
    localStorage.removeItem("token");
    localStorage.removeItem('expiration');
    localStorage.removeItem("userId");
    localStorage.removeItem('role');
  }

  private getAuthData() {
    const token = localStorage.getItem("token");
    const expirationDate = localStorage.getItem("expiration");
    const userId = localStorage.getItem("userId");
    if (!token || !expirationDate) {
      return;
    }
    return {
      token: token,
      expirationDate: new Date(expirationDate),
      userId: userId,
    }
  }
}
