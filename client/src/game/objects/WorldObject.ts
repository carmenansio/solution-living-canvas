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

interface WorldObjProp {
  angle: number;
  floats: boolean;
  hovers: boolean;
  falls: boolean;
  drips: boolean;
  douses: boolean;
  solid: boolean;
  heavy: boolean;
  burns: boolean;
  explodes: boolean;
  timer: boolean;
  flies: boolean;
  walks: boolean;
  drives: boolean;
  space: boolean;
  propelled: boolean;
  wooden: boolean;
  metal: boolean;
  rusted: boolean;
  magnetic: boolean;
  blows: boolean;
  ice: boolean;
  lightning: boolean;
  heal: boolean;

  floatOffset: number;
  generating: boolean;
  user_generated_obj: boolean;
}

const WorldObjPropDefaults: WorldObjProp = {
  angle: 0,
  floats: false,
  hovers: false,
  falls: true,
  drips: false,
  douses: false,
  solid: true,
  heavy: false,
  burns: false,
  explodes: false,
  timer: false,
  flies: false,
  walks: false,
  drives: false,
  space: false,
  propelled: false,
  wooden: false,
  metal: false,
  rusted: false,
  magnetic: false,
  blows: false,
  ice: false,
  lightning: false,
  heal: false,
  floatOffset: 0,
  generating: false,
  user_generated_obj: false,
};

const WorldObjPropZeros: WorldObjPRop = {
  angle: 0,
  floats: false,
  hovers: false,
  falls: false,
  drips: false,
  douses: false,
  solid: false,
  heavy: false,
  burns: false,
  explodes: false,
  timer: false,
  flies: false,
  walks: false,
  drives: false,
  space: false,
  propelled: false,
  wooden: false,
  metal: false,
  rusted: false,
  magnetic: false,
  blows: false,
  ice: false,
  lightning: false,
  heal: false,
  floatOffset: 0,
  generating: false,
  user_generated_obj: false,
};

export class WorldObject extends Phaser.GameObjects.Sprite {
  life: number;
  debug: boolean;
  debugGraphic;
  frameCounter: number;

  prop: WorldObjProp;
  bCatchFire: boolean;
  bExploded: boolean;
  fireEmitter: Phaser.GameObjects.Particles.ParticleEmitter;
  explosion: Phaser.GameObjects.Particles.ParticleEmitter;
  drips: Phaser.GameObjects.Particles.ParticleEmitter;
  steam: Phaser.GameObjects.Particles.ParticleEmitter;
  magneticField: Phaser.GameObjects.Particles.ParticleEmitter;

  gameObject: Phaser.GameObjects.Sprite;

  isAnimated: boolean = false;
  animationKey: string | null = null;

  static canSetFire(gameObject: WorldObject) {
    if (gameObject.prop) {
      if (
        gameObject.prop.burns ||
        gameObject.prop.lightning ||
        gameObject.bCatchFire
      )
        return true;
    } else return false;
  }

  static getDefaultWorldObjProp() {
    return { ...WorldObjPropDefaults };
  }

  static getZeroWorldObjProp() {
    return { ...WorldObjPropZeros };
  }

  constructor(
    scene,
    x,
    y,
    texture,
    prop?,
    animationKey?: string,
    frameKeys?: string[]
  ) {
    const property = { ...WorldObjPropDefaults, ...prop };
    super(scene, x, y, texture);
    this.debug = false;

    // Add to scene and Matter before anything else
    scene.add.existing(this);

    if (animationKey && frameKeys && frameKeys.length > 0) {
      this.isAnimated = true;
      this.animationKey = animationKey;
      if (!scene.anims.exists(animationKey)) {
        scene.anims.create({
          key: animationKey,
          frames: frameKeys.map((key) => ({ key, frame: 0 })),
          frameRate: 8,
          repeat: -1,
        });
      }
      this.setTexture(frameKeys[0]);
      this.anims.play(animationKey);

      if (this.isAnimated && prop && prop.burns) {
        this.createFireEmitter();
        this.anims.play(animationKey);
      }
      this.updateObject(texture, property, true);
    } else {
      this.updateObject(texture, property);
    }
  }

