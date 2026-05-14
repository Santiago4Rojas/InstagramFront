import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonHeader, IonToolbar, IonContent, IonButtons, IonButton, IonIcon, IonSpinner } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { chevronBackOutline, heartOutline, heart, chatbubbleOutline, paperPlaneOutline, bookmarkOutline, ellipsisHorizontal, personOutline } from 'ionicons/icons';
import { ActivatedRoute, Router } from '@angular/router';
import { Api } from '../../services/api';
import { Auth } from '../../services/auth';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-post-detail',
  templateUrl: './post-detail.page.html',
  styleUrls: ['./post-detail.page.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, IonHeader, IonToolbar, IonContent, IonButtons, IonButton, IonIcon, IonSpinner]
})
export class PostDetailPage implements OnInit {
  post: any = null;
  comments: any[] = [];
  loading = true;
  newComment = '';
  currentUserId: number | null = null;
  storageBase = environment.storageUrl;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private api: Api,
    private auth: Auth
  ) {
    addIcons({ chevronBackOutline, heartOutline, heart, chatbubbleOutline, paperPlaneOutline, bookmarkOutline, ellipsisHorizontal, personOutline });
  }

  ngOnInit() {
    this.currentUserId = this.auth.getUser()?.id ?? null;
    this.route.paramMap.subscribe(p => {
      const id = Number(p.get('id'));
      if (id) this.loadPost(id);
    });
  }

  loadPost(id: number) {
    this.loading = true;
    this.api.getComments(id).subscribe({
      next: res => {
        this.comments = res;
        this.loading = false;
      },
      error: () => { this.loading = false; }
    });
  }

  imgUrl(path: string) {
    if (!path) return '';
    if (path.startsWith('http')) return path;
    const base = this.storageBase.endsWith('/') ? this.storageBase : this.storageBase + '/';
    return base + path;
  }

  isLikedByMe(): boolean {
    if (!this.post || !this.currentUserId) return false;
    return this.post.likes?.some((l: any) => l.user_id === this.currentUserId);
  }

  sendComment() {
    if (!this.post || !this.newComment.trim()) return;
    this.api.commentPost(this.post.id, this.newComment).subscribe((res: any) => {
      this.comments.unshift(res);
      this.newComment = '';
    });
  }

  goBack() { this.router.navigateByUrl('/tabs/feed'); }
  goProfile(username: string) { if (username) this.router.navigateByUrl('/tabs/profile/' + username); }
}
