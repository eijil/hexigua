import 'phaser';


const WINDOW_WIDTH = window.innerWidth
const WINDOW_HEIGHT = window.innerHeight


export default class Demo extends Phaser.Scene {

    private enableAdd: Boolean = true
    private fruit: Phaser.Physics.Matter.Image

    constructor() {
        super('demo');
    }
    preload() {

        this.load.image('ground', 'assets/ground.png')
        for (let i = 1; i <= 11; i++) {
            this.load.image(`${i}`, `assets/${i}.png`)
        }

    }
    createFruite() {

        const rnd = Phaser.Math.Between(1,5)
        this.fruit = this.matter.add.image(WINDOW_WIDTH / 2, WINDOW_HEIGHT / 10, `${rnd}`)
        this.fruit.setBody({
            type: 'circle',
            radius: this.fruit.width / 2
        }, {
            isStatic: true,
            label: `${rnd}`
        })
        this.tweens.add({
            targets: this.fruit,
            scale: {
                from: 0,
                to: 1
            },
            ease: 'Back',
            easeParams: [3.5],
            duration: 200
        })


    }
    create() {
        const WINDOW_WIDTH = window.innerWidth
        this.matter.world.setBounds()

        //添加地面
        const groundSprite = this.add.tileSprite(WINDOW_WIDTH / 2, WINDOW_HEIGHT - 127 / 2, WINDOW_WIDTH, 127, 'ground')
        this.matter.add.gameObject(groundSprite, { isStatic: true })

        //创建一个瓜
        this.createFruite()

        //点击屏幕
        this.input.on('pointerdown', (point) => {

            if (this.fruit && this.enableAdd) {
                this.tweens.add({
                    targets: this.fruit,
                    x: point.x,
                    duration: 100,
                    ease: 'Power1',
                    onComplete: () => {
                        this.enableAdd = false
                        this.fruit.setStatic(false)
                        setTimeout(() => {
                            this.createFruite()
                            this.enableAdd = true
                        }, 1000);
                    }
                })
            }
        })

        //碰撞事件
        this.matter.world.on('collisionstart', (event, bodyA, bodyB) => {
            
            if(bodyA.label === bodyB.label){
                bodyA.isStatic = true
                bodyB.isStatic = true
                this.tweens.add({
                    targets: bodyB.position,
                    props:{
                        x: { value: bodyA.position.x, ease: 'Power3' },
                        y: { value: bodyA.position.y, ease: 'Power3' }
                    },
                    
                    duration:150,
                    onComplete:()=>{
                        // bodyB.destory()
                        // bodyA.destory()
                    }
                })
                
                console.log(bodyA.position)
                console.log(bodyA)
                console.log(bodyB)
                
            }

        })

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
            // debug: true
        }
    },
    width: window.innerWidth,
    height: window.innerHeight,
    scene: Demo
};

const game = new Phaser.Game(config);