  updateObject(texture, prop, skipTextureAndEffects = false) {
    if (this.isAnimated && skipTextureAndEffects) {
      // Just apply physics and props, don't change texture or effects
      this.prop = prop;
      if (this.scene.textures.exists(texture)) {
        if (this.prop.solid) {
          Phaser.Physics.Matter.MatterGameObject(this.scene.matter.world, this);
        }
      }
      return;
    }

    this.clearEffects();

    if (typeof texture != 'undefined') {
      this.setTexture(texture);
      this.setName(texture);
    }

    this.life = 100;
    this.frameCounter = 0;
    if (this.debug) {
      this.debugGraphic = this.scene.add.text(0, 0, this.texture.key, {
        fontSize: 10,
        color: '#aaaaaa',
      });
    }
    this.prop = prop;
    this.bCatchFire = false;
    this.bExploded = false;

    if (this.prop.burns) {
      this.createFireEmitter();
    }

    if (this.prop.drips && !this.scene.worldConfig.isVoidSpace) {
      this.createDripsEmitter();
    }

    if (this.prop.generating) {
      this.createFadeTween();
    }

    if (this.scene.textures.exists(texture)) {
      if (this.prop.lightning) {
        this.addLightningPropety();
      }
      if (this.prop.solid) {
        Phaser.Physics.Matter.MatterGameObject(this.scene.matter.world, this);
        // add matter physics related behaviors below

        this.setRectangle(
          this.scene.textures.get(texture).source[0].width,
          this.scene.textures.get(texture).source[0].height
        );
        this.setFrictionStatic(1);
        if (this.prop.propelled) {
          this.setFriction(1, this.scene.worldConfig.frictionAir * 150, 10);
        } else {
          this.setFriction(1, this.scene.worldConfig.frictionAir, 10);
        }

        if (this.prop.heavy) {
          this.body.gameObject.setMass(1);
        } else {
          this.body.gameObject.setMass(0.1);
        }

        if (this.prop.magnetic) {
          this.createMagneticForce();
          this.updateMagneticField();
        }

        if (!this.scene.worldConfig.isVoidSpace && this.prop.blows) {
          this.createBlowForce();
        }
      } else if (this.scene.worldConfig.isVoidSpace) {
        if (!this.prop.generating) {
          this.prop.explodes = true;
          this.bExploded = true;
          this.life = 0;
          this.setPosition(-1000, 0);
        }
      }
    }
  }

  createFireEmitter() {
    let fireTexture = 'fire';
    if (this.scene.gameSettings.visualStyle === 'realistic') {
      fireTexture = 'fire_realistic';
    } else if (this.scene.gameSettings.visualStyle === 'cartoon') {
      fireTexture = 'fire_cartoon';
    } else if (this.scene.gameSettings.visualStyle === 'pixellated') {
      fireTexture = 'fire_pixellated';
    }
    this.fireEmitter = this.scene.add
      .particles(0, 0, fireTexture, {
        angle: { min: -100, max: -80 },
        speed: { min: 200, max: 300 },
        scale: { start: 0.2, end: 0 },
        blendMode: this.scene.scene.key === 'StageClean' ? 'MULTIPLY' : 'ADD',
        frequency: 100,
        lifespan: 800,
        alpha: { start: 0.8, end: 0.1 },
        tint:
          this.scene.gameSettings.visualStyle === 'realistic'
            ? 0xff6600
            : 0xcc4400,
        emitZone: {
          type: 'edge',
          source: new Phaser.Geom.Rectangle(-10, -20, 20, 1),
        },
        x: 0,
        y: -10,
      })
      .startFollow(this);
    this.setDepth(50);
    this.fireEmitter.depth = this.depth - 1;
  }

  createDripsEmitter() {
    const visualStyle = this.scene.gameSettings?.visualStyle || 'realistic';

    let particleConfig = {
      speedY: { min: 400, max: 600 },
      scale: { min: 0.05, max: 0.1 },
      emitZone: { source: new Phaser.Geom.Line(-40, 30, 40, 30) },
      blendMode: this.scene.scene.key === 'StageClean' ? 'MULTIPLY' : 'ADD',
      alpha: { start: 0.7, end: 0.3 },
      frequency: 20,
      quantity: 4,
      gravityY: 800,
    };

    let particleTexture = 'water';
    switch (visualStyle) {
      case 'realistic':
        particleConfig.scale = { min: 0.001, max: 0.05 };
        particleConfig.alpha =
          this.scene.scene.key === 'StageClean'
            ? { start: 0.9, end: 0.6 }
            : { start: 0.8, end: 0.3 };
        particleConfig.frequency = 1.5;
        particleConfig.quantity = 2;
        particleConfig.emitZone = {
          source: new Phaser.Geom.Line(-35, 30, 35, 30),
        };
        particleConfig.speedY = { min: 300, max: 500 };
        particleConfig.gravityY = 600;
        break;
      case 'cartoon':
        const graphics = this.scene.add.graphics();
        graphics.fillStyle(0xffffff);
        graphics.fillCircle(16, 16, 16);
        graphics.generateTexture('droplet_circle', 32, 32);
        graphics.destroy();

        particleTexture = 'droplet_circle';
        particleConfig.scale = { min: 0.2, max: 0.2 };
        particleConfig.alpha = { start: 0.8, end: 0.4 };
        particleConfig.speedY = { min: 200, max: 400 };
        particleConfig.frequency = 11;
        particleConfig.quantity = 2;
        particleConfig.gravityY = 500;
        particleConfig.tint = 0x0b5095;
        break;
      case 'pixellated':
        particleConfig.scale = { min: 0.08, max: 0.15 };
        particleConfig.alpha = { start: 1.0, end: 0.6 };
        particleConfig.speedY = { min: 300, max: 500 };
        particleConfig.frequency = 20;
        particleConfig.quantity = 3;
        particleConfig.gravityY = 600;
        break;
    }

    this.drips = this.scene.add
      .particles(0, 0, particleTexture, particleConfig)
      .startFollow(this);

    var rain_zone = this.scene.matter.add.rectangle(
      this.x,
      this.y + this.scene.game.config.height / 2,
      64,
      this.scene.game.config.height,
      { isSensor: true, isStatic: true }
    );
    this.rain_zone = rain_zone;
    this.scene.matter.world.on('collisionactive', function (event) {
      for (const pair of event.pairs) {
        const { bodyA, bodyB } = pair;
        if (bodyA == rain_zone) {
          bodyB.gameObject?.addWet();
        }
        if (bodyB == rain_zone) {
          bodyA.gameObject?.addWet();
        }
      }
    });
  }

