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
    path: 'tabs',
    loadComponent: () => import('./pages/tabs/tabs.page').then(m => m.TabsPage),
    canActivate: [authGuard],
    children: [
      { path: '', redirectTo: 'feed', pathMatch: 'full' },
      {
        path: 'feed',
        loadComponent: () => import('./pages/feed/feed.page').then(m => m.FeedPage)
      },
      {
        path: 'reels',
        loadComponent: () => import('./pages/reels/reels.page').then(m => m.ReelsPage)
      },
      {
        path: 'search',
        loadComponent: () => import('./pages/explore/explore.page').then(m => m.ExplorePage)
      },
      {
        path: 'profile/:username',
        loadComponent: () => import('./pages/profile/profile.page').then(m => m.ProfilePage)
      },
      {
        path: 'new-post',
        loadComponent: () => import('./pages/new-post/new-post.page').then(m => m.NewPostPage)
      },
      {
        path: 'stories',
        loadComponent: () => import('./pages/stories/stories.page').then(m => m.StoriesPage)
      },
      {
        path: 'messages',
        loadComponent: () => import('./pages/messages/messages.page').then(m => m.MessagesPage)
      },
      {
        path: 'messages/:id',
        loadComponent: () => import('./pages/chat/chat.page').then(m => m.ChatPage)
      },
      {
        path: 'notifications',
        loadComponent: () => import('./pages/notifications/notifications.page').then(m => m.NotificationsPage)
      },
      {
        path: 'post/:id',
        loadComponent: () => import('./pages/post-detail/post-detail.page').then(m => m.PostDetailPage)
      },
    ]
  },
  // Legacy redirects so old nav links still work
  { path: 'feed', redirectTo: 'tabs/feed', pathMatch: 'full' },
  { path: 'profile/:username', redirectTo: 'tabs/profile/:username' },
  { path: 'stories', redirectTo: 'tabs/stories', pathMatch: 'full' },
  { path: 'friends', redirectTo: 'tabs/search', pathMatch: 'full' },
  { path: 'new-post', redirectTo: 'tabs/new-post', pathMatch: 'full' },
];
