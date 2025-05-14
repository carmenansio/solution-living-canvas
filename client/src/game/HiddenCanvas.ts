// @ts-nocheck
/**
 * Copyright 2025 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

export class HiddenCanvas {
  MARGIN = 25;
  CANVAS_SIZE = 250;
  canvas: HTMLCanvasElement;
  ctx: CanvasRenderingContext2D | null;
  boundingBox: Phaser.Geom.Rectangle;
  finishTimer: integer;
  canvasEmpty: boolean = true;

  constructor() {
    this.canvas = document.createElement('canvas');
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;

    this.ctx = this.canvas.getContext('2d');

    window.addEventListener('resize', () => {
      this.resizeCanvas();
    });

    if (this.ctx) {
      this.ctx.fillStyle = '#000';
    }

    this.boundingBox = new Phaser.Geom.Rectangle(0, 0, 0, 0);
  }

  resizeCanvas() {}

  clearCanvas() {
    if (this.ctx) {
      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
      this.boundingBox = new Phaser.Geom.Rectangle(0, 0, 0, 0);
      this.canvasEmpty = true;
    }
  }

  extractCanvas() {
    const base64ImageData = this.getBase64Data();
    this.clearCanvas();

    return base64ImageData;
  }

  checkBoundingBox(x: number, y: number) {
    if (x < this.boundingBox.left) {
      this.boundingBox.left = x;
    }

    if (x > this.boundingBox.right) {
      this.boundingBox.right = x;
    }

    if (y < this.boundingBox.top) {
      this.boundingBox.top = y;
    }

    if (y > this.boundingBox.bottom) {
      this.boundingBox.bottom = y;
    }
  }

  drawCircle(x: number, y: number, radius: number) {
    if (this.ctx) {
      this.ctx?.beginPath();
      this.ctx?.arc(x, y, radius, 0, 2 * Math.PI);
      this.ctx?.fill();
    }
  }

  pointerDown(x: number, y: number) {
    if (this.ctx) {
      this.drawCircle(x, y, 1.5);

      if (this.canvasEmpty) {
        this.boundingBox.left = x;
        this.boundingBox.top = y;
      }

      this.checkBoundingBox(x, y);

      this.canvasEmpty = false;
    }
  }

  pointerUp(x: number, y: number) {
    this.drawCircle(x, y, 1.5);
    this.checkBoundingBox(x, y);
  }

  drawLine(x1: integer, y1: integer, x2: integer, y2: integer) {
    this.drawCircle(x1, y1, 1.5);

    if (this.ctx) {
      this.ctx.beginPath();
      this.ctx.lineWidth = 5;

      this.ctx.moveTo(x1, y1);
      this.ctx.lineTo(x2, y2);
      this.ctx.stroke();
    }
  }

  pointerMove(x: number, y: number) {
    this.checkBoundingBox(x, y);
  }

  getCenter() {
    return {
      x: this.boundingBox.centerX,
      y: this.boundingBox.centerY,
    };
  }

  // [START get_base64_data]
  getBase64Data() {
    let tempCanvas = document.createElement('canvas');

    tempCanvas.width = this.CANVAS_SIZE / 2;
    tempCanvas.height = this.CANVAS_SIZE / 2;

    let tempCtx = tempCanvas.getContext('2d');

    if (tempCtx) {
      tempCtx.rect(0, 0, tempCanvas.width, tempCanvas.height);
      tempCtx.fillStyle = 'white';
      tempCtx.fill();

      tempCtx.drawImage(
        this.canvas,
        -this.MARGIN,
        -this.MARGIN,
        this.CANVAS_SIZE,
        this.CANVAS_SIZE,
        0,
        0,
        this.CANVAS_SIZE / 2,
        this.CANVAS_SIZE / 2
      );
    }

    return tempCanvas.toDataURL();
  }
  // [END get_base64_data]
}