  createMagneticForce() {
    if (this.body == null) return;

    var magnetConstant = 0.012;
    if (this.scene.worldConfig.isVoidSpace) {
      magnetConstant = 0.0001;
    }

    this.body.attractors = [
      function (bodyA, bodyB) {
        if (bodyB.gameObject) {
          if (bodyB.gameObject.prop.metal && !bodyB.gameObject.prop.rusted) {
            var posA = new Phaser.Math.Vector2(bodyA.position);
            var posB = new Phaser.Math.Vector2(bodyB.position);
            // use Newton's law of gravitation
            var bToA = posB.subtract(posA),
              distance = bToA.length(),
              normal = bToA.normalize();

            var distanceSq = 1e10;
            if (distance > 0.001) distanceSq = bToA.lengthSq();

            var magnitude =
                magnetConstant * ((bodyA.mass * bodyB.mass) / distanceSq),
              force = normal.scale(magnitude);

            bodyA.gameObject.applyForce(force);
            bodyB.gameObject.applyForce(force.negate());
          }
        }
      },
    ];
  }

  createBlowForce() {
    var blowConstant = 300.0;

    this.body.attractors = [
      function (bodyA, bodyB) {
        if (bodyB.gameObject) {
          if (!bodyB.gameObject.prop.heavy) {
            var posA = new Phaser.Math.Vector2(bodyA.position);
            var posB = new Phaser.Math.Vector2(bodyB.position);

            var bToA = posB.subtract(posA),
              distanceSq = bToA.lengthSq() || 0.0001,
              normal = bToA.normalize(),
              magnitude =
                blowConstant * ((bodyA.mass * bodyB.mass) / distanceSq),
              force = normal.scale(magnitude);

            force.y = 0;

            if (
              Math.abs(bodyA.position.y - bodyB.position.y) >
              bodyA.gameObject.height * 2
            ) {
              force.x = 0;
            }
            bodyB.gameObject.applyForce(force);
          }
        }
      },
    ];

    this.windEffectRight = this.scene.add
      .particles(0, 0, 'droplet', {
        speed: { min: 150, max: 400 },
        angle: { min: -20, max: 20 },
        scale: { min: 0.05, max: 0.15 },
        alpha: { start: 0.4, end: 0 },
        lifespan: { min: 800, max: 1200 },
        frequency: 15,
        blendMode: 'ADD',
        emitZone: {
          type: 'edge',
          source: new Phaser.Geom.Rectangle(5, 0, 8, 1),
          quantity: 5,
        },
        radial: true,
        radialAccel: { min: -100, max: 100 },
        radialAccelVar: 30,
      })
      .startFollow(this);

    this.windEffectLeft = this.scene.add
      .particles(0, 0, 'droplet', {
        speed: { min: 150, max: 400 },
        angle: { min: 160, max: 200 },
        scale: { min: 0.05, max: 0.15 },
        alpha: { start: 0.4, end: 0 },
        lifespan: { min: 800, max: 1200 },
        frequency: 15,
        blendMode: 'ADD',
        emitZone: {
          type: 'edge',
          source: new Phaser.Geom.Rectangle(-5, 0, -8, 1),
          quantity: 5,
        },
        radial: true,
        radialAccel: { min: -100, max: 100 },
        radialAccelVar: 30,
      })
      .startFollow(this);
  }

