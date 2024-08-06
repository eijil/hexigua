import * as Phaser from 'phaser'
import Preload from './preload'
import API from './api'

let window_width
let window_height
let scale

class Demo extends Phaser.Scene {

    private isOver: boolean = false
    private score: number = 0
    private randomLevel: number = 5
    private scoreText;
    private gameModal: any = new Map()
    private particles: any = new Map()
    private soundList: any = new Map()
    
    constructor() {
        super('demo');

    }

    create() {

        window_width = this.game.canvas.width
        window_height = this.game.canvas.height

        scale = API.scale

        // 音效
        this.soundList.set('down', this.sound.add('down'))
        this.soundList.set('合成', this.sound.add('合成'))

        // 设置边界
        this.matter.world.setBounds().updateWall(false, 'top')

        // 添加地面 宽度加40 防止1号水果掉到地面之下
        const groundSprite = this.add.tileSprite(window_width / 2, window_height - 127 * scale / 2, window_width, 127 * scale, 'ground')
        groundSprite.setTileScale(1, scale) // 缩放纹理
        this.matter.add.gameObject(groundSprite, { isStatic: true, label: 'ground' })
        // 得分
        this.scoreText = this.add.text(60 * scale, 40 * scale, `${this.score}`, { font: '45px Arial Black', color: '#ffe325' }).setStroke('#974c1e', 8);

        // 结束警戒线
        const endLineSprite = this.add.tileSprite(window_width / 2, 160 * scale, window_width, 8 * scale, 'endLine')
        endLineSprite.setTileScale(1, scale)
        // endLineSprite.setAlpha(0)
        endLineSprite.setData('lastCollideTime', 0)
        endLineSprite.setData('collideNum', 0)

        // 初始化一个水果
        const x = window_width / 2
        const y = 80 * scale
        let fruit = this.createFruite(x, y)
        let fruitTween = null
        let enablePointer = true // 启用pointer事件
        let isDragStart = false // pc端下 触发move之前不一定会触发down

        // 果汁粒子
        const juiceColor = [0x701167, 0xff0925, 0xfe6f01, 0xffc002, 0x5ddf20, 0xe61933, 0xf69a61, 0xffdd3c, 0xfffaea, 0xfc7b96]
        for(let i=0;i<juiceColor.length;i++){
            
            const graphics = this.make.graphics({ x: 0, y: 0 }, false);
            const key = 'juice'+(i+1)
            graphics.fillStyle(juiceColor[i], 1);
            graphics.fillCircle(20, 20, 20); // x,y,radius 创建一个圆形
            graphics.setScale(scale)
            graphics.generateTexture(key, 40*scale, 40*scale); // 图宽度高度
            
            let juiceParticles = this.add.particles(0, 0, key)
            juiceParticles.setDepth(10)
            this.particles.set(key, juiceParticles)

        }
        
        // 成功的粒子
        this.particles.set('success', this.add.particles(0, 0, 'success', {
            emitting: false,
            frame: ['c1.png', 'c2.png', 'c3.png', 'c4.png', 'c5.png', 'c6.png', 'c7.png', 'c8.png'],
            x: { min: 0, max: window_width },
            speed: { min: 250, max: 300 },
            gravityY: 400,
            lifespan: 4000,
            quantity: 2,
            y: window_height / 4,
            // maxParticles: 100,
            angle: { min: 220, max: 320 },
            scale: { start: 0.5, end: 0.8 },
            // blendMode: 'ADD'
        }))
        
        // // 设置物理效果
        this.matter.add.gameObject(endLineSprite, {
            label: 'endLine',
            // 静止
            isStatic: true,
            // 传感器模式，可以检测到碰撞，但是不会对物体产品效果
            isSensor: true,
            // 物体碰撞回调,
            onCollideActiveCallback: (e,body) => {
                if(this.isOver) return
                let inBody = e.bodyA.velocity.y === 0 ? e.bodyB : e.bodyA // 获取下落水果
                if(inBody.gameObject.getData('callOnce') === true) return // 如果没碰撞过地面或水果 就是刚下落的水果 直接return

                // let vA = e.bodyA.velocity.y
                // let vB = e.bodyB.velocity.y                

                // 1秒内触发50次碰撞才结束游戏 
                // 这里主要避免了爆炸导致水果突然上飞 提前触发了游戏结束
                let time = new Date().getTime()
                let lastCollideTime = endLineSprite.getData('lastCollideTime')
                let collideNum = endLineSprite.getData('collideNum')

                if(time - lastCollideTime > 1000){
                    endLineSprite.setData('lastCollideTime', time)
                    endLineSprite.setData('collideNum', 0)
                }else{
                    if(collideNum > 50){
                        // 游戏结束
                        this.events.emit('endGame')
                    }else{
                        collideNum++
                        endLineSprite.setData('collideNum', collideNum)
                    }
                }

            },

        })
        // end game
        this.events.once('endGame', () => {
            this.isOver = true
            this.input.off('pointerdown')
            this.input.off('pointermove')
            this.input.off('pointerup')
            this.tweens.add({
                targets: endLineSprite,
                alpha: {
                    from: 0,
                    to: 1
                },
                repeat: 3,
                duration: 300,
                onComplete: () => {
                    API.event.onGameOver && API.event.onGameOver(this.score)
                }
            })
        })

        this.events.on('success', () => {
            const s = this.particles.get('success')
            s.emitParticle(100)
        })

        // 点击屏幕
        this.input.on('pointerdown', (point: Phaser.Types.Math.Vector2Like) => {
            if(!enablePointer) return
            isDragStart = true
            fruitTween = this.tweens.add({
                targets: fruit,
                props: {
                    x: { value: point.x, ease: 'Power3' },
                },
                duration: 150,
                // onComplete: () => {}
            })
        })
        
        this.input.on('pointermove', (point: Phaser.Types.Math.Vector2Like) => {
            if(!isDragStart) return
            if(!enablePointer) return
            if(fruitTween) {
                fruitTween.destroy()
            }
            if(fruit) fruit.x = point.x
        })

        const pointerupHandle = (point: Phaser.Types.Math.Vector2Like) => {
            
            if(!isDragStart) return
            if(!enablePointer) return
            isDragStart = false
            enablePointer = false

            if(fruitTween) {
                fruitTween.destroy()
            }
            let size = fruit.width / 2 * scale
            fruit.x = Math.max(size, Math.min(window_width - size, point.x))

            // fruit.setAwake()
            fruit.setStatic(false)
            
            setTimeout(() => {
                fruit = this.createFruite(x, y, true)
                enablePointer = true
            }, 1000);
        }
        this.input.on('pointerup', pointerupHandle)
        this.input.on('pointerupoutside', pointerupHandle)

        const onCollisionStart = (event: any) => {
            const paris = event.source.pairs.list
            paris.forEach((pair: any) => {
                const { bodyA, bodyB } = pair
                const same = bodyA.label === bodyB.label && bodyA.label !== '11'
                const live = !bodyA.isStatic && !bodyB.isStatic
                
                if (same && live) {
                    if (bodyA.label === '10') {
                        this.events.emit('success')
                    }
                    bodyA.isStatic = true
                    bodyB.isStatic = true
                    const { x, y } = bodyA.position || { x: 0, y: 0 }
                    this.tweens.add({
                        targets: bodyB.position,
                        props: {
                            x: { value: x, ease: 'Power3' },
                            y: { value: y, ease: 'Power3' }
                        },
                        duration: 150,
                        onComplete: () => this.onCompose(bodyA, bodyB)
                    })
                    this.soundList.get('合成').play()
                }
                const has = bodyA.label !== 'endLine' && bodyB.label !== 'endLine'
                if(has && bodyB.gameObject && bodyB.gameObject.getData('callOnce') === true){
                    bodyB.gameObject.setData('callOnce', false)
                    this.soundList.get('down').play() // { volume: 2 }
                }else if(has && bodyA.gameObject && bodyA.gameObject.getData('callOnce') === true){
                    bodyA.gameObject.setData('callOnce', false)
                    this.soundList.get('down').play()
                }
                
            })
        }
        //碰撞事件
        this.matter.world.on('collisionstart', onCollisionStart)

        API.event.onStart && API.event.onStart()

    }

