import { Component, OnInit } from '@angular/core';
import { NgDateRangePickerOptions } from '../ng-daterangepicker';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html'
})
export class AppComponent {
  value: string;
  valueInline: string;
  options: NgDateRangePickerOptions;
  optionsInline: NgDateRangePickerOptions;

  ngOnInit() {
    let today = new Date();
    let nextWeek = new Date();
    nextWeek.setDate(today.getDate() + 7);

    this.options = { theme: 'default', range: 'tm' };
    this.optionsInline = {
      inline: true,
      dayNames: ['Lun', 'Mar', 'Mie', 'Jue', 'Vie', 'Sab', 'Dom'],
      monthNames: [
        "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio",
        "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
      ],
      showPredefinedRanges: false,
      sinceDate: today,
      untilDate: nextWeek
    };
  }
}