  addLightningPropety() {
    this.scene.matter.world.on('collisionstart', (event) => {
      for (let i = 0; i < event.pairs.length; i++) {
        const bodyA = event.pairs[i].bodyA;
        const bodyB = event.pairs[i].bodyB;
        if (bodyA.gameObject === this || bodyB.gameObject === this) {
          this.createExplosion();
          const otherObject =
            bodyA.gameObject === this ? bodyB.gameObject : bodyA.gameObject;
          if (otherObject instanceof RustedKey) {
            otherObject.prop.rusted = false;
            otherObject.setTexture('key');
          }
          break;
        }
      }
    });
  }

  createExplosion() {
    const explosion = this.scene.add.particles(0, 0, 'fire', {
      angle: { min: -140, max: -40 },
      speed: { min: 200, max: 400 },
      scale: { start: 0.15, end: 0 },
      blendMode: 'ADD',
      frequency: 200,
      lifespan: 800,
      alpha: { start: 0.8, end: 0 },
      tint: 0xff6600,
      emitZone: {
        type: 'edge',
        source: new Phaser.Geom.Rectangle(-20, -30, 40, 1),
      },
      x: this.x,
      y: this.y,
    });

    explosion.explode(100, this.x, this.y);

    this.scene.time.delayedCall(800, () => {
      explosion.destroy();
    });
  }

  updateMagneticField() {
    if (this.magneticField) {
      this.magneticField.destroy(true);
    }

    const visualStyle = this.scene.gameSettings?.visualStyle || 'realistic';

    let particleConfig = {
      tint: 0x00ffff,
      speedY: { min: 40, max: 80 },
      scale: { min: 0.04, max: 0.08 },
      emitZone: { source: new Phaser.Geom.Line(-20, 30, 20, 30) },
      blendMode: 'ADD',
      alpha: { start: 0.3, end: 0.1 },
      frequency: 15,
      quantity: 2,
      gravityY: 150,
      lifespan: 700,
      radial: true,
      radialAccel: { min: -40, max: 40 },
      radialAccelVar: 15,
    };

    let particleTexture = 'droplet';
    switch (visualStyle) {
      case 'realistic':
        particleConfig.scale = { min: 0.03, max: 0.06 };
        particleConfig.alpha = { start: 0.4, end: 0.1 };
        particleConfig.frequency = 8;
        particleConfig.quantity = 2;
        particleConfig.emitZone = {
          source: new Phaser.Geom.Line(-20, 30, 20, 30),
        };
        particleConfig.radialAccel = { min: -20, max: 20 };
        particleConfig.radialAccelVar = 10;
        break;
      case 'cartoon':
        particleConfig.scale = { min: 0.12, max: 0.12 };
        particleConfig.alpha = { start: 0.3, end: 0.1 };
        particleConfig.frequency = 15;
        particleConfig.quantity = 2;
        particleConfig.emitZone = {
          source: new Phaser.Geom.Line(-20, 30, 20, 30),
        };
        particleConfig.radialAccel = { min: -20, max: 20 };
        particleConfig.radialAccelVar = 10;
        break;
      case 'pixellated':
        const graphics = this.scene.add.graphics();
        graphics.fillStyle(0xffffff);
        graphics.fillRect(0, 0, 16, 16);
        graphics.generateTexture('square', 16, 16);
        graphics.destroy();

        particleTexture = 'square';
        particleConfig.scale = { min: 0.3, max: 0.3 };
        particleConfig.alpha = { start: 0.4, end: 0.15 };
        particleConfig.frequency = 25;
        particleConfig.quantity = 1;
        particleConfig.emitZone = {
          source: new Phaser.Geom.Line(-20, 30, 20, 30),
        };
        particleConfig.radialAccel = { min: -5, max: 5 };
        particleConfig.radialAccelVar = 2;
        break;
    }

    this.magneticField = this.scene.add
      .particles(0, 0, particleTexture, particleConfig)
      .startFollow(this);
  }

  createFadeTween() {
    this.tween = this.scene.tweens.add({
      targets: this,
      props: {
        alpha: { from: 0, to: 1 },
      },
      duration: 500,
      ease: 'Sine.easeInOut',
      yoyo: true,
      repeat: -1,
      loopDelay: 0,
    });
  }

