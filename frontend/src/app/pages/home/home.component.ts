import { Component } from '@angular/core';

@Component({
  selector: 'app-home',
  template: `
  <div 
    class="continental-image d-flex justify-content-center align-items-center m-0"
    style="background-image: url('../../assets/images/continental.jpg');"
  >
    <div class="text-center">
        <img 
          class="mb-3 shadow-lg" 
          id="banner-image"
          src="../../assets/images/logo.png" width="250" height="250" priority
        >
        <h2 id="banner-text" class="text-light fw-bolder shadow-lg bg-dark px-4 py-3 rounded-pill">THE CONTINENTAL TODO</h2>
    </div>
  </div>
  `,
  styles: [`
  .continental-image
    height: 100vh
    background-size: 100%
    background-size: cover 
    background-position: center
    background-repeat: no-repeat 
  `]
})
export class HomeComponent {

}
