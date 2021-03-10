document.addEventListener("DOMContentLoaded", function() {
  fetch("data.json")
    .then(r => r.json())
    .then(data => {
      data.nodes = data.nodes.map(n => {
        const img = new Image();
        img.src = n.img;
        return {
          ...n,
          img
        };
      });
      const Graph = ForceGraph()(document.getElementById("graph"))
        .nodeCanvasObject(({ img, x, y }, ctx) => {
          const size = 12;
          ctx.drawImage(img, x - size / 2, y - size / 2, size, size);
        })
        .nodePointerAreaPaint((node, color, ctx) => {
          const size = 12;
          ctx.fillStyle = color;
          ctx.fillRect(node.x - size / 2, node.y - size / 2, size, size); // draw square as pointer trap
        })
        .graphData(data)
        .nodeLabel("id")
        .linkDirectionalParticles(1)
        .linkDirectionalParticleSpeed(0.005);
    });
});