    /**
   * 添加一个瓜
   * @param x 坐标x
   * @param y 坐标y
   * @param isStatic 是否静止
   * @param key 瓜的类型
   */
    createFruite(x: number, y: number, isStatic = true, label?: string,) {

        // label = '9' // key == "1" ? "11" : key

        if (!label) {
            // 顶部落下的瓜前5个随机
            label = `${Phaser.Math.Between(1, this.randomLevel)}`
        }
        // const fruitWidth = this.textures.get(label).getSourceImage().width
        const fruit = this.matter.add.image(x, y, label, null, 
            // {
            //     shape: {
            //         type: 'circle',
            //         radius: (fruitWidth / 2)
            //     },
            //     label,
            //     restitution: 0.1, // 0.3, // 反弹
            //     friction: 1, // 0.1, // 摩擦系数
            // }
        )
        fruit.setBody({
            type: 'circle',
            radius: (fruit.width / 2)
        },{
            label,
            restitution: 0.3, // 0.3, // 反弹
            friction: 0.1, // 0.1, // 摩擦系数
            // density: 0.01, // 密度 默认 0.001	
            // mass: 1 // 质量
        })
        fruit.setStatic(isStatic)
        fruit.setData('callOnce', isStatic)
        fruit.setData('score', parseInt(label))
        fruit.setScale(scale)
        // fruit.setSleepEvents(true, true);

        // 添加动画
        this.tweens.add({
            targets: fruit,
            scale: {
                from: 0.1, to: scale
            },
            ease: 'Back',
            // 水果合并时 easeParams值太高 会导致击飞旁边的水果 甚至撞击警戒线 导致游戏提前结束，设置为0后 Back效果消失 
            // 可在这个链接测试 easeParams参数效果 https://labs.phaser.io/edit.html?src=src/tweens\eases\back.js
            easeParams: [isStatic ? 3.5 : 0], 
            duration: 200
        })
        
        return fruit
    }
    onCompose(bodyA, bodyB) {
        const { x, y } = bodyA.position
        const size = bodyA.gameObject.width
        const score = bodyA.gameObject.getData('score')
        const label = parseInt(bodyA.label)
        // 这里合成后，直接消失
        bodyA.gameObject.alpha = 0
        bodyB.gameObject.alpha = 0
        bodyB.destroy()
        bodyA.destroy()
        this.createFruite(x, y, false, `${label + 1}`)
        
        // 爆汁动画
        this.createJuiceParticles(x, y, size, `${label}`)

        // 得分
        this.score += score
        if (score === 10) {
            this.score += 100
        }
        // 根据分数增加初始掉落水果等级
        const add = Math.floor(this.score / 100)
        if (add < 4) {
            this.randomLevel = 5 + add
        }
        this.scoreText.setText(this.score)
        !this.isOver && API.event.onMessage && API.event.onMessage({code: 'score', data: {score: this.score, label}})

    }
    restart() {
        this.scene.restart()
        this.score = 0;
        this.randomLevel = 5
        this.isOver = false
    }
    setAudioMute(isMute: boolean){
        this.soundList.get('down').setMute(isMute)
        this.soundList.get('合成').setMute(isMute)
    }
    // 爆汁
    createJuiceParticles(x: number, y: number, size: number, label: string,) { 
        // 粒子
        const positionReg = size * scale / 2
        const scaleReg = Math.min(1, size / 408) // 水果越小 粒子越小
        const p = this.particles.get(`juice${label}`)
        p.setConfig({
            emitting: false,
            // maxParticles: 20, 
            x: { min: x-positionReg, max: x+positionReg },
            y: { min: y-positionReg, max: y+positionReg },
            speed: { min: 10, max: 50 },
            gravityY: 0, // 重力
            lifespan: 3000 * scaleReg + 1000, // 生命 毫秒 最小1000  最大4000秒
            quantity: 2, // 数量每帧

            scale: { start: 1 * scaleReg, end: 0.1, random: true },
            alpha: {  start: 0.8, end: 0, random: true},
        })
        p.emitParticle(50)

        // 粒子背景  果汁
        const s = this.textures.get(label).getSourceImage().width / 319 * scale // 获取水果图片原始宽度 计算出爆汁背景图的scale 这个值会让图片和水果一样宽
        const image = this.add.image(x, y, 'b', `b${label}.png`) // // 果汁 没有物理属性 直接用add.image
        image.setScale(s * 0.3)
        image.setAngle(Phaser.Math.Between(-180, 180))
        this.tweens.chain({
            targets: image,
            tweens: [
                {
                    scale: s * 1.4,
                    ease: 'Expo.out', // 'quart.in' 'power2' 'sine.in'
                    duration: 600
                },
                {
                    alpha: 0,
                    ease: 'Expo.in',
                    duration: 1200
                },
                // {
                //     scale: { value: 0.5, duration: 1000 },
                //     y: { value: 100, duration: 750, ease: '' }
                // },
               
            ],
            onComplete: () => {
                image.destroy()
            }
        })

    }

}

