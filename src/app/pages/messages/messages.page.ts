import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonHeader, IonToolbar, IonTitle, IonContent, IonButtons, IonButton, IonIcon, IonSpinner } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { videocamOutline, addOutline, personOutline, chevronForwardOutline } from 'ionicons/icons';
import { Router } from '@angular/router';
import { Api } from '../../services/api';
import { Auth } from '../../services/auth';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-messages',
  templateUrl: './messages.page.html',
  styleUrls: ['./messages.page.scss'],
  standalone: true,
  imports: [CommonModule, IonHeader, IonToolbar, IonTitle, IonContent, IonButtons, IonButton, IonIcon, IonSpinner]
})
export class MessagesPage implements OnInit {
  friends: any[] = [];
  loading = false;
  myUsername = '';
  storageBase = environment.storageUrl;

  constructor(private api: Api, private auth: Auth, private router: Router) {
    addIcons({ videocamOutline, addOutline, personOutline, chevronForwardOutline });
  }

  ngOnInit() {
    this.myUsername = this.auth.getUser()?.profile?.username ?? this.auth.getUser()?.name ?? '';
    this.loading = true;
    this.api.getFriends().subscribe({
      next: res => { this.friends = res; this.loading = false; },
      error: () => { this.loading = false; }
    });
  }

  imgUrl(path: string) {
    if (!path) return '';
    if (path.startsWith('http')) return path;
    const base = this.storageBase.endsWith('/') ? this.storageBase : this.storageBase + '/';
    return base + path;
  }

  openChat(friend: any) {
    this.router.navigateByUrl('/tabs/messages/' + friend.id);
  }
}
