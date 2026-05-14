import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonHeader, IonToolbar, IonTitle, IonContent, IonIcon, IonSpinner } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { personAddOutline, heartOutline, chatbubbleOutline, personOutline, checkmarkOutline, closeOutline } from 'ionicons/icons';
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
  friendRequests: any[] = [];
  loading = false;
  storageBase = environment.storageUrl;

  constructor(private api: Api, private router: Router) {
    addIcons({ personAddOutline, heartOutline, chatbubbleOutline, personOutline, checkmarkOutline, closeOutline });
  }

  ngOnInit() {
    this.loading = true;
    this.api.getPendingFriendRequests().subscribe({
      next: res => { this.friendRequests = res; this.loading = false; },
      error: () => { this.loading = false; }
    });
  }

  imgUrl(path: string) {
    if (!path) return '';
    if (path.startsWith('http')) return path;
    const base = this.storageBase.endsWith('/') ? this.storageBase : this.storageBase + '/';
    return base + path;
  }

  accept(req: any) {
    this.api.acceptFriendship(req.id).subscribe(() => {
      this.friendRequests = this.friendRequests.filter(r => r.id !== req.id);
    });
  }

  goProfile(username: string) { if (username) this.router.navigateByUrl('/tabs/profile/' + username); }
}