  preUpdate(time, delta) {
    super.preUpdate(time, delta);
    this.frameCounter = (this.frameCounter + 1) % 240;
    if (this.debug && this.debugGraphic) {
      this.debugGraphic.setText(this.getDebugInfo());
      this.debugGraphic.setPosition(
        this.x + this.displayWidth / 2 + 4,
        this.y - this.displayHeight / 2
      );
    }
    if (
      !this.prop ||
      this.prop.generating ||
      !this.scene.textures.exists(this.name)
    ) {
      return;
    }

    if (this.prop.walks) {
      this.setVelocityX?.(0.5);
    }
    if (this.prop.drives) {
      this.setVelocityX?.(1);
    }
    if (this.prop.flies) {
      const disp = 2 - (this.frameCounter % 30) / 15;
      this.setVelocity?.(1.5, -this.scene.worldConfig.gravity.y * 0.28 * disp);
    }
    if (this.prop.hovers) {
      const rand = Phaser.Math.Between(-100, 100) / 100;
      const disp = Math.sin(((this.frameCounter % 30) / 15) * Math.PI * rand);
      this.setVelocity?.(disp, -this.scene.worldConfig.gravity.y * 0.28);
    }
    if (this.prop.propelled) {
      const rand = Phaser.Math.Between(-200, 200) / 100;
      const disp = Math.sin(((this.frameCounter * Math.PI) / 120) * rand);
      this.setVelocityX?.(disp);
    }
    if (this.bCatchFire || this.prop.explodes) {
      this.life--;
      if (this.life < 0) {
        if (!this.bExploded) {
          console.log(this);
          this.addExplosion();
        }
        if (this.life < -200) {
          this.destroy(true);
        }
      }
    }

    if (this.windEffectLeft && this.windEffectRight) {
      this.windEffectLeft.setAngle(this.angle);
      this.windEffectRight.setAngle(this.angle);
    }

    if (this.prop.lightning) {
      this.life -= 5;
      if (this.life < 0) {
        this.destroy(true);
      }
    }

    try {
      if (this.magneticField) {
        this.magneticField.setAngle(this.angle);
      }
    } catch (e) {
      console.warn('Error updating magnetic field:', e);
    }
  }

  getDebugInfo() {
    var propText = '';
    for (const key in this.prop) {
      propText += '\n' + key + ':' + this.prop[key];
    }

    return (
      this.texture.key +
      '\npos: (' +
      this.x.toFixed(0) +
      ', ' +
      this.y.toFixed(0) +
      ')' +
      '\nlife: ' +
      this.life +
      propText
    );
  }
  clearEffects() {
    // Safely destroy debug graphic
    if (this.debugGraphic && !this.debugGraphic.destroyed) {
      this.debugGraphic.destroy(true);
      this.debugGraphic = null;
    }

    // Only stop particle emitters, do not destroy them
    const emitters = [
      this.fireEmitter,
      this.explosion,
      this.drips,
      this.steam,
      this.magneticField,
    ];
    emitters.forEach((emitter, idx) => {
      if (emitter && !emitter.destroyed) {
        try {
          emitter.stop();
        } catch (e) {
          console.warn('Error stopping particle emitter:', e);
        }
      }
      // Null out the reference
      switch (idx) {
        case 0:
          this.fireEmitter = null;
          break;
        case 1:
          this.explosion = null;
          break;
        case 2:
          this.drips = null;
          break;
        case 3:
          this.steam = null;
          break;
        case 4:
          this.magneticField = null;
          break;
      }
    });

    // Safely handle tween
    if (this.tween) {
      this.tween.stop();
      this.tween.remove();
      this.tween = null;
    }

    // Reset alpha
    this.alpha = 1;
  }

  preDestroy() {
    // Stop all particle emitters before the object is destroyed
    if (this.fireEmitter && !this.fireEmitter.removed) {
      this.fireEmitter.stop();
    }
    if (this.explosion && !this.explosion.removed) {
      this.explosion.stop();
    }
    if (this.drips && !this.drips.removed) {
      this.drips.stop();
    }
    if (this.steam && !this.steam.removed) {
      this.steam.stop();
    }
    if (this.magneticField && !this.magneticField.removed) {
      this.magneticField.stop();
    }

    super.preDestroy();
  }

  destroy(fromScene) {
    // Clear all effects first
    this.clearEffects();

    // Reset animation properties
    this.isAnimated = false;
    this.animationKey = null;

    // Remove from scene's display list
    if (this.scene && this.scene.sys && this.scene.sys.displayList) {
      try {
        this.scene.sys.displayList.remove(this);
      } catch (e) {
        console.warn('Error removing from display list:', e);
      }
    }

    // Call parent destroy
    super.destroy(fromScene);
  }

  // Override the scene shutdown handler
  sceneShutdown() {
    // Clear all effects first
    this.clearEffects();

    // Reset animation properties
    this.isAnimated = false;
    this.animationKey = null;

    // Remove from scene's display list
    if (this.scene && this.scene.sys && this.scene.sys.displayList) {
      try {
        this.scene.sys.displayList.remove(this);
      } catch (e) {
        console.warn('Error removing from display list during shutdown:', e);
      }
    }

    // Remove from scene's update list
    if (this.scene && this.scene.sys && this.scene.sys.updateList) {
      try {
        this.scene.sys.updateList.remove(this);
      } catch (e) {
        console.warn('Error removing from update list during shutdown:', e);
      }
    }

    // Remove from scene's children
    if (this.scene) {
      try {
        this.scene.children.remove(this);
      } catch (e) {
        console.warn('Error removing from scene children during shutdown:', e);
      }
    }
  }

