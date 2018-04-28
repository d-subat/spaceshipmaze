import React, {
    Component
} from 'react';

class GameMap extends React.Component {
    constructor(props) {
        super(props);
        
    }
    componentDidMount() {
        this.clearAndDraw();
    }
    componentWillReceiveProps(nextProps) {
        
        const ctx = this.canvas.getContext('2d');
        
        if (this.props.controls) {
            ctx.fillStyle = 'rgb(250,250,250)';
            
            var x = Math.round(this.props.controls.x/932*100); 
            var y = Math.round(this.props.controls.z/928*100);
            
            ctx.clearRect(x-1,y-1, 1, 1);
            ctx.fillRect(x,y, 1, 1);
            
        }
    
    }
    
    clearAndDraw() {
        const ctx = this.canvas.getContext('2d');
        if (ctx) {
            ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
            this.draw(ctx);
        }
    }

    draw(ctx) {
        const { dungeon,  controls } = this.props;
console.log(dungeon);
        ctx.fillStyle = 'rgb(250,150,0)';
        for (let y = 0; y < dungeon.length; y++) {
            for (let x = 0; x < dungeon[y].length; x++) {
                if (dungeon[x][y] === 1) {
                    ctx.fillRect(x * 2, y * 2, 2, 2);
                }
            }
        }
        
    }
    render() {
        
        return ( < div className = "gameMap" >
            <div className="gameMapOverlay"></div>
            <canvas className = "gameMapCv" width = "100%"
            height = "100%"
            ref = {
                canvas => this.canvas = canvas
            }
            /> </div >
        );
    }
}

export default GameMap;