import React from 'react';

class GameMap extends React.Component {
    state = { init: true }
    componentDidMount() {
        this.setState({ init: true })
    }
    componentWillReceiveProps(oldProps, nextProps) {
        const ctx = this.canvas.getContext('2d');
        if (this.props.dungeon) {
            this.clearAndDraw()
        }
        if (this.props.controls) {
            ctx.fillStyle = 'orange';
            var x = Math.round(this.props.controls.x / 932 * 100);
            var y = Math.round(this.props.controls.z / 928 * 100);
            ctx.strokeStyle = "black";
            ctx.lineWidth = 5;
            ctx.strokeRect(x, y, 3, 3);
            ctx.fillRect(x, y, 3, 3);
        }
    }

    clearAndDraw() {
        const ctx = this.canvas.getContext('2d');

        if (ctx) {
            ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
            this.draw(ctx);
        }
        this.setState({ init: false })
    }

    draw(ctx) {
        const { dungeon } = this.props;
        ctx.fillStyle = 'rgb(250,250,250)';
        for (let y = 0; y < dungeon.length; y++) {
            for (let x = 0; x < dungeon[y].length; x++) {
                if (dungeon[x][y].name === "wall") {
                    ctx.fillRect(x * 2, y * 2, 2, 2);
                }
            }
        }
    }
    render() {

        return (< div className="gameMap" >
                    <canvas className="gameMapCv" width="100%" height="100%"
                        ref={ canvas => this.canvas = canvas } />
                </div >
        );
    }
}

export default GameMap;