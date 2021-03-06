import { ForceGraph2D } from "react-force-graph";
import { useState, useCallback } from "react";
import { get } from "lodash";
import data from "./data";

data.links = data.links.map(link => ({
  source: link.target,
  target: link.source
}));

const nodesByName = data.nodes.reduce((acc, node) => {
  const img = new Image();
  img.src = node.img;
  node.img = img;
  acc[node.id] = node;
  return acc;
}, {});

data.links.forEach(link => {
  const a = nodesByName[link.source];
  const b = nodesByName[link.target];
  !a.neighbors && (a.neighbors = []);
  !b.neighbors && (b.neighbors = []);
  a.neighbors.push(b.id);
  b.neighbors.push(a.id);

  !a.links && (a.links = []);
  !b.links && (b.links = []);
  a.links.push(link);
  b.links.push(link);
});

const graphData = {
  nodes: Object.values(nodesByName),
  links: data.links
};

const Graph = props => {
  const [highlightNodes, setHighlightNodes] = useState(new Set());
  const [highlightLinks, setHighlightLinks] = useState(new Set());
  const [hoverNode, setHoverNode] = useState(null);

  const updateHighlight = () => {
    setHighlightNodes(highlightNodes);
    setHighlightLinks(highlightLinks);
  };

  const handleNodeHover = node => {
    highlightNodes.clear();
    highlightLinks.clear();
    if (node) {
      highlightNodes.add(node.id);
      if (node.neighbors) {
        node.neighbors.forEach(neighbor => highlightNodes.add(neighbor));
      }
      if (node.links) {
        node.links.forEach(link => highlightLinks.add(link));
      }
    }

    setHoverNode(get(node, "id", null));
    updateHighlight();
  };

  const handleLinkHover = link => {
    highlightNodes.clear();
    highlightLinks.clear();

    if (link) {
      highlightLinks.add(link);
      highlightNodes.add(link.source);
      highlightNodes.add(link.target);
    }

    updateHighlight();
  };

  const paintRing = useCallback(
    ({ img, x, y, id, neighbors = [] }, ctx) => {
      let size = 12;

      if (hoverNode) {
        size = size * 3;
        if (id === hoverNode) {
          ctx.strokeStyle = "red";
          ctx.beginPath();
          ctx.strokeRect(x - size / 2, y - size / 2, size, size);
          ctx.drawImage(img, x - size / 2, y - size / 2, size, size);
        } else if (
          nodesByName[hoverNode].neighbors &&
          nodesByName[hoverNode].neighbors.includes(id)
        ) {
          ctx.strokeStyle = "red";
          ctx.beginPath();
          ctx.strokeRect(x - size / 2, y - size / 2, size, size);
          ctx.drawImage(img, x - size / 2, y - size / 2, size, size);
        }
      } else {
        ctx.drawImage(img, x - size / 2, y - size / 2, size, size);
      }
    },
    [hoverNode]
  );

  const nodePointerAreaPaint = (node, color, ctx) => {
    const size = 12;
    ctx.fillStyle = color;
    ctx.fillRect(node.x - size / 2, node.y - size / 2, size, size); // draw square as pointer trap
  };
  return (
    <>
      <ForceGraph2D
        graphData={graphData}
        nodeLabel="id"
        linkWidth={link => (highlightLinks.has(link) ? 5 : 1)}
        linkDirectionalParticles={4}
        linkDirectionalParticleWidth={link =>
          highlightLinks.has(link) ? 4 : 0
        }
        nodeCanvasObject={paintRing}
        nodePointerAreaPaint={nodePointerAreaPaint}
        onNodeHover={handleNodeHover}
      />
    </>
  );
};

export default Graph;
