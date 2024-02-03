// results-display.component.ts

import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-results-display',
  templateUrl: './results-display.component.html',
  styleUrls: ['./results-display.component.scss']
})
export class ResultsDisplayComponent {
  @Input() processedData: any;

  
  errorRowClass = 'error-row';

  constructor() {}
}
