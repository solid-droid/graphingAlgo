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
    sortedNodes = sortedNodes.sort((a,b) => graph[a] ? 1 : -1);
    sortedNodes.forEach((nd,i) => {
        if(!graph[nd]){
            //if new connection add the node in available coords.
            graph[nd] = {};
            for(let d of coords){
                let x = d[0];
                let y = d[1];
                let yOffset_pos = d[1] + 1
                let yOffset_neg = d[1] - 1
                x = graph[id].x + x;
                /////////-- if same line check--///
                const ySet = new Set();
                const xSet = new Set();
                const connections = nodeMap[nd].nodes.length;
                if(connections > 1){
                    nodeMap[nd].nodes.forEach(_node => {
                        if(graph[_node]){
                            ySet.add(graph[_node].y);
                            xSet.add(graph[_node].x);
                        }
                    });
                    const sameY = ySet.size !== connections && ySet.has(y);
                    let pos = false, neg = false;
                    [...xSet].forEach(_x => {
                        if(!pos)
                            pos = _x > x;

                        if(!neg)
                            neg = _x < x;
                    });
                    if(sameY && (pos && neg)){
                        y -= 1;
                    }
                } else {
                    //since 1 connection
                    const conn_node = nodeMap[nd].nodes[0];
                    y = graph[conn_node].node.nodes.length <= 2 ? graph[conn_node].y : y;
                }
                /////////////////////////////////
                const curren = coordsReserve.loc[x+'_'+y];
                const curren_pos = coordsReserve.loc[x+'_'+yOffset_pos]
                const curren_neg = coordsReserve.loc[x+'_'+yOffset_neg]
                if(!curren && !curren_pos && !curren_neg){
                    graph[nd].x = x ;
                    graph[nd].y = y ;
                    if(!graph[nd].opt)
                        graph[nd].opt = {id, fact: coords.length};
                    else if(graph[nd].opt.fact < coords.length) {
                        graph[nd].opt = {id, fact: coords.length};
                    }
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

function distanceFactor(x1,x2,y1,y2){
    return Math.abs(x1-x2) + Math.abs(y1-y2);
}
function fineTuneGraph(graph){
    //distance optimization
    const graphList = Object.values(graph);
    const optimizerList = {};
    graphList.forEach(x => {
        if(x.opt && x.opt.id !== x.id){
            optimizerList[x.opt.id] ??= [];
            optimizerList[x.opt.id].push(x);
        }
    })
    Object.values(optimizerList).forEach(list => {
        list.forEach(node => {
            let distFactor = 0;
            const x = node.x, y = node.y;
            node.node.nodes.forEach(nd => {
                const _x = graph[nd].x;
                const _y = graph[nd].y;
                distFactor += distanceFactor(x,_x,y,_y);
            });


        });
    });
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
        coordsReserve = {maxX: 0, loc: {}, optType:0}
        tenantEdgeList.forEach((node,i) => {
            generateGraph(node, graph, coordsReserve, nodeMap)
        });
        fineTuneGraph(graph);
    }
    return graph;
}

graph = generateParentPositions(edges);
nodes = nodes.map(node => ({...node, x:graph[node.id].x*170, y: graph[node.id].y*100}))
console.log(nodes);
beginVizJs(nodes, edges)