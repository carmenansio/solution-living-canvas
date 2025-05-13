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

import Phaser from 'phaser';
import {
  Boat,
  Bomb,
  Bricks,
  Cloud,
  CloudRainy,
  Fire,
  IceCube,
  Tofu,
  Tree,
  Magnet,
  MetalCube,
  Key,
  IceKey,
  RustedKey,
  Fan,
  Lightning,
  IceWall,
  MetalWall,
  Bridge,
  WorldObject,
} from './WorldObject';

export class WorldObjectFactory {
  static worldObjectList = [
    { id: 'boat', asset: 'assets/boat.png' },
    { id: 'bomb', asset: 'assets/bomb.png' },
    { id: 'bricks', asset: 'assets/bricks.png' },
    { id: 'cloud', asset: 'assets/cloud.png' },
    { id: 'cloud_rainy', asset: 'assets/cloud_rainy.png' },
    { id: 'fire', asset: 'assets/fire.png' },
    { id: 'fire_cartoon', asset: 'assets/fire_cartoon.png' },
    { id: 'fire_pixellated', asset: 'assets/fire_pixellated.png' },
    { id: 'fire_realistic', asset: 'assets/fire_realistic.png' },
    { id: 'ice', asset: 'assets/ice.png' },
    { id: 'tofu', asset: 'assets/tofu.png' },
    { id: 'tree', asset: 'assets/tree.png' },
    { id: 'magnet', asset: 'assets/magnet.png' },
    { id: 'metal', asset: 'assets/metal.png' },
    { id: 'key', asset: 'assets/key.png' },
    { id: 'icekey', asset: 'assets/icekey.png' },
    { id: 'rustedkey', asset: 'assets/rustedkey.png' },
    { id: 'fan', asset: 'assets/fan.png' },
    { id: 'lightning', asset: 'assets/lightning.jpg' },
    { id: 'icewall', asset: 'assets/icewall.png' },
    { id: 'metalwall', asset: 'assets/metalwall.png' },
  ];

  static preload(scene) {
    const visualStyles = ['realistic', 'cartoon', 'pixellated'];

    for (let i = 0; i < this.worldObjectList.length; i++) {
      const baseId = this.worldObjectList[i].id;
      const baseAsset = this.worldObjectList[i].asset;

      scene.load.image(baseId, baseAsset);

      for (const style of visualStyles) {
        const styleId = `${baseId}_${style}`;
        const styleAsset = baseAsset.replace('.png', `_${style}.png`);
        scene.load.image(styleId, styleAsset);
      }
    }
  }
}

Phaser.GameObjects.GameObjectFactory.register(
  'worldobject',
  function (
    this: Phaser.GameObjects.GameObjectFactory,
    id: string,
    x: number,
    y: number,
    width,
    height
  ) {
    if (width == undefined) width = 64;
    if (height == undefined) height = 64;

    var obj;
    switch (id) {
      case 'boat':
        obj = new Boat(this.scene, x, y);
        break;
      case 'bomb':
        obj = new Bomb(this.scene, x, y);
        break;
      case 'bricks':
        obj = new Bricks(this.scene, x, y);
        break;
      case 'cloud':
        obj = new Cloud(this.scene, x, y);
        break;
      case 'cloud_rainy':
        obj = new CloudRainy(this.scene, x, y);
        break;
      case 'fire':
        obj = new Fire(this.scene, x, y);
        break;
      case 'ice':
        obj = new IceCube(this.scene, x, y);
        break;
      case 'tofu':
        obj = new Tofu(this.scene, x, y);
        break;
      case 'tree':
        obj = new Tree(this.scene, x, y);
        break;
      case 'magnet':
        obj = new Magnet(this.scene, x, y);
        break;
      case 'metal':
        obj = new MetalCube(this.scene, x, y);
        break;
      case 'key':
        obj = new Key(this.scene, x, y);
        break;
      case 'icekey':
        obj = new IceKey(this.scene, x, y);
        break;
      case 'rustedkey':
        obj = new RustedKey(this.scene, x, y);
        break;
      case 'fan':
        obj = new Fan(this.scene, x, y);
        break;
      case 'lightning':
        obj = new Lightning(this.scene, x, y);
        break;

      case 'icewall':
        obj = new IceWall(this.scene, x, y, width, height);
        break;
      case 'metalwall':
        obj = new MetalWall(this.scene, x, y, width, height);
        break;
      case 'bridge':
        obj = new Bridge(this.scene, x, y, width, height);
        break;
      default:
        console.log('Invalid id "' + id + '"');
    }
    if (obj != undefined) {
      this.displayList.add(obj);
      this.updateList.add(obj);
    }
    return obj;
  }
);

Phaser.GameObjects.GameObjectFactory.register(
  'userobject',
  function (
    this: Phaser.GameObjects.GameObjectFactory,
    x: number,
    y: number,
    base64ImageData: string,
    prop: WorldProp
  ) {
    var obj_name = 'user' + Phaser.Math.Between(0, 65536);

    console.log('%%%%%% props', prop);
    var obj = new WorldObject(this.scene, x, y, obj_name, prop);

    this.scene.textures.addBase64(obj_name, base64ImageData);
    this.scene.textures.on('addtexture', (key) => {
      if (key === obj_name) {
        obj.updateObject(key, prop);
      }
    });

    if (obj != undefined) {
      this.displayList.add(obj);
      this.updateList.add(obj);
    }
    return obj;
  }
);
