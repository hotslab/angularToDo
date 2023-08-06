import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';

import { HomeComponent } from './home.component';

describe('HomeComponent', () => {
  let component: HomeComponent;
  let fixture: ComponentFixture<HomeComponent>;

  beforeEach(async () => {
    TestBed.configureTestingModule({
      declarations: [HomeComponent]
    });
    fixture = TestBed.createComponent(HomeComponent);
    component = fixture.componentInstance;
    await fixture.whenStable()
    fixture.detectChanges()
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should show image and heading text', fakeAsync(() => {
    const bannerImage: HTMLImageElement = fixture.debugElement.nativeElement.querySelector('#banner-image')
    expect(bannerImage).toBeTruthy();
    const bannerText: HTMLHeadingElement = fixture.debugElement.nativeElement.querySelector('#banner-text')
    expect(bannerText).toBeTruthy()
    expect(bannerText.textContent).toEqual('THE CONTINENTAL TODO')
  }))
});
