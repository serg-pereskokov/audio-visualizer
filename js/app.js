const canvas = document.querySelector('canvas')
const ctx = canvas.getContext('2d')

const WIDTH = 700
const HEIGHT = 400

const DPI_W = WIDTH * 2
const DPI_H = HEIGHT * 2

canvas.width = DPI_W
canvas.height = DPI_H

canvas.style.width = `${WIDTH}px`
canvas.style.height = `${HEIGHT}px`

class Draw {
    static circle({x, y, radius}, opacity = .3) {
        let gradient = ctx.createRadialGradient(x, y, 0, x, y, radius);
        ctx.beginPath()
        ctx.arc(x, y, radius, 0, 2 * Math.PI);
        gradient.addColorStop(0, 'rgba(255, 255, 255, 0)');
        gradient.addColorStop(.33, `rgba(255, 255, 255, ${opacity})`);
        gradient.addColorStop(.66, 'rgba(255, 255, 255, 0)');
        gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
        ctx.fillStyle = gradient
        ctx.fill()
        ctx.closePath()
    }

    static rect({x, y, width = 0, height, radius = 200}, rotate = 0) {
        const deg = rotate * Math.PI / 180
        const gradient = ctx.createLinearGradient(0, 0, width, 0)

        gradient.addColorStop(0, 'rgba(255, 255, 255, 0)')
        gradient.addColorStop(.33, 'rgba(255, 255, 255, 0)')
        gradient.addColorStop(0.66, 'rgba(255, 255, 255, 0)')
        gradient.addColorStop(1, 'rgba(255, 255, 255, .5)')

        ctx.beginPath()
        ctx.translate(x, y)
        ctx.fillStyle = gradient
        ctx.rotate(deg)
        ctx.fillRect(radius, 0, width, height)
        ctx.resetTransform()
        ctx.closePath()
    }
}

class Initial {
    constructor() {
        this.playList = [
            './audio/Lost Identities x Rob Roth - For Me [NCS Release].m4a',
            './audio/M.I.M.E x The LJ - Push The Gas [NCS Release].m4a'
        ]

        this.state = {
            trackId: 0
        }

        this.init()
    }
    init() {
        this.audio = new Audio(this.playList[this.state.trackId]);

        document.addEventListener('click', e => {
            if (e.target.localName === 'body') this.visualHandler()
            if (e.target.localName === 'canvas') this.actions()
        })

        document.addEventListener('dblclick', e => {
            if (e.target.localName === 'canvas') this.nextTrack(e)
        })

        this.audio.addEventListener('ended', () => {
            console.log(`End Track: ${this.playList[this.state.trackId]}`)
            this.state = {
                ...this.state,
                trackId: (() => {
    
                    let nextId = this.state.trackId + 1;
    
                    if (nextId === this.playList.length) nextId = 0
    
                    return nextId
                })()
            }
    
            this.audio.src = this.playList[this.state.trackId]
            
            this.audio.play()
        })
        
        document.body.click()
    }
    visualHandler() {
        this.ctx = new AudioContext()
        this.analyser = this.ctx.createAnalyser()
        this.source = this.ctx.createMediaElementSource(this.audio)
        this.source.connect(this.analyser)
        this.source.connect(this.ctx.destination)

        this.analyser.fftSize = 1024
        this.bufferLength = this.analyser.frequencyBinCount
        this.dataArray = new Uint8Array(this.bufferLength)
    }
    actions () {
        this.ctx.resume()
        this.audio.paused ? this.audio.play() : this.audio.pause()
        this.audio.paused ? console.log('pause') : console.log('play');
    }
    nextTrack(e) {
        e.preventDefault()

        this.audio.pause()

        this.state = {
            ...this.state,
            trackId: (() => {

                let nextId = this.state.trackId + 1;

                if (nextId === this.playList.length) nextId = 0

                return nextId
            })()
        }

        this.audio.src = this.playList[this.state.trackId]

        this.audio.play()
    }
    mainCircle() {
        const step = 4.5
        const od = this.dataArray[10] / 500
        const mult = 2.6

        for (let i = 0; i < this.dataArray.length; i++) {

            const wd = this.dataArray[i]

            Draw.rect({
                x: DPI_W / 2,
                y: DPI_H / 2,
                width: wd,
                height: 5
            }, step * i)
        }

        Draw.circle({
            x: DPI_W / 2,
            y: DPI_H / 2,
            radius: 300
        }, od)

        
        const ol = this.dataArray[0] / 500
        
        canvas.style.backgroundSize = `${ol == 0 || WIDTH * ol * mult < WIDTH ? WIDTH : WIDTH * ol * mult}px ${ol == 0 || HEIGHT * ol * mult < HEIGHT ? HEIGHT : HEIGHT * ol * mult}px`
    }
    leftCircle() {
        const step = 4.5
        const od = this.dataArray[10] / 500

        for (let i = 0; i < this.dataArray.length; i++) {

            const wd = this.dataArray[i] / 5

            Draw.rect({
                x: 100,
                y: 100,
                width: wd,
                height: 2,
                radius: 50
            }, step * i)
        }

        Draw.circle({
            x: 100,
            y: 100,
            radius: 100
        }, od)
    }
    rightCircle() {
        const step = 4.5
        const od = this.dataArray[10] / 500

        for (let i = 0; i < this.dataArray.length; i++) {

            const wd = this.dataArray[i] / 5

            Draw.rect({
                x: DPI_W - 100,
                y: 100,
                width: wd,
                height: 2,
                radius: 50
            }, step * i)
        }

        Draw.circle({
            x: DPI_W - 100,
            y: 100,
            radius: 100
        }, od)
    }
    update() {
        this.analyser.getByteFrequencyData(this.dataArray)
        this.mainCircle()
        this.leftCircle()
        this.rightCircle()
    }
}

let visual = new Initial()

function loop() {
    ctx.clearRect(0 , 0, DPI_W, DPI_H)
    requestAnimationFrame(loop)
    visual.update()
}

loop()