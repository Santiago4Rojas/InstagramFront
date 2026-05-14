import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonContent, IonIcon, IonLabel, ModalController } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { filmOutline, gridOutline, cameraOutline } from 'ionicons/icons';
import { Router } from '@angular/router';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';

@Component({
  selector: 'app-create-menu',
  templateUrl: './create-menu.page.html',
  styleUrls: ['./create-menu.page.scss'],
  standalone: true,
  imports: [CommonModule, IonContent, IonIcon, IonLabel]
})
export class CreateMenuPage {

  constructor(private modalCtrl: ModalController, private router: Router) {
    addIcons({ filmOutline, gridOutline, cameraOutline });
  }

  async dismiss() { await this.modalCtrl.dismiss(); }

  goReel() {
    this.dismiss();
    this.router.navigateByUrl('/tabs/reels');
  }

  goPost() {
    this.dismiss();
    this.router.navigateByUrl('/tabs/new-post');
  }

  async openCamera() {
    await this.dismiss();
    try {
      await Camera.getPhoto({
        quality: 90,
        resultType: CameraResultType.DataUrl,
        source: CameraSource.Camera
      });
    } catch {}
  }
}
