declare module 'opencv.js' {
  export const cv: {
      imread(src: any): any;
      cvtColor(src: any, dst: any, code: any, dstCn?: any): void;
      GaussianBlur(src: any, dst: any, ksize: any, sigmaX: any, sigmaY?: any, borderType?: any): void;
      Canny(src: any, edges: any, threshold1: any, threshold2: any, apertureSize?: any, L2gradient?: boolean): void;
      // Add other function declarations as needed
  };
}
