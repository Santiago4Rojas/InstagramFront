import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonContent, IonIcon } from '@ionic/angular/standalone';
import { FormsModule } from '@angular/forms';
import { addIcons } from 'ionicons';
import { eyeOutline, eyeOffOutline } from 'ionicons/icons';
import { Auth } from '../../services/auth';
import { Router } from '@angular/router';

@Component({
  selector: 'app-register',
  templateUrl: './register.page.html',
  styleUrls: ['./register.page.scss'],
  standalone: true,
  imports: [IonContent, IonIcon, FormsModule, CommonModule]
})
export class RegisterPage implements OnInit {

  mobile       = '';
  name         = '';
  username     = '';
  password     = '';
  showPassword = false;
  error        = '';
  loading      = false;

  constructor(private auth: Auth, private router: Router) {
    addIcons({ eyeOutline, eyeOffOutline });
  }

  ngOnInit() { this.resetFields(); }

  ionViewWillEnter() { this.resetFields(); }

  private resetFields() {
    this.mobile       = '';
    this.name         = '';
    this.username     = '';
    this.password     = '';
    this.showPassword = false;
    this.error        = '';
    this.loading      = false;
  }

  get canSubmit(): boolean {
    return (
      this.name.trim().length > 0 &&
      this.username.trim().length > 0 &&
      this.mobile.trim().length > 0 &&
      this.password.trim().length > 0 &&
      !this.loading
    );
  }

  submit() {
    if (!this.canSubmit) return;
    this.error   = '';
    this.loading = true;
    this.auth.register({
      name:     this.name.trim(),
      email:    this.mobile.trim(),
      password: this.password,
      username: this.username.trim()
    }).subscribe({
      next: res => {
        this.auth.setToken(res.token);
        this.auth.setUser(res.user);
        this.router.navigateByUrl('/tabs/feed', { replaceUrl: true });
      },
      error: () => {
        this.error   = 'No se pudo crear la cuenta. Verifica los datos.';
        this.loading = false;
      }
    });
  }

  goLogin() {
    this.router.navigateByUrl('/login');
  }
}
