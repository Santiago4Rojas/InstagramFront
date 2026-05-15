import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Auth } from './auth';
import { environment } from '../../environments/environment';


@Injectable({
  providedIn: 'root',
})
export class Api {

  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient, private auth: Auth) {}

  private authHeaders() {
    const token = this.auth.getToken();
    let headers = new HttpHeaders();
    if (token) headers = headers.set('Authorization', `Bearer ${token}`);
    return { headers };
  }

  getFeed(page = 1) {
    return this.http.get<any>(this.apiUrl + `posts?page=${page}`, this.authHeaders());
  }

  getFriends() {
    return this.http.get<any>(this.apiUrl + 'friends', this.authHeaders());
  }

  likePost(id: number) {
    return this.http.post(this.apiUrl + `posts/${id}/like`, {}, this.authHeaders());
  }

  unlikePost(id: number) {
    return this.http.delete(this.apiUrl + `posts/${id}/like`, this.authHeaders());
  }

  createPost(file: File, caption: string) {
    const fd = new FormData();
    fd.append('image', file);
    fd.append('caption', caption);
    return this.http.post(this.apiUrl + 'posts', fd, this.authHeaders());
  }

  commentPost(postId: number, content: string) {
    return this.http.post(
      this.apiUrl + `posts/${postId}/comments`,
      { content },
      this.authHeaders()
    );
  }

  getComments(postId: number) {
    return this.http.get<any[]>(
      this.apiUrl + `posts/${postId}/comments`,
      this.authHeaders()
    );
  }

  getPendingFriendRequests() {
    return this.http.get<any>(this.apiUrl + `friendships/pending`, this.authHeaders());
  }

  acceptFriendship(friendshipId: number) {
    return this.http.post(this.apiUrl + `friendships/${friendshipId}/accept`, {}, this.authHeaders());
  }

  getMe() {
    return this.http.get<any>(this.apiUrl + 'me', this.authHeaders());
  }

  uploadAvatar(file: File) {
    const fd = new FormData();
    fd.append('avatar', file);
    return this.http.post<any>(this.apiUrl + 'profile/avatar', fd, this.authHeaders());
  }

  getProfile(username: string) {
    return this.http.get<any>(this.apiUrl + `profiles/${username}`, this.authHeaders());
  }

  updateProfile(data: { bio?: string; website?: string }) {
    return this.http.put<any>(this.apiUrl + 'profile', data, this.authHeaders());
  }

  getStories() {
    return this.http.get<any[]>(this.apiUrl + 'stories', this.authHeaders());
  }

  createStory(file: File, caption: string) {
    const fd = new FormData();
    fd.append('media', file);
    if (caption) fd.append('caption', caption);
    return this.http.post<any>(this.apiUrl + 'stories', fd, this.authHeaders());
  }

  deleteStory(id: number) {
    return this.http.delete(this.apiUrl + `stories/${id}`, this.authHeaders());
  }

  searchUsers(username: string) {
    return this.http.get<any[]>(this.apiUrl + 'users/search?username=' + username, this.authHeaders());
  }

  sendFriendByUsername(username: string) {
    return this.http.post(this.apiUrl + 'users/username/' + username + '/friend', {}, this.authHeaders());
  }

  getUserById(id: number) {
    return this.http.get<any>(this.apiUrl + `users/${id}`, this.authHeaders());
  }

  getConversations() {
    return this.http.get<any[]>(this.apiUrl + 'conversations', this.authHeaders());
  }

  getMessages(userId: number) {
    return this.http.get<any>(this.apiUrl + `messages/${userId}`, this.authHeaders());
  }

  sendMessage(userId: number, body: string) {
    return this.http.post<any>(this.apiUrl + `messages/${userId}`, { body }, this.authHeaders());
  }

  getNotifications() {
    return this.http.get<any[]>(this.apiUrl + 'notifications', this.authHeaders());
  }

  getExplorePosts(page = 1) {
    return this.http.get<any>(this.apiUrl + `posts/explore?page=${page}`, this.authHeaders());
  }

  updatePost(postId: number, file: File | null, caption: string) {
    const fd = new FormData();
    if (file) fd.append('image', file);
    fd.append('caption', caption);
    return this.http.post<any>(this.apiUrl + `posts/${postId}`, fd, this.authHeaders());
  }

}