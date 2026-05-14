import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  IonHeader, IonToolbar, IonTitle, IonContent,
  IonList, IonItem, IonLabel, IonButton, IonButtons,
  IonInput, IonIcon, IonRefresher, IonRefresherContent, IonSpinner,
  IonInfiniteScroll, IonInfiniteScrollContent
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { cameraOutline, exitOutline, personAdd, heartOutline, heart, chatbubbleOutline, peopleOutline, bookOutline, personCircleOutline } from 'ionicons/icons';
import { Router } from '@angular/router';
import { Api } from '../../services/api';
import { Auth } from '../../services/auth';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-feed',
  templateUrl: './feed.page.html',
  styleUrls: ['./feed.page.scss'],
  standalone: true,
  imports: [
    IonInput, IonHeader, IonToolbar, IonTitle, IonContent,
    IonList, IonItem, IonLabel, IonButton, IonButtons,
    IonRefresher, IonRefresherContent, IonSpinner,
    IonInfiniteScroll, IonInfiniteScrollContent,
    FormsModule, CommonModule, IonIcon
  ]
})
export class FeedPage implements OnInit {

  posts: any[] = [];
  stories: any[] = [];
  storageBase = environment.storageUrl;
  myUsername  = '';

  selectedPost: any = null;
  newComment = '';
  comments: any[] = [];
  showComments = false;
  loading = false;
  currentUserId: number | null = null;

  currentPage = 1;
  allLoaded   = false;

  constructor(
    private api: Api,
    private router: Router,
    private auth: Auth,
  ) {
    addIcons({ cameraOutline, personAdd, peopleOutline, bookOutline, personCircleOutline, exitOutline, heartOutline, heart, chatbubbleOutline });
  }

  ngOnInit() {
    const user = this.auth.getUser();
    this.currentUserId = user?.id ?? null;
    this.myUsername = user?.profile?.username ?? user?.username ?? '';
    this.api.getMe().subscribe({
      next: me => {
        this.myUsername = me?.profile?.username ?? '';
        this.auth.setUser(me);
      }
    });
    this.load();
    this.loadStories();
  }

  loadStories() {
    this.api.getStories().subscribe({
      next: res => this.stories = res,
      error: ()  => {}
    });
  }

  load(event?: any) {
    this.currentPage = 1;
    this.allLoaded   = false;
    this.loading     = true;
    this.api.getFeed(1).subscribe({
      next: res => {
        this.posts     = res.data ?? res;
        this.allLoaded = !(res.next_page_url ?? res.meta?.next_cursor);
        this.loading   = false;
        if (event) event.target.complete();
      },
      error: () => {
        this.loading = false;
        if (event) event.target.complete();
      }
    });
  }

  loadMore(event: any) {
    this.currentPage++;
    this.api.getFeed(this.currentPage).subscribe({
      next: res => {
        this.posts     = [...this.posts, ...(res.data ?? res)];
        this.allLoaded = !(res.next_page_url ?? res.meta?.next_cursor);
        event.target.complete();
        if (this.allLoaded) event.target.disabled = true;
      },
      error: () => { event.target.complete(); }
    });
  }

  isLikedByMe(post: any): boolean {
    if (!this.currentUserId || !post.likes) return false;
    return post.likes.some((l: any) => l.user_id === this.currentUserId);
  }

  toggleLike(post: any) {
    if (this.isLikedByMe(post)) {
      this.api.unlikePost(post.id).subscribe(() => this.load());
    } else {
      this.api.likePost(post.id).subscribe(() => this.load());
    }
  }

  imgUrl(path: string) {
    if (!path) return '';
    if (path.startsWith('http')) return path;
    const base = this.storageBase.endsWith('/') ? this.storageBase : this.storageBase + '/';
    return base + path;
  }

  goNewPost()    { this.router.navigateByUrl('/new-post'); }
  goFriends()    { this.router.navigateByUrl('/friends'); }
  goStories()    { this.router.navigateByUrl('/stories'); }
  goProfile(username: string) { if (username) this.router.navigateByUrl('/profile/' + username); }
  goMyProfile() {
    if (this.myUsername) this.router.navigateByUrl('/profile/' + this.myUsername);
  }

  openComments(post: any) {
    this.selectedPost = post;
    this.showComments = true;
    this.api.getComments(post.id).subscribe(res => this.comments = res);
  }

  sendComment() {
    if (!this.selectedPost || !this.newComment.trim()) return;
    this.api.commentPost(this.selectedPost.id, this.newComment).subscribe((res: any) => {
      this.comments.unshift(res);
      this.newComment = '';
    });
  }

  closeComments() {
    this.showComments = false;
    this.selectedPost = null;
    this.comments = [];
    this.newComment = '';
  }

  logout() {
    const navigate = () => this.router.navigateByUrl('/login', { replaceUrl: true });
    const obs = this.auth.logoutRemote();
    if (!obs) { navigate(); return; }
    obs.subscribe({
      next: () => { this.auth.logout(); navigate(); },
      error: () => { this.auth.logout(); navigate(); }
    });
  }
}