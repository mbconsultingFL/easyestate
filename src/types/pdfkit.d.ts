declare module 'pdfkit' {
  export default class PDFDocument {
    constructor(options?: any)
    on(event: string, callback: (...args: any[]) => void): this
    fontSize(size: number): this
    font(name: string): this
    text(text: string, options?: any): this
    text(text: string, x?: number, y?: number, options?: any): this
    moveDown(lines?: number): this
    end(): void
    pipe(dest: any): any
    addPage(options?: any): this
    y: number
    x: number
    page: { width: number; height: number }
  }
}
