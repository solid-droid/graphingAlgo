function createBaseLayout_withDagre(nodes, edges){
    const g = new dagre.graphlib.Graph();
    const graphOptions = {
            rankdir: "LR", //Direction for rank nodes. Can be TB, BT, LR, or RL, where T = top, B = bottom, L = left, and R = right.
            align: undefined, //Alignment for rank nodes. Can be UL, UR, DL, or DR, where U = up, D = down, L = left, and R = right.
            nodesep: 60, //Number of pixels that separate nodes horizontally in the layout.
            edgesep: 20, //Number of pixels that separate edges horizontally in the layout.
            ranksep: 120, //Number of pixels between each rank in the layout.
            marginx: 0, //Number of pixels to use as a margin around the left and right of the graph.
            marginy: 0, //Number of pixels to use as a margin around the top and bottom of the graph.
            acyclicer: undefined, //If set to greedy, uses a greedy heuristic for finding a feedback arc set for a graph. A feedback arc set is a set of edges that can be removed to make a graph acyclic.
            ranker: 'network-simplex'//Type of algorithm to assigns a rank to each node in the input graph. Possible values: network-simplex, tight-tree or longest-path
        }
    g.setGraph(graphOptions);
    g.setDefaultEdgeLabel(function() { return {}; });

    nodes.forEach(x => g.setNode(x.label, x))
    edges.forEach(x => g.setEdge(x.from,   x.to))
    dagre.layout(g);
    return g.nodes().map(x => g.node(x));
}


nodes = createBaseLayout_withDagre(nodes, edges);
beginVizJs(nodes, edges)