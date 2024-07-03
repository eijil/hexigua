import 'phaser';
import Preload from './preload'
import API from './api'

const WINDOW_WIDTH = window.innerWidth
const WINDOW_HEIGHT = window.innerHeight
const SCALE = 0.5
const Ratio = window.devicePixelRatio

const endLineY = 40 * Ratio

class Demo extends Phaser.Scene {

    private score: number = 0
    private randomLevel: number = 5
    private scoreText;
    private gameModal: any = new Map()
    private particles: any;


    constructor() {
        super('demo');

    }

    create() {

        // 设置边界
        this.matter.world.setBounds()


        // 添加地面 宽度加40 防止1号水果掉到地面之下
        const groundSprite = this.add.tileSprite(WINDOW_WIDTH / 2, WINDOW_HEIGHT - 5 * Ratio, WINDOW_WIDTH + 40, 127, 'ground')
        this.matter.add.gameObject(groundSprite, { isStatic: true, label: 'ground'  })


        // 初始化一个水果
        const x = WINDOW_WIDTH / 2
        const y = 20 * Ratio
        let fruit = this.createFruite(x, y)
        let fruitTween = null
        let enableCollide = true // 释放后1秒内 禁用碰撞 
        let isDragStart = false // pc端下 触发move之前不一定会触发down

        // 得分
        this.scoreText = this.add.text(30, 20, `${this.score}`, { font: '45px Arial Black', color: '#ffe325' }).setStroke('#974c1e', 8);

        const endLineSprite = this.add.tileSprite(WINDOW_WIDTH / 2, endLineY, WINDOW_WIDTH, 8, 'endLine')
        endLineSprite.setScale(1, SCALE)
        endLineSprite.setAlpha(0)

        this.particles = this.add.particles('success')


        // // 设置物理效果
        this.matter.add.gameObject(endLineSprite, {
            label: 'endLine',
            // 静止
            isStatic: true,
            // 传感器模式，可以检测到碰撞，但是不会对物体产品效果
            isSensor: true,
            // 物体碰撞回调,
            onCollideActiveCallback: (e,body) => {
                if (enableCollide) {
                    if (e.bodyB.velocity.y < 1 && e.bodyA.velocity.y < 1){
                        // 游戏结束
                        this.events.emit('endGame')
                    }
                }
            },

        })
        // end game
        this.events.once('endGame', () => {
            
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
                    this.gameModal.get('endModal').setVisible(true)
                    API.event.onGameOver && API.event.onGameOver(this.score)
                }
            })
        })

        this.events.on('success', () => {
            this.createParticles()
        })

        // 点击屏幕
        this.input.on('pointerdown', (point: Phaser.Types.Math.Vector2Like) => {
            if(!enableCollide) return
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
            if(!enableCollide) return
            if(fruitTween) {
                fruitTween.stop()
                // fruitTween.seek(1)
            }
            if(fruit) fruit.x = point.x
        })

        this.input.on('pointerup', (point: Phaser.Types.Math.Vector2Like) => {
            if(!isDragStart) return
            if(!enableCollide) return
            isDragStart = false
            enableCollide = false

            if(fruitTween) {
                fruitTween.stop()
                // fruitTween.seek(1)
            }
            let size = fruit.width / 2 * SCALE
            fruit.x = Math.max(size, Math.min(WINDOW_WIDTH - size, point.x))
            
            fruit.setAwake()
            fruit.setStatic(false)
            setTimeout(() => {
                fruit = this.createFruite(x, y)
                enableCollide = true
            }, 1000);
        })

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
                    this.sound.add('合成').play();
                }
                const has = bodyA.label !== 'endLine' && bodyB.label !== 'endLine'
                if(has && bodyB.gameObject && bodyB.gameObject.getData('callOnce') === true){
                    bodyB.gameObject.setData('callOnce', false)
                    this.sound.add('down').play(); // { volume: 2 }
                }else if(has && bodyA.gameObject && bodyA.gameObject.getData('callOnce') === true){
                    bodyA.gameObject.setData('callOnce', false)
                    this.sound.add('down').play(); // { volume: 2 }
                }
                
            })
        }
        //碰撞事件
        this.matter.world.on('collisionstart', onCollisionStart)

        this.createEndModal()

    }

    /**
   * 添加一个瓜
   * @param x 坐标x
   * @param y 坐标y
   * @param isStatic 是否静止
   * @param key 瓜的类型
   */
    createFruite(x: number, y: number, isStatic = true, key?: string,) {
        if (!key) {
            // 顶部落下的瓜前5个随机
            key = `${Phaser.Math.Between(1, this.randomLevel)}`
        }
        // key = '11' // key == "1" ? "11" : key
        const fruit = this.matter.add.image(x, y, key)
        fruit.setBody({
            type: 'circle',
            radius: (fruit.width / 2)
        }, {
            label: key,
            restitution: 0.1, // 0.3, // 反弹
            friction: 1, // 0.1, // 摩擦系数
            isStatic,
        })
        fruit.setData('callOnce', isStatic)
        fruit.setScale(SCALE)
        fruit.setSleepEvents(true, true);

        // 添加动画
        this.tweens.add({
            targets: fruit,
            scale: {
                from: 0,
                to: SCALE
            },
            ease: 'Back',
            easeParams: [3.5],
            duration: 200
        })
        return fruit
    }
    onCompose(bodyA, bodyB) {
        const { x, y } = bodyA.position
        const score = parseInt(bodyA.label)
        const lable = score + 1
        // 这里合成后，直接消失
        bodyA.gameObject.alpha = 0
        bodyB.gameObject.alpha = 0
        bodyB.destroy()
        bodyA.destroy()
        this.createFruite(x, y, false, `${lable}`)

        // 爆汁动画

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
        API.event.onUpdateScore && API.event.onUpdateScore(this.score)

    }
    createEndModal() {

        const modalContainer = this.creatMask()
        const centerX = WINDOW_WIDTH / 2

        const gameOver = this.add.sprite(centerX, 100, 'gameOver')
        const tryAgain = this.add.sprite(centerX, 200, 'tryagain')
        const yes = this.add.sprite(centerX - 50, 400, 'yes')
        const no = this.add.sprite(centerX + 50, 400, 'no')
        gameOver.setScale(0.5)
        tryAgain.setScale(0.5)
        yes.setScale(0.5)
        yes.setInteractive()
        yes.on('pointerup', () => {
            this.restart()
        })
        no.setScale(0.5)
        modalContainer.add([gameOver, tryAgain, yes, no])
        modalContainer.setVisible(false)
        modalContainer.setDepth(11)
        this.gameModal.set('endModal', modalContainer)

    }
    restart() {
        this.scene.restart()
        this.score = 0;
        this.randomLevel = 5
    }
    createParticles() {


        const frame = ['c1.png', 'c2.png', 'c3.png', 'c4.png', 'c5.png', 'c6.png', 'c7.png', 'c8.png']

        const config = {
            frame: frame,
            x: { min: 0, max: WINDOW_WIDTH },
            speed: { min: 250, max: 300 },
            gravityY: 400,
            lifespan: 4000,
            quantity: 2,
            y: WINDOW_HEIGHT / 4,
            maxParticles: 100,
            angle: { min: 220, max: 320 },
            scale: { start: 0.5, end: 0.8 },

        }
        this.particles.createEmitter(config)
    }



    creatMask() {
        const mask = this.add.graphics()
        mask.fillStyle(0X000000, 0.7)
        mask.fillRect(0, 0, WINDOW_WIDTH, WINDOW_HEIGHT)
        return this.add.container(0, 0, [mask])

    }
    update() {

    }
}

let game = null

export default {
    init({ cdn = '', event }){
        if(game) {
            console.log('init 函数只能执行一次')
            return
        }
        console.log(cdn)
        API.cdn = cdn
        if(event){
            for(let name in API.event){
                if(event[name]) API.event[name] = event[name]
            }
        }

        const config = {
            type: Phaser.AUTO,
            backgroundColor: '#ffe8a3',
            scale: {
                parent: 'container',
                mode: Phaser.Scale.FIT,
            },
            width: window.innerWidth,
            height: window.innerHeight,
            physics: {
                default: 'matter',
                matter: {
                    // enableSleeping: true,
                    gravity:{ 
                        x:0,
                        y:3
                    },
                    // debug: true
                }
            },
            scene: [Preload, Demo]
        };
        
        game = new Phaser.Game(config);

    },
    // 如果结束页面不需要集成在游戏代码内 ，可通过onRestart来重置游戏
    onRestart(){
        game.scene.scenes[1].restart()
    }
}