import { Component } from '@angular/core';

@Component({
  selector: 'app-modal',
  template: `
  <div class="modal-backdrop-custom">
    <div class="modal fade show" tabindex="-1" style="display: block" aria-labelledby="staticBackdropLabel" aria-modal="true" role="dialog">
      <div class="modal-dialog modal-dialog-scrollable">
        <div class="modal-content">
          <ng-content></ng-content>
        </div>
      </div>
    </div>
  </div>
  `,
  styles: [`
  .modal-backdrop-custom
    color: black
    background: rgba(0, 0, 0, .9)
    position: fixed
    top: 0
    left: 0
    z-index: var(--bs-backdrop-zindex)
    width: 100vw
    height: 100vh
  `]
})

export class ModalComponent {

}
