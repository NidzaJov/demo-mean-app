import { NgModule } from "@angular/core";
import { Routes, RouterModule } from "@angular/router";
import { PostCreateComponent } from "./post-create/post-create.component";
import { PostListComponent } from "./post-list/post-list.component"
import { AuthGuard } from "../auth/auth.guard";

const routes: Routes = [
  { path: 'edit/:postId', component: PostCreateComponent, canActivate: [AuthGuard], data: { roles: ["Admin", "Regular"]} },
  { path: 'create', component: PostCreateComponent, canActivate: [AuthGuard], data: { roles: ["Admin", "Regular"]} }
]

@NgModule({
  imports: [
    RouterModule.forChild(routes)
  ],
  exports: [
    RouterModule
  ]
})
export class PostsRoutingModule {

}
