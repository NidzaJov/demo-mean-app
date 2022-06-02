# Demo MEAN app

This is a MEAN stack app (node-backend api  with MongoDB Atlas as database service and angular-frontend). Node backend is implemented using Mongoose and Express Router
App has authentication security feature (consists of login and signup components and auth-service) based on JWT authentication token saved in Local Storage with email-verification included. Unfulfilled requirement is to forget password utility.
App has authorization feature implemented through user Roles (Regular/Admin) and some routes are guarded with AuthGuard from unauthorized approaches. On backend, authorization is implemented through auth-middleware which verifies user’s role from JWT token signature.
App has posts feature with CRUD operations for Post entity which is available for both roles. This feature was not required by Milos but when I have followed the Udemy MEAN course in the first week of internship I have made that feature and used it as a basic blueprint for other features and decided to leave it in the project as a sort of a testing ground.
App has users feature with CRUD operations for User entity. Admin role has authorization to use all operations, and regular user can use only editing his own profile.
Current task is that the app needs to be covered with unit tests (80% coverage in Jasmine and Karma). 

This project was generated with [Angular CLI](https://github.com/angular/angular-cli) version 13.3.5.

## Development server

Run `start:server` for running backend with nodemon.
Run `ng serve` for running frontend on a dev server. Navigate to `http://localhost:4200/`. The application will automatically reload if you change any of the source files.


## Build

Run `ng build` to build the Angular frontend of project. The build artifacts will be stored in the `backend/angular` directory.

## Running unit tests

Run `ng test` to execute the unit tests via [Karma](https://karma-runner.github.io).
