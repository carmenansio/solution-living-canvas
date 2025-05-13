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
  EventEmitter,
  Input,
  Output,
  HostListener,
  SimpleChanges,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-dialog',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div
      class="dialog-overlay"
      *ngIf="isVisible"
      (click)="close()"
      [class.closing]="isClosing"
    >
      <div class="dialog" (click)="$event.stopPropagation()">
        <div class="dialog-header">
          <h2>{{ title }}</h2>
          <button
            class="close-button"
            (click)="close()"
            aria-label="Close dialog"
          >
            ✕
          </button>
        </div>
        <div class="dialog-content">
          <ng-content></ng-content>
        </div>
        <button
          *ngFor="let action of actions"
          [class]="action.class"
          (click)="handleAction(action)"
        >
          {{ action.label }}
        </button>
      </div>
    </div>
  `,
  styles: [
    `
      .dialog-overlay {
        position: fixed;
        inset: 0;
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 1000;
        background-color: rgba(0, 0, 0, 0.6);
        backdrop-filter: blur(16px);
        opacity: 0;
        animation: fadeIn 150ms ease-out forwards;

        &.closing {
          animation: fadeOut 150ms ease-in forwards;
        }
      }

      .dialog {
        color: #e2e2e5;
        background-color: #1e1e1e99;
        line-height: 1.5;
        padding: 24px;
        border-radius: 24px;
        max-width: 500px;
        width: calc(100% - 20px);
        margin: 0 10px;
        max-height: 80vh;
        overflow-y: auto;

        .dialog-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 15px;

          h2 {
            color: #e2e2e5;
            margin: 0;
            font-size: 20px;
            font-weight: 400;
          }
        }

        .close-button {
          background: none;
          border: none;
          font-size: 20px;
          cursor: pointer;
          padding: 5px;
          color: #e2e2e5;
          opacity: 0.8;
          transition: opacity 0.2s ease;
          outline: none;
          font-weight: 400;

          &:hover {
            opacity: 1;
          }
        }

        .command-input-container {
          display: flex;
          gap: 5px;
          white-space: nowrap;
          margin-top: 10px;
        }

        .command-input-container button {
          width: 100%;
          font-size: 14px;
          margin: 0;
          padding: 8px 16px;
          background-color: #8ea8f9;
          backdrop-filter: blur(12px);
          color: #1e1e1e;
          border: none;
          border-radius: 24px;
          cursor: pointer;
          transition: all 0.2s ease;

          &:hover {
            background-color: #7b95e6;
          }

          &:disabled {
            background-color: #e2e2e520;
            color: #e2e2e580;
            cursor: not-allowed;
          }
        }
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
    `,
  ],
})
export class DialogComponent {
  @Input() title: string = '';
  @Input() isVisible: boolean = false;
  @Input() actions: { label: string; class?: string; handler?: () => void }[] =
    [];
  @Input() focusElementId: string = '';
  @Output() closeDialog = new EventEmitter<void>();
  isClosing: boolean = false;

  @HostListener('document:keydown.escape', ['$event'])
  onKeydownHandler() {
    if (this.isVisible) {
      if (document.activeElement instanceof HTMLElement) {
        document.activeElement.blur();
      }
      this.close();
    }
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['isVisible']?.currentValue === true && this.focusElementId) {
      setTimeout(() => {
        const element = document.getElementById(this.focusElementId);
        if (element) {
          element.focus();
        }
      });
    }
  }

  close() {
    this.isClosing = true;
    setTimeout(() => {
      this.closeDialog.emit();
      this.isClosing = false;
    }, 150);
  }

  handleAction(action: {
    label: string;
    class?: string;
    handler?: () => void;
  }) {
    if (action.handler) {
      action.handler();
    }
  }
}
