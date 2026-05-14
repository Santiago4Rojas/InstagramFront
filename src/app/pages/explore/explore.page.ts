import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonHeader, IonToolbar, IonContent, IonSearchbar, IonSpinner, IonIcon } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { searchOutline, personOutline } from 'ionicons/icons';
import { Router } from '@angular/router';
import { Api } from '../../services/api';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-explore',
  templateUrl: './explore.page.html',
  styleUrls: ['./explore.page.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, IonHeader, IonToolbar, IonContent, IonSearchbar, IonSpinner, IonIcon]
})
export class ExplorePage implements OnInit {
  posts: any[] = [];
  users: any[] = [];
  searchQuery = '';
  loading = false;
  searchLoading = false;
  storageBase = environment.storageUrl;

  constructor(private api: Api, private router: Router) {
    addIcons({ searchOutline, personOutline });
  }

  ngOnInit() { this.loadPosts(); }

  loadPosts() {
    this.loading = true;
    this.api.getFeed(1).subscribe({
      next: res => { this.posts = res.data ?? res; this.loading = false; },
      error: () => { this.loading = false; }
    });
  }

  onSearch(ev: any) {
    const q = ev.detail.value?.trim() ?? '';
    this.searchQuery = q;
    if (!q) { this.users = []; return; }
    this.searchLoading = true;
    this.api.searchUsers(q).subscribe({
      next: res => { this.users = res; this.searchLoading = false; },
      error: () => { this.searchLoading = false; }
    });
  }

  imgUrl(path: string) {
    if (!path) return '';
    if (path.startsWith('http')) return path;
    const base = this.storageBase.endsWith('/') ? this.storageBase : this.storageBase + '/';
    return base + path;
  }

  goProfile(username: string) { if (username) this.router.navigateByUrl('/tabs/profile/' + username); }
}
