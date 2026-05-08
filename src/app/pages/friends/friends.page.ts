import { Component, OnInit } from '@angular/core';
import {
  IonHeader, IonToolbar, IonTitle, IonContent,
  IonList, IonItem, IonLabel, IonButton, IonButtons, IonBackButton
} from '@ionic/angular/standalone';
import { Api } from '../../services/api';

@Component({
  selector: 'app-friends',
  templateUrl: './friends.page.html',
  styleUrls: ['./friends.page.scss'],
  standalone: true,
  imports: [
    IonHeader, IonToolbar, IonTitle, IonContent,
    IonList, IonItem, IonLabel, IonButton, IonButtons, IonBackButton
  ]
})
export class FriendsPage implements OnInit {

  friends: any[] = [];
  pending: any[] = [];

  constructor(private api: Api) {}

  ngOnInit() { this.load(); }

  load() {
    this.api.getFriends().subscribe(res => this.friends = res.data ?? res);
    this.api.getPendingFriendRequests().subscribe(res => this.pending = res.data ?? res);
  }

  accept(req: any) {
    this.api.acceptFriendship(req.id).subscribe(() => this.load());
  }

}
