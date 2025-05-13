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

import { Boot } from './scenes/Boot';
import { StageEarth } from './scenes/StageEarth';
import { StageEarth2 } from './scenes/StageEarth2';
import { StageClean } from './scenes/StageClean';
import { StageSpace } from './scenes/StageSpace';
import { StageMoon } from './scenes/StageMoon';
import { MainMenu } from './scenes/MainMenu';
import { Preloader } from './scenes/Preloader';
import {
  StagePuzzle1,
  StagePuzzle2,
  StagePuzzle3,
  StagePuzzle4,
  StagePuzzle5,
  StagePuzzle6,
  StagePuzzle7,
} from './scenes/StagePuzzles';
import {
  IOPuzzle_Fire,
  IOPuzzle_Windy,
  IOPuzzle_Ice,
  IOPuzzle_Metal,
  IOPuzzle_Rain,
  IOPuzzle_Earth,
  IOPuzzle_Lightning,
  IOPuzzle_Balance,
} from './scenes/IOPuzzles';

import { Game, Types } from 'phaser';

//  Find out more information about the Game Config at:
//  https://newdocs.phaser.io/docs/3.70.0/Phaser.Types.Core.GameConfig
const config: Types.Core.GameConfig = {
  type: Phaser.AUTO,
  width: 1284,
  height: 750,
  parent: 'game-container',
  backgroundColor: '#181818',
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
  },
  physics: {
    default: 'matter',
    matter: {
      debug: false,
    },
  },
  scene: [
    Boot,
    Preloader,
    MainMenu,
    StageEarth,
    StageEarth2,
    StageClean,
    StageSpace,
    StageMoon,
    StagePuzzle1,
    StagePuzzle2,
    StagePuzzle3,
    StagePuzzle4,
    StagePuzzle5,
    StagePuzzle6,
    StagePuzzle7,
    IOPuzzle_Fire,
    IOPuzzle_Windy,
    IOPuzzle_Ice,
    IOPuzzle_Metal,
    IOPuzzle_Rain,
    IOPuzzle_Earth,
    IOPuzzle_Lightning,
    IOPuzzle_Balance,
  ],
};

export default new Game(config);
