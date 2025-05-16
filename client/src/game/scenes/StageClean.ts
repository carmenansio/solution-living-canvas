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

import { LivingCanvasStage } from "../LivingCanvas.ts";

export class StageClean extends LivingCanvasStage {
	constructor() {
		super("StageClean");
	}

	preload() {
		const visualStyle = this.gameSettings?.visualStyle || 'realistic';
		this.worldConfig.bgImage = `assets/generated/${visualStyle}/io_sandbox.png`;
		this.load.image('sandbox', 'assets/puzzle_masks/sandbox.png');
		super.preload();
	}

	create() {
		this.worldConfig.name = "";
		this.worldConfig.gameMode = "demo";
		this.worldConfig.gravity.y = 9.8;
		this.worldConfig.frictionAir = 0.01;
		this.worldConfig.bgcolor = 0x05aae7;
		this.worldConfig.isVoidSpace = false;
		this.fireConfig = {
			speed: { min: 200, max: 300 },
			scale: { start: 0.8, end: 0 },
			blendMode: "MULTIPLY",
			frequency: 200,
			lifespan: 500,
			alpha: { start: 1, end: 0 },
		};
		this.worldConfig.next = "IOPuzzle_Fire";

		super.create();

		this.matter.add.rectangle(
			this.worldConfig.size.width / 2,
			this.worldConfig.size.height - 20,
			this.worldConfig.size.width,
			166,
			{ isStatic: true }
		);
		this.matter.add.rectangle(
			this.worldConfig.size.width / 2,
			this.worldConfig.size.height - 300,
			386,
			75,
			{ isStatic: true }
		);

		this.water = this.add.water({
			w: this.worldConfig.size.width,
			h: this.worldConfig.size.height,
			depth: 300,
		});

		this.registerCollision(this.water);
	}

	stageSetupDefaultObjects() {}
}
