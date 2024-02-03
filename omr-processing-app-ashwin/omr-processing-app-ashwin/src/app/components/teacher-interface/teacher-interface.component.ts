// teacher-interface.component.ts

import { Component, ElementRef, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';

import { Router } from '@angular/router';


@Component({
  selector: 'app-teacher-interface',
  templateUrl: './teacher-interface.component.html',
  styleUrls: ['./teacher-interface.component.scss']
})
export class TeacherInterfaceComponent {


  capturedImage: string|undefined="";
  processedData: any;
  isBrowser: boolean = false;
  

  constructor(
    
    public dialog: MatDialog,
    private router: Router,
    
  ) {
    // this.isBrowser = typeof window !== 'undefined';
   
    
  }



  // processCapturedImage(): void {
  //   if (this.capturedImage && !this.processingInProgress) {
  //     this.processingInProgress = true;
  //     this.omrProcessingService.processImage(this.capturedImage).subscribe(
  //       (result: any) => {
  //         this.processedData = result;
  //         this.processingInProgress = false;
  //         this.resultDisplayService.displayResults(this.processedData);
  //       },
  //       (error: any) => {
  //         console.error('Error processing image:', error);
  //         this.processingInProgress = false;
  //         alert('Error processing image. Please try again.'); // Display error message
  //       }
  //     );
  //   }
  // }
}
