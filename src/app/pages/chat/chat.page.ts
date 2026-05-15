import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  IonHeader, IonToolbar, IonContent, IonButtons, IonButton, IonIcon,
  IonFooter, IonSpinner, ToastController
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  chevronBackOutline, callOutline, videocamOutline, personOutline,
  cameraOutline, imagesOutline, happyOutline, micOutline
} from 'ionicons/icons';
import { ActivatedRoute, Router } from '@angular/router';
import { Auth } from '../../services/auth';
import { Api } from '../../services/api';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-chat',
  templateUrl: './chat.page.html',
  styleUrls: ['./chat.page.scss'],
  standalone: true,
  imports: [
    CommonModule, FormsModule,
    IonHeader, IonToolbar, IonContent, IonButtons, IonButton, IonIcon,
    IonFooter, IonSpinner
  ],
  providers: [ToastController]
})
export class ChatPage implements OnInit, OnDestroy {
  @ViewChild(IonContent) content!: IonContent;

  friendId     = 0;
  friendName   = '';
  friendAvatar = '';
  messages: any[] = [];
  newMessage   = '';
  loading      = true;
  sending      = false;
  myId         = 0;
  storageBase  = environment.storageUrl;

  private pollTimer: any;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private auth: Auth,
    private api: Api,
    private toast: ToastController
  ) {
    addIcons({
      chevronBackOutline, callOutline, videocamOutline, personOutline,
      cameraOutline, imagesOutline, happyOutline, micOutline
    });
  }

  ngOnInit() {
    this.myId = this.auth.getUser()?.id ?? 0;
    this.route.paramMap.subscribe(p => {
      this.friendId = Number(p.get('id'));
      this.loadFriend();
      this.loadMessages();
      this.startPolling();
    });
  }

  ngOnDestroy() {
    clearInterval(this.pollTimer);
  }

  private loadFriend() {
    this.api.getUserById(this.friendId).subscribe({
      next: res => {
        this.friendName   = res.username || res.name || `Usuario ${this.friendId}`;
        this.friendAvatar = res.avatar_data || this.imgUrl(res.avatar);
      },
      error: () => {
        this.friendName = `Usuario ${this.friendId}`;
      }
    });
  }

  private loadMessages() {
    this.api.getMessages(this.friendId).subscribe({
      next: res => {
        this.messages = (res.data ?? res).reverse();
        this.loading  = false;
        this.scrollBottom();
      },
      error: () => { this.loading = false; }
    });
  }

  private startPolling() {
    clearInterval(this.pollTimer);
    this.pollTimer = setInterval(() => this.loadMessages(), 5000);
  }

  imgUrl(path: string) {
    if (!path) return '';
    if (path.startsWith('data:') || path.startsWith('http')) return path;
    const base = this.storageBase.endsWith('/') ? this.storageBase : this.storageBase + '/';
    return base + path;
  }

  isMine(msg: any): boolean {
    // sender_id can come as number or string depending on DB driver
    return Number(msg.sender_id) === this.myId;
  }

  formatTime(dateStr: string): string {
    const d = new Date(dateStr);
    return d.getHours() + ':' + String(d.getMinutes()).padStart(2, '0');
  }

  send() {
    const t = this.newMessage.trim();
    if (!t || this.sending) return;
    this.sending = true;
    this.api.sendMessage(this.friendId, t).subscribe({
      next: msg => {
        this.messages.push(msg);
        this.newMessage = '';
        this.sending    = false;
        this.scrollBottom();
      },
      error: () => { this.sending = false; }
    });
  }

  private scrollBottom() {
    setTimeout(() => this.content?.scrollToBottom(200), 100);
  }

  async startCall() {
    const t = await this.toast.create({
      message: `Llamando a ${this.friendName}... (función próximamente)`,
      duration: 2500,
      position: 'top',
      color: 'dark'
    });
    t.present();
  }

  async startVideo() {
    const t = await this.toast.create({
      message: `Videollamada con ${this.friendName}... (función próximamente)`,
      duration: 2500,
      position: 'top',
      color: 'dark'
    });
    t.present();
  }

  goBack() { this.router.navigateByUrl('/tabs/messages'); }
}
