import { Component, OnInit, OnDestroy, ViewChild, ElementRef, NgZone } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  IonHeader, IonToolbar, IonTitle, IonContent, IonButton,
  IonButtons, IonBackButton, IonIcon, IonItem,
  IonInput, IonSpinner, IonGrid, IonRow, IonCol
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { trashOutline, timeOutline, cameraOutline, videocamOutline, imagesOutline, cloudUploadOutline } from 'ionicons/icons';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import { Api } from '../../services/api';
import { Auth } from '../../services/auth';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-stories',
  templateUrl: './stories.page.html',
  styleUrls: ['./stories.page.scss'],
  standalone: true,
  imports: [
    CommonModule, FormsModule,
    IonHeader, IonToolbar, IonTitle, IonContent, IonButton,
    IonButtons, IonBackButton, IonIcon, IonItem,
    IonInput, IonSpinner, IonGrid, IonRow, IonCol
  ]
})
export class StoriesPage implements OnInit, OnDestroy {

  @ViewChild('videoViewer') videoViewerRef?: ElementRef<HTMLVideoElement>;
  @ViewChild('mediaInput')  mediaInputRef?:  ElementRef<HTMLInputElement>;

  groups: any[]    = [];
  storageBase      = environment.storageUrl;
  loading          = false;

  // ── Upload ──────────────────────────────────────────
  caption          = '';
  file?: File;
  preview?: string;
  previewIsVideo   = false;
  uploading        = false;

  // ── Viewer ──────────────────────────────────────────
  activeStory: any = null;
  activeGroup: any = null;
  storyIndex       = 0;

  // Timer / progress
  progress         = 0;          // 0-100
  private timerInterval: any;
  private elapsed  = 0;
  private duration = 10000;      // ms (10s fotos, max 30s videos)

  currentUserId: number | null = null;

  constructor(private api: Api, private auth: Auth, private zone: NgZone) {
    addIcons({ trashOutline, timeOutline, cameraOutline, videocamOutline, imagesOutline, cloudUploadOutline });
  }

  ngOnInit() {
    this.currentUserId = this.auth.getUser()?.id ?? null;
    this.load();
  }

  ngOnDestroy() { this.clearTimer(); }

  load() {
    this.loading = true;
    this.api.getStories().subscribe({
      next: res  => { this.groups = res; this.loading = false; },
      error: ()  => { this.loading = false; }
    });
  }

  mediaUrl(path: string) {
    if (!path) return '';
    if (path.startsWith('http')) return path;
    const base = this.storageBase.endsWith('/') ? this.storageBase : this.storageBase + '/';
    return base + path;
  }

  // ── Seleccionar archivo (imagen o video) ─────────────
  openFilePicker() {
    this.mediaInputRef?.nativeElement.click();
  }

  onFileChange(ev: any) {
    const f: File = ev.target.files[0];
    if (!f) return;
    this.file          = f;
    this.previewIsVideo = f.type.startsWith('video/');
    this.preview       = URL.createObjectURL(f);
    // reset input so same file can be re-selected
    ev.target.value = '';
  }

  // ── Tomar foto con cámara ─────────────────────────────
  async takePhoto() {
    try {
      const photo = await Camera.getPhoto({
        quality: 85,
        resultType: CameraResultType.DataUrl,
        source: CameraSource.Camera,
      });
      if (photo.dataUrl) {
        this.previewIsVideo = false;
        this.preview        = photo.dataUrl;
        this.file           = this.dataUrlToFile(photo.dataUrl, 'photo.jpg');
      }
    } catch (err) {
      console.warn('Cámara cancelada', err);
    }
  }

  // ── Grabar video con cámara ───────────────────────────
  async recordVideo() {
    // Capacitor Camera no soporta video nativamente en web;
    // en web abrimos el input con capture=camcorder
    if (this.mediaInputRef) {
      const el = this.mediaInputRef.nativeElement;
      el.accept  = 'video/*';
      el.capture = 'environment';
      el.click();
      // restaurar para la próxima vez
      setTimeout(() => { el.accept = 'image/*,video/*'; el.removeAttribute('capture'); }, 500);
    }
  }

  // ── Subir historia ───────────────────────────────────
  upload() {
    if (!this.file || this.uploading) return;
    this.uploading = true;
    this.api.createStory(this.file, this.caption).subscribe({
      next: () => {
        this.file           = undefined;
        this.preview        = undefined;
        this.previewIsVideo = false;
        this.caption        = '';
        this.uploading      = false;
        this.load();
      },
      error: () => { this.uploading = false; }
    });
  }

  cancelUpload() {
    this.file           = undefined;
    this.preview        = undefined;
    this.previewIsVideo = false;
    this.caption        = '';
  }

  // ── Abrir grupo de historias ─────────────────────────
  openGroup(group: any) {
    this.activeGroup = group;
    this.storyIndex  = 0;
    this.showStory(group.stories[0]);
  }

  showStory(story: any) {
    this.clearTimer();
    this.activeStory = story;
    this.progress    = 0;
    this.elapsed     = 0;

    if (story.media_type === 'video') {
      // El timer arranca cuando el video dispara 'loadedmetadata'
      // (ver template con (loadedmetadata)="onVideoLoaded($event)")
    } else {
      this.startTimer(10000);
    }
  }

  onVideoLoaded(ev: Event) {
    const video = ev.target as HTMLVideoElement;
    const dur   = Math.min((video.duration || 10) * 1000, 30000);
    this.startTimer(dur);
    video.play().catch(() => {});
  }

  private startTimer(durationMs: number) {
    this.duration = durationMs;
    const tick    = 100; // ms
    this.timerInterval = setInterval(() => {
      this.zone.run(() => {
        this.elapsed += tick;
        this.progress = Math.min((this.elapsed / this.duration) * 100, 100);
        if (this.elapsed >= this.duration) {
          this.nextStory();
        }
      });
    }, tick);
  }

  private clearTimer() {
    if (this.timerInterval) { clearInterval(this.timerInterval); this.timerInterval = null; }
  }

  nextStory() {
    if (!this.activeGroup) return;
    this.clearTimer();
    if (this.storyIndex < this.activeGroup.stories.length - 1) {
      this.storyIndex++;
      this.showStory(this.activeGroup.stories[this.storyIndex]);
    } else {
      this.closeStory();
    }
  }

  prevStory() {
    if (!this.activeGroup) return;
    if (this.storyIndex > 0) {
      this.storyIndex--;
      this.showStory(this.activeGroup.stories[this.storyIndex]);
    }
  }

  closeStory() {
    this.clearTimer();
    this.activeStory = null;
    this.activeGroup = null;
    this.storyIndex  = 0;
    this.progress    = 0;
  }

  // ── Eliminar ─────────────────────────────────────────
  deleteStory(story: any) {
    this.api.deleteStory(story.id).subscribe(() => {
      this.closeStory();
      this.load();
    });
  }

  isOwn(story: any) { return story.user_id === this.currentUserId; }

  timeLeft(expiresAt: string): string {
    const diff = new Date(expiresAt).getTime() - Date.now();
    const h    = Math.floor(diff / 3600000);
    const m    = Math.floor((diff % 3600000) / 60000);
    return h > 0 ? `${h}h ${m}m` : `${m}m`;
  }

  private dataUrlToFile(dataUrl: string, filename: string): File {
    const arr  = dataUrl.split(',');
    const mime = arr[0].match(/:(.*?);/)![1];
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8 = new Uint8Array(n);
    while (n--) u8[n] = bstr.charCodeAt(n);
    return new File([u8], filename, { type: mime });
  }
}