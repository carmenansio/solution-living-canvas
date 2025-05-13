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

import {
  Component,
  Input,
  OnInit,
  OnDestroy,
  Output,
  EventEmitter,
} from '@angular/core';
import { CommonModule } from '@angular/common';

type LevelState = {
  type: 'level' | 'sandbox' | 'complete' | 'gameOver' | 'stageSpace';
  number?: string;
  name: string;
  hint: string;
};

@Component({
  selector: 'app-popup',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="popup" [class.fade-out]="isFadingOut">
      <div class="popup-content">
        <h2 *ngIf="levelState.type === 'level'">
          Level {{ levelState.number }}
        </h2>
        <h3>{{ levelState.name }}</h3>
        <p>{{ levelState.hint }}</p>
      </div>
    </div>
  `,
  styles: [
    `
      .popup {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        display: flex;
        justify-content: center;
        align-items: center;
        background-color: rgba(0, 0, 0, 0.6);
        backdrop-filter: blur(16px);
        z-index: 100;
        opacity: 0;
        animation: fadeIn 150ms ease-in forwards;
      }
      .popup.fade-out {
        animation: fadeOut 150ms ease-out forwards;
      }
      @keyframes fadeIn {
        from {
          opacity: 0;
        }
        to {
          opacity: 1;
        }
      }
      @keyframes fadeOut {
        from {
          opacity: 1;
        }
        to {
          opacity: 0;
        }
      }
      .popup-content {
        color: #e2e2e5;
        background-color: #1e1e1e99;
        padding: 32px 24px 40px 24px;
        border-radius: 24px;
        text-align: center;
        max-width: 500px;
        width: calc(100% - 20px);
        margin: 0 10px;
      }
      .popup-content h2 {
        font-size: 16px;
        font-weight: 400;
        padding: 8px 18px;
        border-radius: 24px;
        border: 1px solid #393939;
        width: fit-content;
        margin: 0 auto 32px auto;
      }
      .popup-content h3 {
        font-size: 44px;
        font-weight: 400;
        margin: 0 auto 40px auto;
      }
      .popup-content p {
        font-size: 18px;
        margin: 0;
      }
    `,
  ],
})
export class PopupComponent implements OnInit, OnDestroy {
  @Input() levelState: LevelState = {
    type: 'level',
    number: '',
    name: '',
    hint: '',
  };
  @Output() fadeOutComplete = new EventEmitter<void>();
  isFadingOut: boolean = false;
  private timeoutId: any;

  ngOnInit() {
    this.isFadingOut = false;
    this.timeoutId = setTimeout(() => {
      this.isFadingOut = true;
      // Emit event after fade-out animation completes
      setTimeout(() => {
        this.fadeOutComplete.emit();
      }, 150);
    }, 2500);
  }

  ngOnDestroy() {
    if (this.timeoutId) {
      clearTimeout(this.timeoutId);
    }
  }
}
