async function beginVizJs(nodes, edges){
    
      const options = {
        physics: false,
        nodes: {
          shape: 'box',
          size: 20,
          font: {
            boldital: {'color': 'pink'},
            ital: {'color': 'blue'},
            mono: {'color': 'purple'},
            color: 'yellow'
          },
          color: 'skyblue',
          margin: 10,
          widthConstraint: {
            maximum: 100,
            minimum: 100
          },
          heightConstraint:{
            minimum: 50
          }
        },
        edges:{
          arrows: 'to',
          smooth: false
        }
      }
      
      await new Promise(r => setTimeout(r, 100));
      const container = document.getElementById('mynetwork')
      const network = new vis.Network(container,{nodes: new vis.DataSet(nodes), edges: new vis.DataSet(edges)},options)
    //   network.on('afterDrawing', ctx => {
    //     nodes.forEach(node => {
    //         drawRect(ctx, network, node.x, node.y, node.width, node.height, 5)
    //     });
    //   })
}

function drawRect(ctx,network, x, y, width, height, radius) {
    var self = this;
    var ctxLineWidth = ctx.lineWidth;
    var lineWidth = 1 / network.body.view.scale;
    ctx.lineWidth = Math.min(50, lineWidth);
    ctx.beginPath();
    ctx.strokeStyle = 'rgb(0,0,0)';
    ctx.moveTo(x, y + radius);
    ctx.lineTo(x, y + height - radius);
    ctx.arcTo(x, y + height, x + radius, y + height, radius);
    ctx.lineTo(x + width - radius, y + height);
    ctx.arcTo(x + width, y + height, x + width, y + height - radius, radius);
    ctx.lineTo(x + width, y + radius);
    ctx.arcTo(x + width, y, x + width - radius, y, radius);
    ctx.lineTo(x + radius, y);
    ctx.arcTo(x, y, x, y + radius, radius);
    ctx.stroke();
    ctx.lineWidth = ctxLineWidth;
}