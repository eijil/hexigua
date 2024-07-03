import 'phaser';
import Api from './api'

export default class Preload extends Phaser.Scene {
    constructor() {
        console.log('=== preload')
        super('preload');
    }
    preload() {
        const CDN = Api.cdn

        this.load.on('progress', function (value) {
            Api.event.onProgress && Api.event.onProgress(value)
        })
        this.load.on('complete', function (value) {
            Api.event.onComplete && Api.event.onComplete(value)
        })
        this.load.image('ground', CDN+'/image/ground.png')
        this.load.image('endLine', CDN+'/image/endLine.png')
        this.load.image('light', CDN+'/image/endLine.png')
        this.load.image('gameOver', CDN+'/image/gameover.png')
        this.load.image("tryagain", CDN+"/image/tryagain.png");
        this.load.image("yes",CDN+ "/image/yes.png");
        this.load.image("no", CDN+"/image/no.png");
        for (let i = 1; i <= 11; i++) {
            this.load.image(`${i}`, `${CDN}/image/${i}.png`)
        }
        this.load.atlas('success', CDN+'/image/confi.png', CDN+'/image/confi.json');

        this.load.audio('合成', CDN+'/media/合成.mp3');
        this.load.audio('庆祝', CDN+'/media/庆祝.mp3');
        this.load.audio('炸', CDN+'/media/炸.mp3');
        this.load.audio('down', CDN+'/media/down.mp3');

    }
    create() {
        this.scene.launch('demo')
    }
}