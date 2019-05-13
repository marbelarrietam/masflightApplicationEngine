import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DialogErrorLogComponent } from './dialog-error-log.component';

describe('DialogErrorLogComponent', () => {
  let component: DialogErrorLogComponent;
  let fixture: ComponentFixture<DialogErrorLogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DialogErrorLogComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DialogErrorLogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