  // Add a method to safely remove particle emitters
  safeRemoveParticleEmitter(emitter) {
    if (emitter && !emitter.removed) {
      try {
        emitter.stop();
        emitter.remove();
      } catch (e) {
        console.warn('Error removing particle emitter:', e);
      }
    }
  }

  // Add a method to safely remove all particle emitters
  safeRemoveAllParticleEmitters() {
    this.safeRemoveParticleEmitter(this.fireEmitter);
    this.safeRemoveParticleEmitter(this.explosion);
    this.safeRemoveParticleEmitter(this.drips);
    this.safeRemoveParticleEmitter(this.steam);
    this.safeRemoveParticleEmitter(this.magneticField);

    this.fireEmitter = null;
    this.explosion = null;
    this.drips = null;
    this.steam = null;
    this.magneticField = null;
  }

  addFire(force = false) {
    if ((this.prop.wooden || force) && !this.bCatchFire) {
      this.bCatchFire = true;
      let fireTexture = 'fire';
      if (this.scene.gameSettings.visualStyle === 'realistic') {
        fireTexture = 'fire_realistic';
      } else if (this.scene.gameSettings.visualStyle === 'cartoon') {
        fireTexture = 'fire_cartoon';
      } else if (this.scene.gameSettings.visualStyle === 'pixellated') {
        fireTexture = 'fire_pixellated';
      }
      this.fireEmitter = this.scene.add
        .particles(0, 0, fireTexture, {
          angle: { min: -100, max: -80 },
          speed: { min: 200, max: 300 },
          scale: { start: 0.15, end: 0 },
          blendMode:
            this.scene.gameSettings.visualStyle === 'realistic'
              ? 'ADD'
              : 'MULTIPLY',
          frequency: 100,
          lifespan: 800,
          alpha: {
            start:
              this.scene.gameSettings.visualStyle === 'realistic' ? 0.8 : 0.2,
            end: 0,
          },
          tint:
            this.scene.gameSettings.visualStyle === 'realistic'
              ? 0xff6600
              : 0xcc4400,
          emitZone: {
            type: 'edge',
            source: new Phaser.Geom.Rectangle(-10, -20, 20, 1),
          },
          x: 0,
          y: -10,
        })
        .startFollow(this);
      this.setDepth(50);
      this.fireEmitter.depth = this.depth - 1;
    } else if (this.prop.ice) {
      this.prop.ice = false;
      this.steam = this.scene.add.particles(0, 0, 'water', {
        speed: { min: 100, max: 500 },
        scale: { min: 0, max: 0.1 },
        gravityY: 100,
        lifespan: 1000,
      });
      this.life = -1;
      this.steam.explode(1000, this.x, this.y);
      this.setPosition(-1000, 0);
      // Check if this is a key and trigger game over
      if (
        this instanceof Key ||
        this instanceof IceKey ||
        this instanceof RustedKey
      ) {
        this.gameOver('key_destroyed');
      }
    }
  }

  addWet() {
    if (WorldObject.canSetFire(this) && !this.prop.lightning) {
      this.bCatchFire = false;
      this.prop.burns = false;
      if (this.fireEmitter) {
        this.fireEmitter.destroy(true);
      }
      this.steam = this.scene.add.particles(0, 0, 'water', {
        speed: { min: 10, max: 50 },
        scale: { min: 0.01, max: 0.1 },
        gravityY: -100,
        lifespan: 1000,
        //blendMode: "ADD",
      });
      this.steam.explode(100, this.x, this.y);
    }
    if (this.prop.metal) {
      this.prop.rusted = true;
      this.setTexture('rustedkey');
    }
  }

  addExplosion() {
    this.explosion = this.scene.add.particles(0, 0, 'fire', {
      angle: { min: -120, max: -60 },
      speed: { min: 100, max: 500 },
      scale: { start: 0.2, end: 0 },
      gravityY: 100,
      lifespan: 800,
      frequency: 100,
      blendMode: 'ADD',
      alpha: { start: 0.8, end: 0 },
      tint: 0xff6600,
      emitZone: {
        type: 'edge',
        source: new Phaser.Geom.Rectangle(-15, -5, 30, 1),
      },
      x: 0,
      y: -10,
    });
    this.explosion.explode(400, this.x, this.y);
    this.body?.gameObject?.setMass(0.0001);
    this.life = -200;
    this.bExploded = true;

    if (
      this instanceof Key ||
      this instanceof IceKey ||
      this instanceof RustedKey
    ) {
      this.gameOver('key_destroyed');
    }
  }

