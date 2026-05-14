import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonContent, IonIcon } from '@ionic/angular/standalone';
import { FormsModule } from '@angular/forms';
import { addIcons } from 'ionicons';
import { eyeOutline, eyeOffOutline } from 'ionicons/icons';
import { Auth } from '../../services/auth';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
  standalone: true,
  imports: [IonContent, IonIcon, FormsModule, CommonModule]
})
export class LoginPage implements OnInit {

  email        = '';
  password     = '';
  showPassword = false;
  error        = '';
  loading      = false;

  constructor(private auth: Auth, private router: Router) {
    addIcons({ eyeOutline, eyeOffOutline });
  }

  // Fires on first load
  ngOnInit() { this.resetFields(); }

  // Fires every time the page becomes active (handles Ionic component caching)
  ionViewWillEnter() { this.resetFields(); }

  private resetFields() {
    this.email        = '';
    this.password     = '';
    this.showPassword = false;
    this.error        = '';
    this.loading      = false;
  }

  get canSubmit(): boolean {
    return this.email.trim().length > 0 && this.password.trim().length > 0 && !this.loading;
  }

  submit() {
    if (!this.canSubmit) return;
    this.error   = '';
    this.loading = true;
    this.auth.login(this.email.trim(), this.password).subscribe({
      next: res => {
        this.auth.setToken(res.token);
        this.auth.setUser(res.user);
        this.router.navigateByUrl('/tabs/feed', { replaceUrl: true });
      },
      error: () => {
        this.error   = 'Credenciales inválidas. Intenta de nuevo.';
        this.loading = false;
      }
    });
  }

  goRegister() {
    this.router.navigateByUrl('/register');
  }
}
