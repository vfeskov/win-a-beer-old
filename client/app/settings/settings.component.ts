import { Component, ChangeDetectionStrategy, OnInit } from '@angular/core';
import { ContextService, HasDeadStream } from 'app/common';
import { FormGroup, FormBuilder, FormControl, Validators } from '@angular/forms';

@Component({
  selector: 'wab-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SettingsComponent extends HasDeadStream implements OnInit {
  enabled: any = {};
  forms: {[name: string]: FormGroup};
  email: string;
  api: string;

  constructor(public context: ContextService, private fb: FormBuilder) {
    super();
  }

  ngOnInit() {
    this.forms = {
      email: this.fb.group({
        email: ['', [Validators.required, Validators.email]]
      }),
      api: this.fb.group({
        api: ['', [Validators.required, Validators.pattern(/https?:\/\//)]]
      })
    };
    this.context.settings$
      .takeUntil(this.dead$)
      .subscribe(settings => {
        ['email', 'api'].forEach(name => {
          this.enabled[name] = !!settings[name];
          this.forms[name].reset();
          this.forms[name].get(name).setValue(settings[name]);
          this[name] = settings[name];
        })
      });
  }

  toggle(name, {checked}) {
    if (!checked) {
      this.context.updateSetting(name, null);
    }
    this.enabled[name] = checked;
  }

  reset(name) {
    this.forms[name].reset();
    this.forms[name].get(name).setValue(this[name]);
  }

  update(name) {
    if (!this.forms[name].valid) { return; }
    this.context.updateSetting(name, this.forms[name].get(name).value);
  }
}
