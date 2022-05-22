import { Injectable } from "@angular/core";
import { Subject } from 'rxjs'
import { HttpClient } from "@angular/common/http";
import { map } from 'rxjs/operators';
import { Router } from "@angular/router";

import { User } from "./user.model";
import { environment } from "../../environments/environment"

const BACKEND_URL = environment.apiUrl + '/user/';

@Injectable({ providedIn: 'root' })
export class UsersService {
  private users: User [] = [];
  private usersUpdated = new Subject<{users: User[], usersCount: number}>();

  constructor(private http: HttpClient, private router: Router) {}

  getUsers(usersPerPage: number, currentUser: number) {
    const queryParams = `?pageSize=${usersPerPage}&page=${currentUser}`;
    this.http
      .get<{message: string, users: any, maxUsers: number }>( BACKEND_URL + queryParams)
      .pipe(map((userData) => {
        return { users: userData.users.map(user => {
          return {
            id: user._id,
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
            password: user.password,
            role: user.role,
            imagePath: user.imagePath,
          }
        }),
        maxUsers: userData.maxUsers};
      }))
      .subscribe((transformedUsersData) => {
        this.users = transformedUsersData.users;
        this.usersUpdated.next({
          users: [...this.users],
          usersCount: transformedUsersData.maxUsers
        });
    });
  }

  getUsersUpdatedListener() {
    return this.usersUpdated.asObservable();
  }

  getUser(id: string) {
    return this.http.get<{
      _id: string,
      firstName: string;
      lastName: string;
      email: string;
      password: string;
      role: string;
      imagePath: string,
    }>(BACKEND_URL + id).pipe(map(user => {
      return {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        password: user.password,
        role: user.role,
        imagePath: user.imagePath,
      }
    }))


  }

  addUser(firstName: string, lastName: string, email: string, password: string, image: File, role: string) {
    const userData = new FormData();
    userData.append("firstName", firstName);
    userData.append("lastName", lastName);
    userData.append("password", password);
    userData.append("email", email);
    userData.append("image", image, firstName + lastName);
    userData.append("role", role)
    this.http.post<{ message: string, user: User }>(BACKEND_URL, userData)
      .subscribe((responseData) => {
        this.router.navigate(["/"]);
      })

  }

  updateUser(id: string, firstName: string, lastName: string, email: string, password: string, image: File | string, role: string) {
    let userData: User | FormData;
    if (typeof(image) === 'object') {
      userData = new FormData();
      userData.append("id", id);
      userData.append("firstName", firstName);
      userData.append("lastName", lastName);
      userData.append("email", email),
      userData.append("password", password)
      userData.append("image", image, firstName);
      userData.append("role", role)
    } else {
      userData = {
        id: id,
        firstName: firstName,
        lastName: lastName,
        email: email,
        password: password,
        imagePath: image,
        role: role
      }
    }
    this.http.put(BACKEND_URL + id, userData)
      .subscribe(response => {
        this.router.navigate(["/"]);
      })
  }

  deleteUser(userId: string) {
    return this.http.delete(`${BACKEND_URL}${userId}`);
  }
}
