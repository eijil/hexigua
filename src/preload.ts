import 'phaser';


const CDN = 'https://storage.360buyimg.com/web-static/hexigua'

export default class Preload extends Phaser.Scene {
    constructor() {
        super('preload');
    }
    preload() {

        this.load.on('progress', function (value) {
            console.log(value)
        })
        this.load.on('complete', function () {
            console.log('file complete')
        })
        this.load.image('ground', CDN+'/ground.png')
        this.load.image('endLine', CDN+'/endLine.png')
        this.load.image('light', CDN+'/endLine.png')
        this.load.image('gameOver', CDN+'/gameover.png')
        this.load.image("tryagain", CDN+"/tryagain.png");
        this.load.image("yes",CDN+ "/yes.png");
        this.load.image("no", CDN+"/no.png");
        for (let i = 1; i <= 11; i++) {
            this.load.image(`${i}`, `${CDN}/${i}.png`)
        }
        this.load.atlas('success', CDN+'/confi.png', CDN+'/confi.json');

    }
    create() {
        this.scene.launch('demo')
    }
}