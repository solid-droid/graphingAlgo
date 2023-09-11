let edges = [
    { from: 'n1', to: 'n3'},
    { from: 'n1', to: 'n5'},
    { from: 'n2', to: 'n3'},
    { from: 'n3', to: 'n2'},
    { from: 'n3', to: 'n4'},
    { from: 'n4', to: 'n5'},
    { from: 'n5', to: 'n6'},
];


let nodes = [
    {id: 'n1', label: 'n1'},
    {id: 'n2', label: 'n2'},
    {id: 'n3', label: 'n3'},
    {id: 'n4', label: 'n4'},
    {id: 'n5', label: 'n5'},
    {id: 'n6', label: 'n6'},
]

function getTenantEdgeCounts(edges){
    let tenantEdgeCount = {};
    let tenantEdgeList = [];
    edges.forEach(e => {
        tenantEdgeCount[e.from] ??= new Set();
        tenantEdgeCount[e.to] ??= new Set();

        tenantEdgeCount[e.to].add(e.from);
        tenantEdgeCount[e.from].add(e.to);
    });
    Object.keys(tenantEdgeCount).forEach(x => {
        tenantEdgeList.push({id:x, nodes:[...tenantEdgeCount[x]]});
    })
    tenantEdgeList = tenantEdgeList.sort((a,b)=> b.nodes.length - a.nodes.length);
    return tenantEdgeList;
}

function generateCords(edgeCount){
    let coords = [];
    let currCord = [0,0]
    let countLimit = Math.ceil(edgeCount/2) * 2;
    for(let i =0; i< countLimit; ++i){
        const y = currCord[0] == -1 ? currCord[1]+2 : currCord[1];
        const x = currCord[0] == 0 ||  currCord[0] == -1 ? 1 : -1;
        currCord = [x,y];
        coords.push(currCord);
    }

    return coords;

}

function generateGraph(node, graph, coordsReserve, nodeMap){
    const id = node.id
    const edgeCount = node.nodes.length;
    const yOffset = Math.floor((edgeCount-1)/2);
    const coords = generateCords(edgeCount);
    let nodeKey =null;
    if(!graph[id]){
        //not added in the graph yet
        graph[id] = {node, x:coordsReserve.maxX,y:yOffset};
        nodeKey = coordsReserve.maxX + '_' +yOffset;
        coordsReserve.loc[nodeKey] ??= id;
        coordsReserve.maxX+=1;
    } else if(!graph[id].node){
        //already added as a linked node
        graph[id].node = node;
    }

    let sortedNodes = node.nodes.sort((a,b) => nodeMap[a].nodes.length - nodeMap[b].nodes.length);
    sortedNodes = node.nodes.sort((a,b) => graph[a] ? 1 : -1);
    sortedNodes.forEach((nd,i) => {
        if(!graph[nd]){
            //if new connection add the node in available coords.
            graph[nd] = {};
            for(let d =0; d< coords.length; ++d){
                let x = coords[d][0];
                let y = coords[d][1];
                let yOffset_pos = coords[d][1] + 1
                let yOffset_neg = coords[d][1] - 1
                x = graph[id].x + x;
                /////////-- if same line check--///
                const ySet = new Set();
                const connections = nodeMap[nd].nodes.length;
                if(connections > 1){
                    nodeMap[nd].nodes.forEach(_node => {
                        if(graph[_node]){
                            ySet.add(graph[_node].y);
                        }
                    });
                    const sameY = ySet.size !== connections && ySet.has(y);
                    if(sameY){
                        y -= 1;
                    }
                }
                /////////////////////////////////
                const curren = coordsReserve.loc[x+'_'+y];
                const curren_pos = coordsReserve.loc[x+'_'+yOffset_pos]
                const curren_neg = coordsReserve.loc[x+'_'+yOffset_neg]
                if(!curren && !curren_pos && !curren_neg){
                    graph[nd].x = x ;
                    graph[nd].y = y ;
                    coordsReserve.maxX = x == coordsReserve.maxX ? x+1 : coordsReserve.maxX;
                    coordsReserve.loc[x+'_'+y] = nd;
                    break;
                }
            }
        }
    })
    return node.nodes;
    
}

function generateCyclicGraph(node, graph, coordsReserve, index){
    const id = node.id;
    let y = coordsReserve.minY;
    let x = coordsReserve.maxX ;
    const x_pos = coordsReserve.maxX;
    const x_neg = -x_pos; 
    if(index == 0){
        //1 root level
        coordsReserve.maxX+=1;   
        coordsReserve.minY+=1;
    } else if(!graph[id]) {
        // all other case
        if(!coordsReserve.loc[x_pos+'_'+y]){
            x = x_pos;
        } else {
            x = x_neg;
            coordsReserve.maxX+=1;
            coordsReserve.minY+=1; 
        }
    }

    coordsReserve.loc[x+'_'+y] = id;
    graph[id] = {...node, x,y};   
}

function checkIfCyclic(tenantEdgeList){
    let counter = new Set();
    if(tenantEdgeList.length > 2){
        tenantEdgeList.forEach(x => counter.add(x.nodes.length));
        return counter.size == 1 ? true : false;
    }
    return false;
}

function createCyclicOrder(tenantEdgeList){
    let nodeMap = {}, finalList = [] , record = new Set() , counter = 0;
    tenantEdgeList.forEach(x => {
        nodeMap[x.id] = x;
        record.add(x.id);
        x.nodes.forEach(y =>  record.add(y))
    });
    finalList = [...record].map(x => nodeMap[x]);
    return finalList;
}

function generateParentPositions(edges){
    let tenantEdgeList = getTenantEdgeCounts(edges);
    let graph = {};
    let coordsReserve = {};
    const cyclic = checkIfCyclic(tenantEdgeList);
    if(cyclic){
        coordsReserve = {minY: 0 , maxX: 0 , loc: {} , index:0}
        let list = createCyclicOrder(tenantEdgeList, graph, coordsReserve)
        list.forEach(node => {
            generateCyclicGraph(node, graph, coordsReserve, coordsReserve.index);
            coordsReserve.index++;
        });
    } else {
        const nodeMap = {};
        tenantEdgeList.forEach(x => nodeMap[x.id] = x);
        coordsReserve = {maxX: 0, loc: {}}
        tenantEdgeList.forEach((node,i) => {
            generateGraph(node, graph, coordsReserve, nodeMap)
        });
    }
    console.log(graph);
    return graph;
}

graph = generateParentPositions(edges);
nodes = nodes.map(node => ({...node, x:graph[node.id].x*170, y: graph[node.id].y*100}))
console.log(nodes);
beginVizJs(nodes, edges)