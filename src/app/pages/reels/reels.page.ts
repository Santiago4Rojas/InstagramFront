import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonContent, IonIcon, IonSpinner } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { heartOutline, heart, chatbubbleOutline, paperPlaneOutline, bookmarkOutline, musicalNoteOutline, ellipsisVertical, personCircleOutline } from 'ionicons/icons';
import { Router } from '@angular/router';
import { Api } from '../../services/api';
import { Auth } from '../../services/auth';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-reels',
  templateUrl: './reels.page.html',
  styleUrls: ['./reels.page.scss'],
  standalone: true,
  imports: [CommonModule, IonContent, IonIcon, IonSpinner]
})
export class ReelsPage implements OnInit {
  reels: any[] = [];
  loading = false;
  storageBase = environment.storageUrl;
  currentUserId: number | null = null;

  constructor(private api: Api, private auth: Auth, private router: Router) {
    addIcons({ heartOutline, heart, chatbubbleOutline, paperPlaneOutline, bookmarkOutline, musicalNoteOutline, ellipsisVertical, personCircleOutline });
  }

  ngOnInit() {
    this.currentUserId = this.auth.getUser()?.id ?? null;
    this.loading = true;
    this.api.getFeed(1).subscribe({
      next: res => {
        const all = res.data ?? res;
        this.reels = all.filter((p: any) => p.media_type === 'video' || p.image?.match(/\.(mp4|mov|webm)$/i));
        if (this.reels.length === 0) this.reels = all;
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

  isLikedByMe(reel: any): boolean {
    if (!this.currentUserId || !reel.likes) return false;
    return reel.likes.some((l: any) => l.user_id === this.currentUserId);
  }

  goProfile(username: string) { if (username) this.router.navigateByUrl('/tabs/profile/' + username); }
}
