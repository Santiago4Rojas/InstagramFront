import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  IonHeader, IonToolbar, IonTitle, IonContent,
  IonButton, IonButtons, IonBackButton, IonIcon,
} from '@ionic/angular/standalone';
import { Api } from '../../services/api';
import { Router } from '@angular/router';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import { addIcons } from 'ionicons';
import { camera, fileTray, cloudUpload, imageOutline, imagesOutline, cameraOutline, chevronForwardOutline, personOutline } from 'ionicons/icons';

@Component({
  selector: 'app-new-post',
  templateUrl: './new-post.page.html',
  styleUrls: ['./new-post.page.scss'],
  standalone: true,
  imports: [
    IonHeader, IonToolbar, IonTitle, IonContent,
    IonButton, IonButtons, IonBackButton, IonIcon,
    FormsModule, CommonModule
  ]
})
export class NewPostPage {

  caption = '';
  file?: File;
  preview?: string;

  constructor(private api: Api, private router: Router) {
    addIcons({ camera, fileTray, cloudUpload, imageOutline, imagesOutline, cameraOutline, chevronForwardOutline, personOutline });
  }

  onFileChange(ev: any) {
    const f: File = ev.target.files[0];
    if (!f) return;
    this.file = f;
    this.preview = URL.createObjectURL(f);
  }

  async takePhoto() {
    try {
      const photo = await Camera.getPhoto({
        quality: 80,
        resultType: CameraResultType.DataUrl,
        source: CameraSource.Camera
      });
      this.preview = photo.dataUrl || undefined;
      if (photo.dataUrl) {
        this.file = this.dataUrlToFile(photo.dataUrl, 'photo.jpg');
      }
    } catch (err) {
      console.warn('Cámara cancelada o sin permiso', err);
    }
  }

  upload() {
    if (!this.file) return;
    this.api.createPost(this.file, this.caption).subscribe({
      next: () => this.router.navigateByUrl('/tabs/feed'),
      error: (err) => console.error('Error al publicar', err)
    });
  }

  private dataUrlToFile(dataUrl: string, filename: string): File {
    const arr = dataUrl.split(',');
    const mime = arr[0].match(/:(.*?);/)![1];
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    while (n--) u8arr[n] = bstr.charCodeAt(n);
    return new File([u8arr], filename, { type: mime });
  }

}