  updateVisualStyle() {
    const visualStyle = this.scene.gameSettings?.visualStyle || 'realistic';
    const baseTexture = this.texture.key;
    const styleSuffix = `_${visualStyle}`;

    if (!baseTexture.startsWith('fire')) {
      if (this.scene.textures.exists(baseTexture + styleSuffix)) {
        this.setTexture(baseTexture + styleSuffix);
      }
    }

    if (this.prop.burns) {
      let fireTexture = 'fire';
      if (visualStyle === 'realistic') {
        fireTexture = 'fire_realistic';
      } else if (visualStyle === 'cartoon') {
        fireTexture = 'fire_cartoon';
      } else if (visualStyle === 'pixellated') {
        fireTexture = 'fire_pixellated';
      }

      if (this.fireEmitter) {
        this.fireEmitter.destroy(true);
        this.fireEmitter = null;
      }

      this.fireEmitter = this.scene.add
        .particles(0, 0, fireTexture, {
          angle: { min: -100, max: -80 },
          speed: { min: 200, max: 300 },
          scale: { start: 0.15, end: 0 },
          blendMode: visualStyle === 'realistic' ? 'ADD' : 'MULTIPLY',
          frequency: 100,
          lifespan: 800,
          alpha: {
            start: visualStyle === 'realistic' ? 0.8 : 0.2,
            end: 0,
          },
          tint: visualStyle === 'realistic' ? 0xff6600 : 0xcc4400,
          emitZone: {
            type: 'edge',
            source: new Phaser.Geom.Rectangle(-10, -20, 20, 1),
          },
          x: 0,
          y: -10,
        })
        .startFollow(this);
      this.setDepth(50);
      this.fireEmitter.depth = this.depth - 1;

      if (this.bCatchFire) {
        this.fireEmitter.start();
      }
    }

    if (this.prop.drips && !this.scene.worldConfig.isVoidSpace) {
      let particleConfig = {
        speedY: { min: 400, max: 600 },
        scale: { min: 0.05, max: 0.1 },
        emitZone: { source: new Phaser.Geom.Line(-40, 30, 40, 30) },
        blendMode: this.scene.scene.key === 'StageClean' ? 'MULTIPLY' : 'ADD',
        alpha: { start: 0.7, end: 0.3 },
        frequency: 20,
        quantity: 4,
        gravityY: 800,
      };

      let particleTexture = 'water';
      switch (visualStyle) {
        case 'realistic':
          particleConfig.scale = { min: 0.001, max: 0.05 };
          particleConfig.alpha =
            this.scene.scene.key === 'StageClean'
              ? { start: 0.9, end: 0.6 }
              : { start: 0.8, end: 0.3 };
          particleConfig.frequency = 1.5;
          particleConfig.quantity = 2;
          particleConfig.emitZone = {
            source: new Phaser.Geom.Line(-35, 30, 35, 30),
          };
          particleConfig.speedY = { min: 300, max: 500 };
          particleConfig.gravityY = 600;
          break;
        case 'cartoon':
          particleTexture = 'droplet_circle';
          particleConfig.scale = { min: 0.2, max: 0.2 };
          particleConfig.alpha = { start: 0.8, end: 0.4 };
          particleConfig.speedY = { min: 200, max: 400 };
          particleConfig.frequency = 11;
          particleConfig.quantity = 2;
          particleConfig.gravityY = 500;
          particleConfig.tint = 0x0b5095;
          break;
        case 'pixellated':
          particleConfig.scale = { min: 0.08, max: 0.15 };
          particleConfig.alpha = { start: 1.0, end: 0.6 };
          particleConfig.speedY = { min: 300, max: 500 };
          particleConfig.frequency = 20;
          particleConfig.quantity = 3;
          particleConfig.gravityY = 600;
          break;
      }

      if (this.drips) {
        this.drips.setTexture(particleTexture);
        this.drips.setConfig(particleConfig);
        this.drips.start();
      } else {
        this.drips = this.scene.add
          .particles(0, 0, particleTexture, particleConfig)
          .startFollow(this);
      }
    }

    if (this.prop.magnetic) {
      this.updateMagneticField();
    }
  }

  cleanupBeforeTransition() {
    // Destroy all world objects
    this.getWorldObjectList().forEach((obj) => {
      if (obj && !obj.destroyed) {
        // Stop and remove all effects
        if (obj.fireEmitter && !obj.fireEmitter.removed) {
          try {
            obj.fireEmitter.stop();
            obj.fireEmitter.remove();
          } catch {}
        }
        if (obj.explosion && !obj.explosion.removed) {
          try {
            obj.explosion.stop();
            obj.explosion.remove();
          } catch {}
        }
        if (obj.drips && !obj.drips.removed) {
          try {
            obj.drips.stop();
            obj.drips.remove();
          } catch {}
        }
        if (obj.steam && !obj.steam.removed) {
          try {
            obj.steam.stop();
            obj.steam.remove();
          } catch {}
        }
        if (obj.magneticField && !obj.magneticField.removed) {
          try {
            obj.magneticField.stop();
            obj.magneticField.remove();
          } catch {}
        }
        if (obj.tween) {
          try {
            obj.tween.stop();
            obj.tween.remove();
          } catch {}
        }
        try {
          obj.destroy(true);
        } catch {}
      }
    });

    // Destroy all canvas objects
    if (this.canvasObjects) {
      this.canvasObjects.forEach((obj) => {
        if (obj && !obj.destroyed) {
          try {
            obj.destroy(true);
          } catch {}
        }
      });
      this.canvasObjects = [];
    }
  }

