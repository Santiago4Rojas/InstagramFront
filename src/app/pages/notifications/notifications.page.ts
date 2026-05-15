import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  IonHeader, IonToolbar, IonTitle, IonContent, IonIcon, IonSpinner
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  personAddOutline, heartOutline, heart, chatbubbleOutline,
  personOutline, checkmarkOutline, closeOutline
} from 'ionicons/icons';
import { Router } from '@angular/router';
import { Api } from '../../services/api';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-notifications',
  templateUrl: './notifications.page.html',
  styleUrls: ['./notifications.page.scss'],
  standalone: true,
  imports: [CommonModule, IonHeader, IonToolbar, IonTitle, IonContent, IonIcon, IonSpinner]
})
export class NotificationsPage implements OnInit {
  notifications: any[] = [];
  loading = false;
  storageBase = environment.storageUrl;

  constructor(private api: Api, private router: Router) {
    addIcons({ personAddOutline, heartOutline, heart, chatbubbleOutline, personOutline, checkmarkOutline, closeOutline });
  }

  ngOnInit() {
    this.load();
  }

  ionViewWillEnter() {
    this.load();
  }

  load() {
    this.loading = true;
    this.api.getNotifications().subscribe({
      next: res => { this.notifications = res; this.loading = false; },
      error: () => { this.loading = false; }
    });
  }

  imgUrl(path: string) {
    if (!path) return '';
    if (path.startsWith('data:') || path.startsWith('http')) return path;
    const base = this.storageBase.endsWith('/') ? this.storageBase : this.storageBase + '/';
    return base + path;
  }

  accept(notif: any) {
    this.api.acceptFriendship(notif.friendship_id).subscribe(() => {
      this.notifications = this.notifications.filter(n =>
        !(n.type === 'friend_request' && n.friendship_id === notif.friendship_id)
      );
    });
  }

  goProfile(username: string) {
    if (username) this.router.navigateByUrl('/tabs/profile/' + username);
  }

  goPost(postId: number) {
    if (postId) this.router.navigateByUrl('/tabs/post/' + postId);
  }

  textFor(n: any): string {
    if (n.type === 'like')           return 'le dio me gusta a tu publicación.';
    if (n.type === 'comment')        return `comentó: "${n.text}"`;
    if (n.type === 'friend_request') return 'quiere ser tu amigo.';
    return '';
  }

  timeAgo(dateStr: string): string {
    const diff = Date.now() - new Date(dateStr).getTime();
    const m = Math.floor(diff / 60000);
    if (m < 60)   return `${m}m`;
    const h = Math.floor(m / 60);
    if (h < 24)   return `${h}h`;
    return `${Math.floor(h / 24)}d`;
  }
}
