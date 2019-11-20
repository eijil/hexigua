import 'phaser';

export default class Demo extends Phaser.Scene
{
    constructor ()
    {
        super('demo');
    }

    preload ()
    {
        this.load.image('logo', 'assets/logo.png');
    }

    create ()
    {
        const logo = this.add.image(400, 200, 'logo');

        this.tweens.add({
            targets: logo,
            y: 500,
            duration: 2000,
            ease: 'Sine.inOut',
            yoyo: true,
            repeat: -1
        })
    }
}

const config = {
    type: Phaser.AUTO,
    backgroundColor: '#121255',
    width: 800,
    height: 600,
    scene: Demo
};

const game = new Phaser.Game(config);
