// let edges = [
//     { from: 'n111', to: 'n212' },
//     { from: 'n121', to: 'n221'},
//     // { from: 'n114', to: 'n313'},
//     { from: 'n222', to: 'n321'}
// ];


let tenantTracker = {}
const storeGap = 80;
const tenantGap = 400;
const nodeVGap = 50;
const nodeHGap = 170;

function createBaseLayout(rawNodes){
    let nodeList = [];
    function getNodeLocation(tree, indexList =[]){
        tree.forEach((x,index)=>{
            if(x.children){
                getNodeLocation(x.children, [...indexList, index])
            } else{
                const tenantPos = indexList[0];
                tenantTracker[indexList[0]] ??= {nodeCount:0, storeCount:0};
                const posX = tenantPos * tenantGap;
                tenantTracker[indexList[0]].storeCount += (index ? 0 : 1);
                let datastoreGap = tenantTracker[indexList[0]].storeCount * storeGap;
                const posY = (++tenantTracker[indexList[0]].nodeCount * nodeVGap) + datastoreGap;
                nodeList.push({
                    id:x.id, 
                    label: x.id, 
                    x: posX, 
                    y: posY , 
                    tenant:indexList[0]+1, 
                    store:indexList[1]+1
                })
            }
        })
    }
    getNodeLocation(rawNodes);
    return nodeList;
}


function createEdgeMap(edges){
    let edgeMap = {};
    edges.forEach(x => {
        edgeMap[x.from] ??= [];
        edgeMap[x.to] ??= [];

        edgeMap[x.from].push({node: x.to, dir: 'to'})
        edgeMap[x.to].push({node: x.from, dir: 'from'})
    })
    return edgeMap;
}


function create2layerForDataNodes(nodes){
    let filterMap = {};
    nodes.forEach(x => {
        filterMap[x.tenant+'_'+x.store] ??=[];
        filterMap[x.tenant+'_'+x.store].push(x);
    })
    Object.values(filterMap).forEach(set => {
        set.forEach((node,i) => {
            node.x += (i%2) * nodeHGap
            node.localXPos = (i%2);
            node.localYPos = Math.floor(i/2);
            if(i%2){
                node.y -= nodeVGap;
            }
        })
    })
    return nodes;
}

function createEdgeList(edges, nodeMap){
    let edgeList = [];
    edges.forEach(x => {
        edgeList.push({...x ,details: {
            from : nodeMap[x.from],
            to : nodeMap[x.to]
        }})
    });
    return edgeList;
}

function createNodeMap(nodes){
    let nodeMap = {}
    nodes.forEach(x => nodeMap[x.id] = x)
    return nodeMap;
}

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

function getTenantNodesAndEdges(nodeTree, edges){
    let tenantNodes = [];
    let tenantEdges = []
    nodeTree.forEach(node =>{
        tenantNodes.push({label:node.id,  width: 200, height: 800});
        let toDict = {};
        edges.forEach(edge => {
            const toTenant = edge.to.slice(0,2);
            if(edge.from.includes(node.id) && !toDict[toTenant]){
                toDict[toTenant] = true;
                tenantEdges.push({from:node.id, to: edge.to.slice(0,2)});
            }
                
        });

    })
    return {tenantNodes, tenantEdges}
}

function getTenantWeight(edges){
    let tenantWeight = {};
    edges.forEach(x => {
        
        //from
        tenantWeight[x.details.from.tenant] ??= {};
        if(tenantWeight[x.details.from.tenant][x.details.from.store]){
            tenantWeight[x.details.from.tenant][x.details.from.store].edges += 1;
            tenantWeight[x.details.from.tenant][x.details.from.store].tenants.add(x.details.to.tenant);
            tenantWeight[x.details.from.tenant][x.details.from.store].tenant_store.add(x.details.to.tenant +'_'+ x.details.to.store);
        } else {
            tenantWeight[x.details.from.tenant][x.details.from.store] = {};
            tenantWeight[x.details.from.tenant][x.details.from.store].edges = 1; 
            tenantWeight[x.details.from.tenant][x.details.from.store].tenants = new Set([x.details.to.tenant]);
            tenantWeight[x.details.from.tenant][x.details.from.store].tenant_store = new Set([x.details.to.tenant +'_'+ x.details.to.store]);
        }

        //to
        tenantWeight[x.details.to.tenant] ??= {};
        if(tenantWeight[x.details.to.tenant][x.details.to.store]){
            tenantWeight[x.details.to.tenant][x.details.to.store].edges  += 1;
            tenantWeight[x.details.to.tenant][x.details.to.store].tenants.add(x.details.from.tenant);
            tenantWeight[x.details.to.tenant][x.details.to.store].tenant_store.add(x.details.from.tenant +'_'+ x.details.from.store); 
        } else {
            tenantWeight[x.details.to.tenant][x.details.to.store] = {};
            tenantWeight[x.details.to.tenant][x.details.to.store].edges  = 1; 
            tenantWeight[x.details.to.tenant][x.details.to.store].tenants = new Set([x.details.from.tenant]);
            tenantWeight[x.details.to.tenant][x.details.to.store].tenant_store = new Set([x.details.from.tenant +'_'+ x.details.from.store]);
        }
    });

    return tenantWeight;
}

function getConfigCords(tenantWeight){
    function getCounts(tenantWeight){
        let T_T = {};
        let totalUniqueCount = 0;

        Object.keys(tenantWeight).forEach(x => {
            T_T[x] = []; 
            Object.values(tenantWeight[x]).forEach(y =>{
                T_T[x].push(...y.tenants)
            });
            T_T[x] = new Set(T_T[x]);
            totalUniqueCount += T_T[x].size;
        });

        return {totalUniqueCount:  totalUniqueCount/2, T_T};
    }
    
    function _3tenantConfig(totalUniqueCount , T_T){
       switch(totalUniqueCount){
        case 3: return [{x:0,y:0,tenant:1},{x:1,y:1, tenant:2},{x:2,y:0, tenant:3}]
        case 2: {
            const midTenant = Object.values(T_T).findIndex(x => x.size == 2);
            let i=1, output = [];
            while(i < 4){
                if(i == midTenant ){
                    output[1] = {x:1, y:0, tenant:midTenant}
                } else if( i < 3 ) {
                    output[0] = {x:0, y:0, tenant:i}
                } else {
                    output[2] = {x:2, y:0, tenant:i}
                }
                i++;
            }
            return output;
        };
       }

    }

    const tenantCount = Object.keys(tenantWeight).length;
    const {totalUniqueCount , T_T} = getCounts(tenantWeight);
    switch(tenantCount){
        case 1 : return [];
        case 2 : return [];
        case 3 : return _3tenantConfig(totalUniqueCount , T_T);
        case 4 : return _4tenantConfig(tenantWeight, totalUniqueCount , T_T);
        case 5 : return _5tenantConfig(tenantWeight, totalUniqueCount , T_T);
    }
}


// let nodes =[];
// nodes = createBaseLayout(rawNodes);
// nodes = create2layerForDataNodes(nodes);
// nodeMap = createNodeMap(nodes); 
// edgeList = createEdgeList(edges, nodeMap)
// tenantWeight = getTenantWeight(edgeList);
// configCords = getConfigCords(tenantWeight);

// console.log(configCords);
// beginVizJs(nodes, edges)


// let edgeMap = createEdgeMap(edges);
// const {tenantNodes, tenantEdges} = getTenantNodesAndEdges(rawNodes, edges)
// nodes = createBaseLayout_withDagre(tenantNodes, tenantEdges);
