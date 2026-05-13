import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  IonHeader, IonToolbar, IonTitle, IonContent, IonButton,
  IonButtons, IonBackButton, IonIcon, IonSpinner,
  IonGrid, IonRow, IonCol, IonItem, IonInput, IonLabel, IonTextarea
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  gridOutline, lockClosedOutline, personAddOutline,
  checkmarkCircleOutline, createOutline, linkOutline,
  cameraOutline, imagesOutline, heartOutline, heart, chatbubbleOutline
} from 'ionicons/icons';
import { ActivatedRoute, Router } from '@angular/router';
import { Api } from '../../services/api';
import { Auth } from '../../services/auth';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.page.html',
  styleUrls: ['./profile.page.scss'],
  standalone: true,
  imports: [
    CommonModule, FormsModule,
    IonHeader, IonToolbar, IonTitle, IonContent, IonButton,
    IonButtons, IonBackButton, IonIcon, IonSpinner,
    IonGrid, IonRow, IonCol, IonItem, IonInput, IonLabel, IonTextarea
  ]
})
export class ProfilePage implements OnInit {

  username    = '';
  data: any   = null;
  loading     = true;
  storageBase = environment.storageUrl;

  // Editar perfil
  editMode    = false;
  editBio     = '';
  editWebsite = '';
  saving      = false;

  // Avatar
  avatarPreview?: string;
  uploadingAvatar = false;

  // Modal foto de perfil (opciones al tocar avatar)
  showAvatarOptions = false;
  showAvatarFull    = false;

  // Post ampliado
  selectedPost: any = null;
  newComment        = '';
  comments: any[]   = [];
  currentUserId: number | null = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private api: Api,
    private auth: Auth
  ) {
    addIcons({ gridOutline, lockClosedOutline, personAddOutline,
               checkmarkCircleOutline, createOutline, linkOutline,
               cameraOutline, imagesOutline, heartOutline, heart, chatbubbleOutline });
  }

  ngOnInit() {
    this.currentUserId = this.auth.getUser()?.id ?? null;
    this.route.paramMap.subscribe(p => {
      this.username = p.get('username') ?? '';
      this.load();
    });
  }

  load() {
    this.loading = true;
    this.api.getProfile(this.username).subscribe({
      next: res  => { this.data = res; this.loading = false; },
      error: ()  => { this.loading = false; }
    });
  }

  mediaUrl(path: string) {
    if (!path) return '';
    if (path.startsWith('http')) return path;
    const base = this.storageBase.endsWith('/') ? this.storageBase : this.storageBase + '/';
    return base + path;
  }

  get friendshipStatus(): string { return this.data?.friendship_status ?? 'none'; }

  // ── Amistad ──────────────────────────────────────────
  sendRequest()  { this.api.sendFriendByUsername(this.username).subscribe(() => this.load()); }
  acceptRequest() {
    if (!this.data?.friendship_id) return;
    this.api.acceptFriendship(this.data.friendship_id).subscribe(() => this.load());
  }

  // ── Tocar avatar ────────────────────────────────────
  onAvatarTap() {
    if (this.friendshipStatus === 'own') {
      this.showAvatarOptions = true;   // opciones: cambiar foto / ver historias
    } else {
      this.showAvatarOptions = true;   // opciones: ver foto / ver historias
    }
  }

  viewAvatarFull() {
    this.showAvatarOptions = false;
    this.showAvatarFull    = true;
  }

  goToStoriesOf() {
    this.showAvatarOptions = false;
    // Navegar a historias del feed (en el futuro se puede filtrar por usuario)
    this.router.navigateByUrl('/stories');
  }

  // ── Subir avatar ─────────────────────────────────────
  triggerAvatarInput() {
    this.showAvatarOptions = false;
    setTimeout(() => document.getElementById('avatarInput')?.click(), 100);
  }

  onAvatarFileChange(ev: any) {
    const f: File = ev.target.files[0];
    if (!f) return;
    this.avatarPreview   = URL.createObjectURL(f);
    this.uploadingAvatar = true;
    this.api.uploadAvatar(f).subscribe({
      next: () => {
        this.uploadingAvatar = false;
        this.avatarPreview   = undefined;
        this.load();
      },
      error: () => { this.uploadingAvatar = false; }
    });
    ev.target.value = '';
  }

  // ── Editar perfil ────────────────────────────────────
  openEdit() {
    this.editBio     = this.data?.profile?.bio     ?? '';
    this.editWebsite = this.data?.profile?.website ?? '';
    this.editMode    = true;
  }

  saveEdit() {
    this.saving = true;
    this.api.updateProfile({ bio: this.editBio, website: this.editWebsite }).subscribe({
      next: () => { this.saving = false; this.editMode = false; this.load(); },
      error: () => { this.saving = false; }
    });
  }

  // ── Ver post ─────────────────────────────────────────
  openPost(post: any) {
    this.selectedPost = post;
    this.api.getComments(post.id).subscribe(res => this.comments = res);
  }

  closePost() {
    this.selectedPost = null;
    this.comments     = [];
    this.newComment   = '';
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

  sendComment() {
    if (!this.selectedPost || !this.newComment.trim()) return;
    this.api.commentPost(this.selectedPost.id, this.newComment).subscribe((res: any) => {
      this.comments.unshift(res);
      this.newComment = '';
    });
  }

  goToProfile(username: string) {
    if (username) this.router.navigateByUrl('/profile/' + username);
  }
}