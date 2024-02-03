// Import necessary modules and libraries
import { Component, OnInit, ViewChild, ElementRef, NgZone, AfterViewInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { WebcamImage, WebcamInitError, WebcamUtil } from 'ngx-webcam';
import { Subject } from 'rxjs';
import { saveAs } from 'file-saver';





declare var cv: any;



@Component({
  selector: 'app-camera-capture',
  templateUrl: './camera-capture.component.html',
  styleUrls: ['./camera-capture.component.scss']
})
export class CameraCaptureComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('webcamVideoElement') webcamVideoElement!: ElementRef;
  @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>;
  @ViewChild('processedCanvas') processedCanvas!: ElementRef<HTMLCanvasElement>;
  handleInitError($event: WebcamInitError) {
    console.error('Error initializing webcam:', $event);
  }
  public processedImage: string | null = null;
  
  public webcamWidth = 640;
  public webcamHeight = 380;
  public triggerObservable = new Subject<void>();
  public webcamImage?: WebcamImage;
  public capturedImage?: WebcamImage;
  public feedbackMessage: string | null = null;
  previewImage: string = '';
  private isBrowser: boolean;
  private captureInterval: any;
  public processedImageData?: ImageData;
  @ViewChild('canvasresult') canvasresult!: ElementRef;
  // @ViewChild('cannyCanvas') cannyCanvas!: ElementRef;
  @ViewChild('cannyCanvas1') cannyCanvas1!: ElementRef;
  @ViewChild('cannyCanvas2') cannyCanvas2!: ElementRef;
  constructor(private zone: NgZone, private router: Router) {
    this.isBrowser = typeof window !== 'undefined';
  }

  async ngAfterViewInit(): Promise<void> {
    try {
      this.initializeWebcam();
      this.captureInterval = setInterval(() => this.capture(), 9000);
     
    } catch (error) {
      console.error('Error during initialization:', error);
    }
  }
  private async initializeWebcam(): Promise<void> {
    try {
      const mediaDevices: MediaDeviceInfo[] = await WebcamUtil.getAvailableVideoInputs();
      if (mediaDevices.length > 0) {
        const selectedDevice = mediaDevices[0];
        try {
          const stream: MediaStream = await navigator.mediaDevices.getUserMedia({
            audio: false,
            video: { deviceId: { exact: selectedDevice.deviceId } },
          });
          this.webcamVideoElement.nativeElement.srcObject = stream;
          this.feedbackMessage = 'Camera is ready. Please position it properly.';
        } catch (error) {
          console.error('Error accessing camera:', error);
          this.feedbackMessage = 'Error accessing the camera. Please try again or check camera permissions.';
        }
      } else {
        console.error('No available video input devices.');
        this.feedbackMessage = 'No video input devices found.';
      }
    } catch (error) {
      console.error('Error initializing webcam:', error);
      this.feedbackMessage = 'Error initializing the webcam. Please try again.';
    }
  }
ngOnInit(): void {
    if (!this.isBrowser) {
      this.feedbackMessage = 'Webcam initialization is not supported in this environment.';
    }
  }
capture(): void {
    this.triggerObservable.next();
  }
captureImage(webcamImage: WebcamImage): void {
    
      if (!this.capturedImage) {
        this.capturedImage = webcamImage;
        this.feedbackMessage = 'Image captured successfully.';
        this.displayImageInComponent(webcamImage); 
        this. processImagewithopencv(this.capturedImage.imageAsDataUrl);
      
    }
  }
private displayImageInComponent(image: WebcamImage): void {
    const capturedImageElement: HTMLImageElement | null = document.querySelector('#capturedImage');
    if (capturedImageElement) {
      capturedImageElement.src = image.imageAsDataUrl;
      this.previewImage = image.imageAsDataUrl;
    } else {
      console.error('Captured image element not found.');
    }
  }

  processImagewithopencv(imagedata: string) {
    // const omrsheet_rectangle_ratios_area: number[] = [3.45, 81];
    const shadingPoints: { x: number, y: number }[] = [];
  
    const img = new Image();
    img.src = imagedata;
  
    // Create a promise to wait for the image to load
    const imageLoadPromise = new Promise<void>((resolve) => {
        img.onload = () => {
            resolve();
        };
    });
  
    // Wait for the image to load before proceeding
    imageLoadPromise.then(async () => {
        const canvas = this.canvasresult.nativeElement;
        const ctx = canvas.getContext('2d');
        canvas.width = img.width;
        canvas.height = img.height;
        ctx.drawImage(img, 0, 0, img.width, img.height);
  
        console.log('Image is loaded here for canny', img.width, img.height);
  
        const src = cv.imread(canvas);
        console.log('Image matrix (before Canny):', src);
  
        const dst = new cv.Mat();
  
        // Convert to grayscale for Canny edge detection
        cv.cvtColor(src, src, cv.COLOR_RGBA2GRAY, 0);
  
        // Adjust Canny parameters for better accuracy
        cv.Canny(src, dst,150, 300, 3, false);
  
        console.log('Canny result matrix:', dst);
        // const rectanglePoints = this.detectAnswerGrid(dst, omrsheet_rectangle_ratios_area);
        // this.drawRectangle(ctx, rectanglePoints, 'red', 2);
        const contours = new cv.MatVector();
        const hierarchy = new cv.Mat();
  
        // Find contours in the Canny result
        // cv.findContours(dst, contours, hierarchy, cv.RETR_EXTERNAL, cv.CHAIN_APPROX_SIMPLE);
      cv.findContours(dst, contours, hierarchy, cv.RETR_LIST, cv.CHAIN_APPROX_TC89_KCOS);
        // Process contours in batches to reduce DOM manipulations
        for (let i = 0; i < contours.size(); ++i) {
            const contour = contours.get(i);
            const area = cv.contourArea(contour);
  
            if (area > 54 && area < 2000) {
                await this.processContour(ctx, contour, area, shadingPoints);
            }
  
            // Clean up
            contour.delete();
        }
  
        // Clean up
        contours.delete();
        hierarchy.delete();
        shadingPoints.sort((a, b) => a.x - b.x);
        // Display shading points coordinates in the console
        console.log('Shading Points:', shadingPoints);
        this.findClusters(shadingPoints);

      
  
        // Cleaning up allocated memory
        src.delete();
        dst.delete();
    });
  }
  detectAnswerGrid(src: any, ratios: number[]): number[][] {
    // Placeholder, replace with your actual answer grid detection logic
    const rectanglePoints: number[][] = [
      [100, 100],
      [500, 100],
      [500, 500],
      [100, 500]
    ];

    return rectanglePoints;
  }

  drawRectangle(ctx: CanvasRenderingContext2D, points: number[][], color: string, lineWidth: number) {
    ctx.beginPath();
    ctx.moveTo(points[0][0], points[0][1]);
    for (let i = 1; i < points.length; i++) {
      ctx.lineTo(points[i][0], points[i][1]);
    }
    ctx.closePath();
    ctx.lineWidth = lineWidth;
    ctx.strokeStyle = color;
    ctx.stroke();
  }
  
  async processContour(ctx: CanvasRenderingContext2D, contour: any, area: number, shadingPoints: { x: number, y: number }[]) {
    // Draw a rectangle around the potential bubble
    // const rect = cv.boundingRect(contour);
    // ctx.beginPath();
    // ctx.rect(rect.x, rect.y, rect.width, rect.height);
    // ctx.lineWidth = 2;
    // ctx.strokeStyle = 'green';
    // ctx.stroke();
  
    // Identify and mark the shaded bubble based on centroid or other criteria
    const moment = cv.moments(contour);
    const cx =Math.round( moment.m10 / moment.m00);
    const cy =Math.round( moment.m01 / moment.m00);
  
 
 const isDuplicate = shadingPoints.some(point => point.x === cx && point.y === cy);


 if (!isDuplicate) {
     shadingPoints.push({ x: cx, y: cy });
     
 }
  
    // Draw a circle to mark the shaded bubble
    ctx.beginPath();
    ctx.arc(cx, cy, 5, 0, 3 * Math.PI, false);
    if(cx<100){
      ctx.fillStyle = 'blue';
    ctx.strokeStyle = 'blue';
    }else if(cy<100){
      ctx.fillStyle = 'green';
      ctx.strokeStyle = 'green';
    }else{
      ctx.fillStyle = 'red';
      ctx.strokeStyle = 'red';
    }
    
    ctx.fill();
    ctx.lineWidth = 1;
    ctx.stroke();
  }
 // This method performs K-means clustering on the given points
 findClusters(shadingPoints: { x: number, y: number }[]) {
  if (!shadingPoints.length) {
    console.error('No shading points to cluster.');
    return;
  }

  // Separate x and y coordinates
  const xCoords = shadingPoints.map(p => p.x);
  const yCoords = shadingPoints.map(p => p.y);

  // Convert to cv.Mat
  let xMat = cv.matFromArray(xCoords.length, 1, cv.CV_32F, xCoords);
  let yMat = cv.matFromArray(yCoords.length, 1, cv.CV_32F, yCoords);

  // Number of clusters for rows and columns
  const numColumns = 12;
  const numRows = 17;

  // Labels and centers
  let labelsX = new cv.Mat();
  let centersX = new cv.Mat();
  let labelsY = new cv.Mat();
  let centersY = new cv.Mat();

  // Criteria`
  let criteria = new cv.TermCriteria(cv.TermCriteria_EPS + cv.TermCriteria_MAX_ITER, 100, 1.0);

  // Apply K-means for x-coordinates (columns)
  cv.kmeans(xMat, numColumns, labelsX, criteria, 1, cv.KMEANS_RANDOM_CENTERS, centersX);

  // Apply K-means for y-coordinates (rows)
  cv.kmeans(yMat, numRows, labelsY, criteria, 1, cv.KMEANS_RANDOM_CENTERS, centersY);

  // Process results for X and Y separately
  let columnCenters = [];
for (let i = 0; i < centersX.rows; ++i) {
  columnCenters.push(centersX.data32F[i]);
}
columnCenters.sort((a, b) => a - b); // Sort in ascending order

// Log the sorted cluster centers for columns (X)
console.log('Sorted Cluster Centers for Columns (X):');
columnCenters.forEach((center, index) => {
  console.log(`Column ${index}: ${center}`);
});

  console.log('Cluster Centers for Rows (Y):');
  for (let i = 0; i < centersY.rows; ++i) {
    console.log(`Row ${i}: ${centersY.data32F[i]}`);
  }
  this.calculateAndPrintDistances(shadingPoints, columnCenters, centersY);

  // Clean up memory
  xMat.delete();
  yMat.delete();
  labelsX.delete();
  centersX.delete();
  labelsY.delete();
  centersY.delete();
}
calculateAndPrintDistances(shadingPoints: { x: number, y: number }[], columnCenters: number[], centersY: number[]) {
  const distances: { 
      shadingPoint: { x: number, y: number },
      nearestColumnCenter: number,
      nearestRowCenter: number,
      columnDistance: number,
      rowDistance: number 
  }[] = [];

  // Calculate distances for each shading point
  shadingPoints.forEach(shadingPoint => {
    // min_distance = 1000000000
    // clusterRows.forEach(row => {
      // clusterColumns.forEach(column => {
        // distance = sqrt((row - shadingPoint.y)^2 + (column - shadingPoint.x)^2)
        // if distance < min_distance
          // min_distance = distance
          // nearestRowCenter = row
          // nearestColumnCenter = column
        // )
      const nearestColumnCenter = this.findNearestCenter(shadingPoint.x, columnCenters);
      const nearestRowCenter = this.findNearestCenter(shadingPoint.y, centersY);

      const columnDistance = this.calculateEuclideanDistance({ x: nearestColumnCenter, y: shadingPoint.y }, shadingPoint);
      const rowDistance = this.calculateEuclideanDistance({ x: shadingPoint.x, y: nearestRowCenter }, shadingPoint);

      distances.push({ shadingPoint, nearestColumnCenter, nearestRowCenter, columnDistance, rowDistance });
  });

  // Print distances
  distances.forEach(d => {
      console.log(`Shading Point (${d.shadingPoint.x}, ${d.shadingPoint.y}): ` +
                  `Nearest Column Center = ${d.nearestColumnCenter}, Distance = ${d.columnDistance.toFixed(2)}; ` +
                  `Nearest Row Center = ${d.nearestRowCenter}, Distance = ${d.rowDistance.toFixed(2)}`);
  });
}

findNearestCenter(pointCoord: number, centers: number[]): number {
  // Check if centers is an array and not empty
  if (Array.isArray(centers) && centers.length > 0) {
    // Find the nearest center to the given point coordinate
    return centers.reduce((prev, curr) => (
      Math.abs(curr - pointCoord) < Math.abs(prev - pointCoord) ? curr : prev
    ));
  } else {
    // Handle the case where centers is not a valid array
    console.error('Invalid or empty array for centers.');
    return 0; // or any default value that makes sense in your context
  }
}


calculateEuclideanDistance(point1: { x: number, y: number }, point2: { x: number, y: number }): number {
  // Calculate Euclidean distance between two points
  return Math.sqrt(Math.pow(point2.x - point1.x, 2) + Math.pow(point2.y - point1.y, 2));
}

  retake(): void {
    this.capturedImage = undefined;
    this.feedbackMessage = null;
  }

  async save(): Promise<void> {
    if (this.capturedImage) {
      try {
        const folderPath = 'C:\\Users\\HP\\Downloads\\omrproject\\omr-processing-app\\omr_sheets_of_students';
        const fileName = `captured_image_${Date.now()}.jpg`;
        const fullPath = `${folderPath}\\${fileName}`;

        const blob = await fetch(this.capturedImage.imageAsDataUrl).then((r) => r.blob());
        saveAs(blob, fullPath);
        // this.imageTransferService.sendCapturedImage(this.capturedImage);
        this.feedbackMessage = 'Image saved successfully.';
      } catch (error) {
        console.error('Error saving image:', error);
        this.feedbackMessage = 'Error saving image. Please check file system access permissions or ensure the provided path is correct.';
      }
    } else {
      this.feedbackMessage = 'Unable to save image. Please capture an image first.';
    }
  }


  ngOnDestroy(): void {
    clearInterval(this.captureInterval);
    this.cleanupWebcam();
  }
  private cleanupWebcam(): void {
    if (this.webcamVideoElement && this.webcamVideoElement.nativeElement.srcObject) {
      const stream = this.webcamVideoElement.nativeElement.srcObject as MediaStream;
      const tracks = stream.getTracks();

      tracks.forEach(track => {
        track.stop();
      });

      this.webcamVideoElement.nativeElement.srcObject = null;
    }
  }

  goBackToTeacherInterface(): void {
    // Shut down the camera when navigating away
    clearInterval(this.captureInterval);
  
    // Close the webcam stream
    if (this.webcamVideoElement && this.webcamVideoElement.nativeElement.srcObject) {
      const stream = this.webcamVideoElement.nativeElement.srcObject as MediaStream;
      const tracks = stream.getTracks();
  
      tracks.forEach(track => {
        track.stop();
      });
  
      this.webcamVideoElement.nativeElement.srcObject = null;
    }
  
    this.router.navigate(['/teacher']);
  }
}