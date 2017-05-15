import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { ContextService, HasDeadStream } from 'app/common';
import { Observable as $ } from 'rxjs/Observable';
import { Subject } from 'rxjs/Subject'
import { FormControl, FormGroup, FormBuilder, Validators, ValidationErrors } from '@angular/forms';
const { keys } = Object;

@Component({
  selector: 'wab-auth',
  templateUrl: './auth.component.html',
  styleUrls: ['./auth.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AuthComponent extends HasDeadStream implements OnInit {
  ACTION_LOGIN = false;
  ACTION_REGISTER = true;
  form: FormGroup;
  errors: any;
  data: any;

  constructor(public context: ContextService, private fb: FormBuilder) {
    super();
  }

  ngOnInit(): void {
    this.form = this.fb.group({
      'login':                ['', [Validators.required]],
      'password':             ['', [Validators.required]],
      'passwordConfirmation': ['', [Validators.required]],
      'action':               [this.ACTION_LOGIN]
    });
    this.form.valueChanges
      .takeUntil(this.dead$)
      .subscribe(data => this.onValueChanged(data));
    this.onValueChanged({});
  }

  onValueChanged(data) {
    const confControl = this.form.get('passwordConfirmation');
    confControl.setValidators(data.action === this.ACTION_REGISTER ? [Validators.required] : []);
    confControl.updateValueAndValidity({emitEvent: false});
    this.data = data;
    this.errors = ['login', 'password', 'passwordConfirmation']
      .reduce((result, name) => {
        result[name] = this.form.get(name).errors || {}
        return result;
      }, {});
  }

  submit() {
    if (!this.form.valid) { return; }
    const {login, password, passwordConfirmation} = this.data;
    if (this.data.action === this.ACTION_REGISTER) {
      return this.context.register(login, password, passwordConfirmation);
    }
    this.context.login(login, password);
  }
}