let game = null

export default {
    init({ debug = false, cdn = '', parent, scale = 1, backgroundColor = '#ffe8a3', transparent = false, event }){
        if(game) {
            console.log('init 函数只能执行一次')
            return
        }
        API.debug = debug
        API.cdn = cdn
        API.parent = parent
        API.scale = scale
        API.backgroundColor = backgroundColor
        API.transparent = transparent
        if(event){
            for(let name in API.event){
                if(event[name]) API.event[name] = event[name]
            }
        }

        const config = {
            type: Phaser.AUTO, // 渲染器 AUTO 将使用webGL渲染器
            backgroundColor,
            transparent,
            parent,
            width: parent ? parent.clientWidth : 1024,
            height: parent ? parent.clientHeight : 768,
            scale: {
                parent,
                mode: Phaser.Scale.FIT,
            },
            physics: {
                default: 'matter',
                matter: {
                    // enableSleeping: true,
                    gravity:{ 
                        x:0,
                        y: 3
                    },
                    debug: debug
                }
            },
            scene: [Preload, Demo]
        };

        game = new Phaser.Game(config);

    },
    // 如果结束页面不需要集成在游戏代码内 ，可通过onRestart来重置游戏
    onRestart(){
        game.scene.scenes[1].restart()
    },
    setAudioMute(isMute: boolean){
        game.scene.scenes[1].setAudioMute(isMute)
    }
}