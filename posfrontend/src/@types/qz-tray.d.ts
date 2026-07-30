import "qz-tray";

declare module "qz-tray" {
  interface PrintData {
    type: "raw" | "pixel" | "pdf";
  }
}