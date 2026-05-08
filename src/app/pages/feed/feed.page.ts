import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  IonHeader, IonToolbar, IonTitle, IonContent,
  IonList, IonItem, IonLabel, IonButton, IonButtons, IonInput, IonIcon
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { cameraOutline, exitOutline, personAdd, heartOutline, heart, chatbubbleOutline } from 'ionicons/icons';
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
    FormsModule, CommonModule, IonIcon
  ]
})
export class FeedPage implements OnInit {

  posts: any[] = [];
  storageBase = environment.storageUrl;

  selectedPost: any = null;
  newComment = '';
  comments: any[] = [];
  showComments = false;
  friendId: number | null = null;
  currentUserId: number | null = null;

  constructor(
    private api: Api,
    private router: Router,
    private auth: Auth,
  ) {
    addIcons({ cameraOutline, personAdd, exitOutline, heartOutline, heart, chatbubbleOutline });
  }

  ngOnInit() {
    const user = this.auth.getUser();
    this.currentUserId = user?.id ?? null;
    this.load();
  }

  load() {
    this.api.getFeed().subscribe(res => this.posts = res.data ?? res);
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
    return this.storageBase + path;
  }

  goNewPost() { this.router.navigateByUrl('/new-post'); }
  goFriends() { this.router.navigateByUrl('/friends'); }

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

  addFriend() {
    if (!this.friendId) return;
    this.api.sendFriendRequest(this.friendId).subscribe({
      next: () => { this.friendId = null; },
      error: () => { this.friendId = null; }
    });
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
