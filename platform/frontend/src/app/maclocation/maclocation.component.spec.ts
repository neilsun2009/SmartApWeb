import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MaclocationComponent } from './maclocation.component';

describe('MaclocationComponent', () => {
  let component: MaclocationComponent;
  let fixture: ComponentFixture<MaclocationComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MaclocationComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MaclocationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
