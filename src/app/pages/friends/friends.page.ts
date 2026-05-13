import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import {
  IonHeader, IonToolbar, IonTitle, IonContent,
  IonList, IonItem, IonLabel, IonButton, IonButtons, IonBackButton,
  IonSearchbar, IonBadge, IonChip, IonAvatar
} from '@ionic/angular/standalone';
import { CommonModule } from '@angular/common';
import { Api } from '../../services/api';
import { Router } from '@angular/router';

@Component({
  selector: 'app-friends',
  templateUrl: './friends.page.html',
  styleUrls: ['./friends.page.scss'],
  standalone: true,
  imports: [
    FormsModule, CommonModule,
    IonHeader, IonToolbar, IonTitle, IonContent,
    IonList, IonItem, IonLabel, IonButton, IonButtons, IonBackButton,
    IonSearchbar, IonBadge, IonChip, IonAvatar
  ]
})
export class FriendsPage implements OnInit {

  friends: any[]       = [];
  pending: any[]       = [];
  searchResults: any[] = [];
  searchQuery  = '';
  feedbackMsg  = '';

  constructor(private api: Api, private router: Router) {}

  ngOnInit() { this.load(); }

  goProfile(username: string) {
    if (username) this.router.navigateByUrl('/profile/' + username);
  }

  load() {
    this.api.getFriends().subscribe(res => this.friends = res.data ?? res);
    this.api.getPendingFriendRequests().subscribe(res => this.pending = res.data ?? res);
  }

  search() {
    const q = this.searchQuery.trim();
    if (q.length < 1) { this.searchResults = []; return; }
    this.api.searchUsers(q).subscribe({
      next: res => this.searchResults = res,
      error: ()  => this.searchResults = []
    });
  }

  addFriend(username: string) {
    this.api.sendFriendByUsername(username).subscribe({
      next: () => {
        this.feedbackMsg = `Solicitud enviada a @${username}`;
        this.searchResults = this.searchResults.filter(u => u.username !== username);
        setTimeout(() => this.feedbackMsg = '', 3000);
      },
      error: (err) => {
        this.feedbackMsg = err?.error?.message ?? 'No se pudo enviar la solicitud';
        setTimeout(() => this.feedbackMsg = '', 3000);
      }
    });
  }

  accept(req: any) {
    this.api.acceptFriendship(req.id).subscribe(() => this.load());
  }

}