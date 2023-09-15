let rawNodes = [
    {
        id: 'n1',
        children: [
            {
                id: 'n11',  
                children:[
                   {
                    id: 'n111', 
                   } ,
                   {
                    id: 'n112'
                   },
                   {
                    id: 'n113', 
                   } ,
                   {
                    id: 'n114'
                   },
                   {
                    id: 'n115'
                   },
                ]
            },
            {
                id: 'n12',
                children:[
                    {
                     id: 'n121', 
                    } ,
                    {
                     id: 'n122'
                    },
                    {
                     id: 'n123', 
                    } ,
                    {
                     id: 'n124'
                    },
                 ]
            },
            {
                id: 'n13',
                children:[
                    {
                     id: 'n131', 
                    } ,
                    {
                     id: 'n132'
                    },
                    {
                     id: 'n133', 
                    } ,
                    {
                     id: 'n134'
                    },
                 ]
            },            
            {
                id: 'n14',
                children:[
                    {
                     id: 'n141', 
                    } ,
                    {
                     id: 'n142'
                    },
                    {
                     id: 'n143', 
                    } ,
                    {
                     id: 'n144'
                    },
                 ]
            }
        ]
    },
    {
        id: 'n2',
        children: [
            {
                id: 'n21',
                children:[
                    {
                     id: 'n211', 
                    } ,
                    {
                     id: 'n212'
                    },
                    {
                     id: 'n213', 
                    } ,
                    {
                     id: 'n214'
                    },
                 ]
            },
            {
                id: 'n22',
                children:[
                    {
                     id: 'n221', 
                    } ,
                    {
                     id: 'n222'
                    },
                    {
                     id: 'n223', 
                    } ,
                    {
                     id: 'n224'
                    },
                 ]
            },
            {
                id: 'n23',
                children:[
                    {
                     id: 'n231', 
                    } ,
                    {
                     id: 'n232'
                    },
                    {
                     id: 'n233', 
                    } ,
                    {
                     id: 'n234'
                    },
                 ]
            },            
            {
                id: 'n24',
                children:[
                    {
                     id: 'n241', 
                    } ,
                    {
                     id: 'n242'
                    },
                    {
                     id: 'n243', 
                    } ,
                    {
                     id: 'n244'
                    },
                 ]
            }
        ]
    },
    {
        id: 'n3',
        children: [
            {
                id: 'n31',
                children:[
                    {
                     id: 'n311', 
                    } ,
                    {
                     id: 'n312'
                    },
                    {
                     id: 'n313', 
                    } ,
                    {
                     id: 'n314'
                    },
                 ]
            },
            {
                id: 'n32',
                children:[
                    {
                     id: 'n321', 
                    } ,
                    {
                     id: 'n322'
                    },
                    {
                     id: 'n323', 
                    } ,
                    {
                     id: 'n324'
                    },
                 ]
            },
            {
                id: 'n33',
                children:[
                    {
                     id: 'n331', 
                    } ,
                    {
                     id: 'n332'
                    },
                    {
                     id: 'n333', 
                    } ,
                    {
                     id: 'n334'
                    },
                 ]
            },            
            {
                id: 'n34',
                children:[
                    {
                     id: 'n341', 
                    } ,
                    {
                     id: 'n342'
                    },
                    {
                     id: 'n343', 
                    } ,
                    {
                     id: 'n344'
                    },
                 ]
            }
        ]
    },
    {
        id: 'n4',
        children: [
            {
                id: 'n41',
                children:[
                    {
                     id: 'n411', 
                    } ,
                    {
                     id: 'n412'
                    },
                    {
                     id: 'n413', 
                    } ,
                    {
                     id: 'n414'
                    },
                 ]
            },
            {
                id: 'n42',
                children:[
                    {
                     id: 'n421', 
                    } ,
                    {
                     id: 'n422'
                    },
                    {
                     id: 'n423', 
                    } ,
                    {
                     id: 'n424'
                    },
                 ]
            },
            {
                id: 'n43',
                children:[
                    {
                     id: 'n431', 
                    } ,
                    {
                     id: 'n432'
                    },
                    {
                     id: 'n433', 
                    } ,
                    {
                     id: 'n434'
                    },
                 ]
            },            
            {
                id: 'n44',
                children:[
                    {
                     id: 'n441', 
                    } ,
                    {
                     id: 'n442'
                    },
                    {
                     id: 'n443', 
                    } ,
                    {
                     id: 'n444'
                    },
                 ]
            }
        ]
    }
]

let rawEdges = [
    // {from:'n111', to:'n212'},
    // {from:'n12'}
]


let edges = [
    { from: 'n1', to: 'n2'},
    { from: 'n2', to: 'n4'},
    { from: 'n3', to: 'n4'},
    { from: 'n5', to: 'n4'},
    { from: 'n6', to: 'n4'},
    { from: 'n3', to: 'n5'},
    { from: 'n1', to: 'n5'},
    { from: 'n1', to: 'n4'},
];


let nodes = [
{id: 'n1', label: 'n1' , width: 100, height: 100},
{id: 'n2', label: 'n2', width: 100, height: 100},
{id: 'n3', label: 'n3', width: 100, height: 100},
{id: 'n4', label: 'n4', width: 100, height: 100},
{id: 'n5', label: 'n5', width: 100, height: 100},
{id: 'n6', label: 'n6', width: 100, height: 100},
]