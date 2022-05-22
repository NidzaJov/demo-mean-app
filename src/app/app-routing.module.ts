import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router"
import { PostCreateComponent } from "./posts/post-create/post-create.component";
import { PostListComponent } from "./posts/post-list/post-list.component";
import { AuthGuard } from "./auth/auth.guard";
import { LoginComponent } from "./auth/login/login.component";

const routes: Routes = [
  /*
  { path: '', component: PostListComponent },
  { path: 'create', component: PostCreateComponent, canActivate: [AuthGuard] },
  { path: 'edit/:postId', component: PostCreateComponent, canActivate: [AuthGuard] },
  */
  { path: '', component: PostListComponent },
  { path: 'auth', loadChildren: () => import("./auth/auth-routing.module").then(x => x.AuthRoutingModule)},
  { path: 'users', loadChildren: () => import("./users/users-routing.module").then(x => x.UsersRoutingModule)},
  { path: 'posts', loadChildren: () => import("./posts/posts-routing.module").then(x => x.PostsRoutingModule)}
]

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
  providers: [AuthGuard]
})
export class AppRoutingModule {}
