import { Component } from '@angular/core';

@Component({
  selector: 'app-spinner',
  template: `
  <div class="spinner-backdrop d-flex justify-content-center align-items-center">
    <div class="spinner-grow text-danger" style="height: 200px; width: 200px;" role="status">
      <span class="visually-hidden">Loading...</span>
    </div>
  </div>
  `,
  styles: [`
  .spinner-backdrop
    color: black
    background: rgba(0, 0, 0, 1)
    position: fixed
    top: 0
    left: 0
    z-index: var(--bs-backdrop-zindex)
    width: 100vw
    height: 100vh
  `]
})
export class SpinnerComponent {

}
