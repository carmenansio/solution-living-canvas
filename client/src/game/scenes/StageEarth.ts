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

import { LivingCanvasStage } from '../LivingCanvas.ts';

export class StageEarth extends LivingCanvasStage {
	constructor() {
		super('StageEarth');
	}

	create() {
		this.worldConfig.name = 'Earth';
		this.worldConfig.gravity.y = 9.8;
		this.worldConfig.frictionAir = 0.01;
		this.worldConfig.bgcolor = 0x448844;
		this.worldConfig.isVoidSpace = false;
		this.fireConfig = {
			angle: { min: -100, max: -80 },
			speed: { min: 200, max: 300 },
			scale: { start: 0.5, end: 0 },
		};
		this.worldConfig.next = 'StageEarth2';

		super.create();
	}
}
