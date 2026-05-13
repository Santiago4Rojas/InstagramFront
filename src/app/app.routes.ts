import { Routes } from '@angular/router';
import { authGuard } from './guards/auth.guard';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full',
  },
  {
    path: 'login',
    loadComponent: () => import('./pages/login/login.page').then(m => m.LoginPage)
  },
  {
    path: 'feed',
    loadComponent: () => import('./pages/feed/feed.page').then(m => m.FeedPage),
    canActivate: [authGuard]
  },
  {
    path: 'new-post',
    loadComponent: () => import('./pages/new-post/new-post.page').then(m => m.NewPostPage),
    canActivate: [authGuard]
  },
  {
    path: 'profile/:username',
    loadComponent: () => import('./pages/profile/profile.page').then(m => m.ProfilePage),
    canActivate: [authGuard]
  },
  {
    path: 'stories',
    loadComponent: () => import('./pages/stories/stories.page').then(m => m.StoriesPage),
    canActivate: [authGuard]
  },
  {
    path: 'friends',
    loadComponent: () => import('./pages/friends/friends.page').then(m => m.FriendsPage),
    canActivate: [authGuard]
  },
];