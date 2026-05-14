import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonHeader, IonToolbar, IonContent, IonButtons, IonButton, IonIcon, IonFooter } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { chevronBackOutline, callOutline, videocamOutline, personOutline, cameraOutline, imagesOutline, happyOutline, micOutline } from 'ionicons/icons';
import { ActivatedRoute, Router } from '@angular/router';
import { Auth } from '../../services/auth';

interface Message { id: number; text: string; mine: boolean; time: string; }

@Component({
  selector: 'app-chat',
  templateUrl: './chat.page.html',
  styleUrls: ['./chat.page.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, IonHeader, IonToolbar, IonContent, IonButtons, IonButton, IonIcon, IonFooter]
})
export class ChatPage implements OnInit {
  friendName = '';
  messages: Message[] = [];
  newMessage = '';
  private nextId = 1;

  constructor(private route: ActivatedRoute, private router: Router, private auth: Auth) {
    addIcons({ chevronBackOutline, callOutline, videocamOutline, personOutline, cameraOutline, imagesOutline, happyOutline, micOutline });
  }

  ngOnInit() {
    this.route.paramMap.subscribe(p => {
      this.friendName = 'Usuario ' + p.get('id');
    });
  }

  send() {
    const t = this.newMessage.trim();
    if (!t) return;
    const now = new Date();
    this.messages.push({
      id: this.nextId++,
      text: t,
      mine: true,
      time: now.getHours() + ':' + String(now.getMinutes()).padStart(2, '0')
    });
    this.newMessage = '';
  }

  goBack() { this.router.navigateByUrl('/tabs/messages'); }
}
