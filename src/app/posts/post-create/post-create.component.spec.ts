import { TestBed, ComponentFixture, waitForAsync, tick } from '@angular/core/testing';
import { PostCreateComponent } from './post-create.component';
import { of, Subject } from 'rxjs';
import { PostsService } from '../posts.service';
import { AuthService } from 'src/app/auth/auth.service';
import { ActivatedRouteStub } from '../../../testing/activated-route-stub'
import { ActivatedRoute } from '@angular/router';
import { By } from '@angular/platform-browser';
import { Post } from '../post.model';
import { toBase64String } from '@angular/compiler/src/output/source_map';



describe("PostCreateComponent", () => {
let component: PostCreateComponent;
let fixture : ComponentFixture<PostCreateComponent>
let getPostSpy: jasmine.Spy;
let updatePostSpy: jasmine.Spy;
let inputPostTitleElement: HTMLInputElement;
let inputPostContentElement: HTMLInputElement;
let btnPickImageElement: HTMLElement;
let testPostTitlePlaceholderText: string;
let testPostContentPlaceholderText: string;
let authStatusSpy: jasmine.Spy;
let activatedRoute: ActivatedRouteStub;
let testPost: Post

const dummyPostData = {
  title: 'test title',
  content: 'test content',
  image: 'http://localhost:3000/images/mics-post-1653597460520.jpg'
}

  beforeEach(() => {
    testPostTitlePlaceholderText = 'Post Title';
    testPostContentPlaceholderText = 'Post Content';
    testPost = {
      id:"628fe514dc41400253544b2f", title:"Mics post",content:"content",imagePath:"http://localhost:3000/images/mics-post-1653597460520.jpg",creator:"628cf01e953210a74d39af17"
    }



    const postsService = jasmine.createSpyObj('PostsService', ['getPost', 'updatePost']);
    getPostSpy = postsService.getPost.and.returnValue(of(testPost));

    updatePostSpy = postsService.updatePost.and.callFake(() => {
      testPost.title = dummyPostData.title;
      testPost.content = dummyPostData.content;
      testPost.imagePath = dummyPostData.image;
    })

    const authService = jasmine.createSpyObj('AuthService', ['getAuthStatusListener']);
    authStatusSpy = authService.getAuthStatusListener.and.returnValue(of(true))

    activatedRoute = new ActivatedRouteStub();
    activatedRoute.setParamMap( {postId: "628fe514dc41400253544b2f"} );

    TestBed.configureTestingModule({
      declarations: [PostCreateComponent],
      providers: [
        { provide: PostsService, useValue: postsService },
        { provide: AuthService, useValue: authService},
        { provide: ActivatedRoute, useValue: activatedRoute}
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(PostCreateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    inputPostTitleElement = fixture.debugElement.nativeElement.querySelector('#post-title-input');
    inputPostContentElement = fixture.debugElement.nativeElement.querySelector('#post-content-input');
    btnPickImageElement = fixture.debugElement.nativeElement.querySelector('#filePicker');

  });

  it('should be created', () => {
    expect(component).toBeDefined();
  });


  it('should have placeholder text "Post Title"', () => {
    expect(inputPostTitleElement.getAttribute('placeholder')).toBe(testPostTitlePlaceholderText);
  })

  it('should have placeholder text "Post Content"', () => {
    expect(inputPostContentElement.getAttribute('placeholder')).toBe(testPostContentPlaceholderText);
  })


  it('should detect file input change and set imagePreview string', () => {
    const inputDebugEl = fixture.debugElement.query(By.css('input[type=file]'));

    const dataTransfer = new DataTransfer();
    dataTransfer.items.add(new File([''], 'test-file.png'));
    inputDebugEl.nativeElement.files = dataTransfer.files;
    inputDebugEl.nativeElement.dispatchEvent(new InputEvent('change'));
    fixture.detectChanges();

    expect(component.form.get('image')).toBeTruthy();
    expect(component.form.get('image').value.name).toContain("test-file.png");
  })

  it('file change event shoud arrive in handler', () => {
    const element = fixture.nativeElement;
    const input = element.querySelector("input[type=file]");
    spyOn(component, 'onImagePicked');

    input.dispatchEvent(new Event('change'));
    fixture.detectChanges();

    expect(component.onImagePicked).toHaveBeenCalled();
  })


  it('should display post title, content and picture if route has postId', () => {
    expect(component.mode).toBe('edit');
    expect(getPostSpy).toHaveBeenCalled();
    expect(component.form.get('title').value).toBe('Mics post');
    expect(component.form.get('content').value).toBe('content');
    expect(component.form.get('image').value).toBe("http://localhost:3000/images/mics-post-1653597460520.jpg");
  })

  it('should mark title and content controls as invalid when it has no value', () => {
    const titleCtrl = component.form.get('title');
    const contentCtrl = component.form.get('content');

    titleCtrl.setValue(null);
    contentCtrl.setValue(null);
    fixture.detectChanges();

    expect(titleCtrl.invalid).toBeTruthy();
    expect(contentCtrl.invalid).toBeTruthy();

  })

  it('should mark title and content controls as valid when they have value', () => {
    const titleCtrl = component.form.get('title');
    const contentCtrl = component.form.get('content');

    titleCtrl.setValue('test title');
    contentCtrl.setValue('test content');
    fixture.detectChanges();

    expect(titleCtrl.valid).toBeTruthy();
    expect(contentCtrl.valid).toBeTruthy();
  })

  it('should mark title control invalid if value less than 3 characters', () => {
    const titleCtrl = component.form.get('title');

    titleCtrl.setValue('ab');
    fixture.detectChanges();

    expect(titleCtrl.invalid).toBeTruthy();
  })

  it('should mark title control valid if value longer than 2 characters', () => {
    const titleCtrl = component.form.get('title');
    titleCtrl.setValue('abc');
    fixture.detectChanges();
    expect(titleCtrl.valid).toBeTruthy();
  })

  it('should call onSavePost method when form is submited', () => {
    const submitBtn = fixture.debugElement.nativeElement.querySelector('button[type="submit"]');
    const formElement = fixture.debugElement.query(By.css('form'));
    spyOn(component, 'onSavePost');

    formElement.triggerEventHandler('submit', null);

    expect(component.onSavePost).toHaveBeenCalled();
  })

  it('should call updatePost method of PostsService when callinh onSavePost method', () => {
    component.form.patchValue(dummyPostData);
    component.onSavePost();
    fixture.detectChanges();

    expect(updatePostSpy).toHaveBeenCalled();
    expect(testPost.title).toBe(dummyPostData.title);
    expect(testPost.content).toBe(dummyPostData.content);
    expect(testPost.imagePath).toBe(dummyPostData.image);
  })

})

