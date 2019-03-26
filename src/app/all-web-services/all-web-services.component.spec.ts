import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AllWebServicesComponent } from './all-web-services.component';

describe('AllWebServicesComponent', () => {
  let component: AllWebServicesComponent;
  let fixture: ComponentFixture<AllWebServicesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AllWebServicesComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AllWebServicesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
