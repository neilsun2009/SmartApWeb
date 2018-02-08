import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { RelatedusersComponent } from './relatedusers.component';

describe('RelatedusersComponent', () => {
  let component: RelatedusersComponent;
  let fixture: ComponentFixture<RelatedusersComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ RelatedusersComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RelatedusersComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
