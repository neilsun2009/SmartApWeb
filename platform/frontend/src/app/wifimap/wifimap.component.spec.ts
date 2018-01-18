import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { WifimapComponent } from './wifimap.component';

describe('WifimapComponent', () => {
  let component: WifimapComponent;
  let fixture: ComponentFixture<WifimapComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ WifimapComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(WifimapComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
