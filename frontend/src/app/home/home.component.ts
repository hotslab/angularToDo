import { Component } from '@angular/core';

@Component({
  selector: 'app-home',
  template: `
  <div class="continental-image d-flex justify-content-center align-items-center m-0">
    <div class="text-center">
        <img 
          class="bg-black pt-3 pb-4 px-3 mb-3 rounded-pill shadow" 
          src="assets/images/continental.png" width="300" height="150" priority
        >
        <h2 class="text-light fw-bolder shadow">THE CONTINENTAL TODO</h2>
    </div>
  </div>
  `,
  styles: [`
  .continental-image
    height: 100vh
    background-image: url('../../assets/images/continental.jpg')
    background-size: 100%
    background-size: cover 
    background-position: center
    background-repeat: no-repeat 
  `]
})
export class HomeComponent {

}
