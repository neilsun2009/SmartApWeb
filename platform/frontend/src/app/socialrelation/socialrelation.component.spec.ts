import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SocialrelationComponent } from './socialrelation.component';

describe('SocialrelationComponent', () => {
  let component: SocialrelationComponent;
  let fixture: ComponentFixture<SocialrelationComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SocialrelationComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SocialrelationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
