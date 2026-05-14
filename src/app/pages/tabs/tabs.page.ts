import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  IonTabs, IonTabBar, IonTabButton, IonIcon, IonLabel,
  ModalController
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  homeOutline, home, filmOutline, film,
  searchOutline, search, personCircleOutline, personCircle,
  addCircleOutline
} from 'ionicons/icons';
import { Auth } from '../../services/auth';
import { CreateMenuPage } from '../create-menu/create-menu.page';

@Component({
  selector: 'app-tabs',
  templateUrl: './tabs.page.html',
  styleUrls: ['./tabs.page.scss'],
  standalone: true,
  imports: [CommonModule, IonTabs, IonTabBar, IonTabButton, IonIcon, IonLabel]
})
export class TabsPage {

  constructor(private auth: Auth, private modalCtrl: ModalController) {
    addIcons({ homeOutline, home, filmOutline, film, searchOutline, search,
               personCircleOutline, personCircle, addCircleOutline });
  }

  get myUsername(): string {
    return this.auth.getUser()?.profile?.username ?? this.auth.getUser()?.username ?? 'me';
  }

  async openCreateMenu(event: Event) {
    event.stopPropagation();
    const modal = await this.modalCtrl.create({
      component: CreateMenuPage,
      initialBreakpoint: 0.38,
      breakpoints: [0, 0.38],
      handle: true,
      cssClass: 'create-menu-modal',
    });
    await modal.present();
  }
}