  gameOver(reason) {
    // @ts-ignore
    window.phaserGame.app.showGameOverMessage(reason);
  }
}

// actual world objects below, in alphabetical order
export class Boat extends WorldObject {
  constructor(scene, x, y) {
    super(scene, x, y, 'boat', {
      floats: true,
      drives: false,
      wooden: true,
    });
    this.prop.floatOffset = -this.height * 0.4;
  }
}

export class Bricks extends WorldObject {
  constructor(scene, x, y) {
    super(scene, x, y, 'bricks', {
      heavy: true,
    });
  }
}

export class Bomb extends WorldObject {
  constructor(scene, x, y) {
    super(scene, x, y, 'bomb', {
      explodes: true,
      timer: true,
    });
    this.life = Phaser.Math.Between(100, 200);
  }
}

export class Cloud extends WorldObject {
  constructor(scene, x, y) {
    super(scene, x, y, 'cloud', {
      hovers: true,
      falls: false,
      solid: false,
    });
    this.setDisplaySize(128, 128);
  }

  preUpdate() {
    this.setX(this.x + 0.1);
    super.preUpdate();
  }
}

export class CloudRainy extends WorldObject {
  constructor(scene, x, y) {
    super(scene, x, y, 'cloud_rainy', {
      hovers: true,
      falls: false,
      drips: true,
      solid: false,
    });
    this.setDisplaySize(128, 128);
  }
}

export class Fire extends WorldObject {
  constructor(scene, x, y) {
    super(scene, x, y, 'fire', {
      burns: true,
    });
  }

  updateObject(texture, prop) {
    super.updateObject('fire', prop);
  }
}

export class IceCube extends WorldObject {
  constructor(scene, x, y) {
    super(scene, x, y, 'ice', {
      floats: true,
      ice: true,
    });
    this.prop.floatOffset = this.height / 4;
  }
}

export class Tofu extends WorldObject {
  constructor(scene, x, y) {
    super(scene, x, y, 'tofu');
  }
}

export class Tree extends WorldObject {
  constructor(scene, x, y) {
    super(scene, x, y, 'tree', {
      floats: true,
      wooden: true,
    });
  }
}

export class Magnet extends WorldObject {
  constructor(scene, x, y) {
    super(scene, x, y, 'magnet', {
      heavy: true,
      magnetic: true,
    });
  }
}

export class MetalCube extends WorldObject {
  constructor(scene, x, y) {
    super(scene, x, y, 'metal', {
      heavy: true,
      metal: true,
    });
  }
}

export class Key extends WorldObject {
  constructor(scene, x, y) {
    super(scene, x, y, 'key', {
      metal: true,
    });
  }
}

export class IceKey extends WorldObject {
  constructor(scene, x, y) {
    super(scene, x, y, 'icekey', {
      float: true,
      ice: true,
    });
    this.prop.floatOffset = this.height / 4;
  }
}

export class RustedKey extends WorldObject {
  constructor(scene, x, y) {
    super(scene, x, y, 'rustedkey', {
      metal: true,
      rusted: true,
    });
  }
}

export class Fan extends WorldObject {
  constructor(scene, x, y) {
    super(scene, x, y, 'fan', {
      heavy: true,
      blows: true,
    });
  }
}

export class Lightning extends WorldObject {
  constructor(scene, x, y) {
    super(scene, x, y, 'lightning', {
      lightning: true,
    });
  }
}

export class IceWall extends WorldObject {
  constructor(scene, x, y, width, height) {
    super(scene, x, y, 'icewall');
    this.setStatic(true);
    this.setDisplaySize(width, height);
  }
}

export class MetalWall extends WorldObject {
  constructor(scene, x, y, width, height) {
    super(scene, x, y, 'metalwall');
    this.setStatic(true);
    this.setDisplaySize(width, height);
  }
}

export class Bridge extends WorldObject {
  constructor(scene, x, y, width, height) {
    super(scene, x, y, 'bridge');
    this.setStatic(true);
    this.setDisplaySize(width, height);
  }

  preUpdate() {
    if (this.bCatchFire) {
      this.prop.explodes = true;
      // cancel the life reduced by the fire as explode will do it too.
      this.life++;
    }
    super.preUpdate();
  }
}
