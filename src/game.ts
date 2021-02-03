import 'phaser';


const WINDOW_WIDTH = window.innerWidth
const WINDOW_HEIGHT = window.innerHeight


export default class Demo extends Phaser.Scene {

    private enableAdd: boolean = true
    private score: number = 0

    private scoreText;
    constructor() {
        super('demo');
    }
    preload() {

        this.load.image('ground', 'assets/ground.png')
        this.load.image('endLine','assets/endLine.png')
        for (let i = 1; i <= 11; i++) {
            this.load.image(`${i}`, `assets/${i}.png`)
        }

    }
  
    create() {
        this.load.image('ground', 'assets/ground.png')
        for (let i = 1; i <= 11; i++) {
            this.load.image(`${i}`, `assets/${i}.png`)
        }
        //设置边界
        this.matter.world.setBounds()

        //添加地面
        const groundSprite = this.add.tileSprite(WINDOW_WIDTH / 2, WINDOW_HEIGHT - 127 / 2, WINDOW_WIDTH, 127, 'ground')
        this.matter.add.gameObject(groundSprite, { isStatic: true })

        //初始化一个水果
        const x = WINDOW_WIDTH / 2
        const y = WINDOW_HEIGHT / 10
        let fruit = this.createFruite(x, y)

        //得分
        this.scoreText = this.add.text(30, 20, `${this.score}`, { font: '90px Arial Black', color: '#ffe325' }).setStroke('#974c1e', 16);

        const endLineSprite = this.add.tileSprite(WINDOW_WIDTH / 2, y + 200, WINDOW_WIDTH, 8, 'endLine'  )
        endLineSprite.setVisible(false)
        this.matter.add.gameObject(endLineSprite, { isStatic: true, isSensor: true ,onCollideCallback:()=>{
            if (this.enableAdd) {
                    console.log('endGame')
                }
        } })
       


        //点击屏幕
        this.input.on('pointerdown', (point) => {

            if (this.enableAdd) {
                this.enableAdd = false
                this.tweens.add({
                    targets: fruit,
                    x: point.x,
                    duration: 100,
                    ease: 'Power1',
                    onComplete: () => {
                        fruit.setStatic(false)
                        setTimeout(() => {
                            fruit = this.createFruite(x, y)
                            this.enableAdd = true
                        }, 1000);
                    }
                })
            }
        })



        //碰撞事件
        this.matter.world.on('collisionstart', (event, bodyA, bodyB) => {

            const same = bodyA.label === bodyB.label && bodyA.label !== '11'
            const live = !bodyA.isStatic && !bodyB.isStatic
            if (same && live) {
                bodyA.isStatic = true
                bodyB.isStatic = true
                const { x, y } = bodyA.position
                this.tweens.add({
                    targets: bodyB.position,
                    props: {
                        x: { value: x, ease: 'Power3' },
                        y: { value: y, ease: 'Power3' }
                    },
                    duration: 150,
                    onComplete: () => this.onCompose(bodyA, bodyB)
                })

            }
            


        })


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
            //顶部落下的瓜前5个随机
            key = `${Phaser.Math.Between(1, 5)}`
        }
        // key = '11'
        const fruit = this.matter.add.image(x, y, key)
        //设置物理刚体
        fruit.setBody({
            type: 'circle',
            radius: fruit.width / 2
        }, {
            isStatic,
            label: key
        })
        //添加动画
        this.tweens.add({
            targets: fruit,
            scale: {
                from: 0,
                to: 1
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
        //这里合成后，直接消失，有时间的话可以加一些帧动画之类的
        bodyA.gameObject.alpha = 0
        bodyB.gameObject.alpha = 0
        bodyB.destroy()
        bodyA.destroy()
        this.createFruite(x, y, false, `${lable}`)
        //得分
        this.score += score
        if (score === 10) {
            this.score += 100
        }
        this.scoreText.setText(this.score)

    }

    update() {

    }
}

const config = {
    type: Phaser.AUTO,
    backgroundColor: '#ffe8a3',
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
    physics: {
        default: 'matter',
        matter: {
            gravity: {
                y: 2
            },
            //debug: true
        }
    },
    width: window.innerWidth,
    height: window.innerHeight,
    scene: Demo
};

const game = new Phaser.Game(config);
