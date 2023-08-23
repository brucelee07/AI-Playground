import {
  MouseEvent,
  TouchEvent,
  DragEvent,
  useCallback,
  useRef,
  useState,
  // useEffect,
} from 'react'
import {
  Background,
  Connection,
  Edge,
  Node,
  ReactFlow,
  addEdge,
  getConnectedEdges,
  getIncomers,
  getOutgoers,
  useEdgesState,
  useNodesState,
  updateEdge,
  MarkerType,
  ReactFlowProvider,
  Controls,
  MiniMap,
  useReactFlow,
} from 'reactflow'
import 'reactflow/dist/style.css'
import { CiBezier } from 'react-icons/ci'

import CustomNode, { NodeData } from './CustomNode'
import FunctionIcon from './FunctionIcon'
import Sidebar from './Sidebar'

const nodeTypes = {
  turbo: CustomNode,
}

const defaultEdgeOptions = {
  style: { strokeWidth: 1.5, stroke: 'lightgray' },
  animated: true,
  markerEnd: {
    type: MarkerType.ArrowClosed,
    color: 'lightgray',
  },
}

const initialNodes: Node<NodeData>[] = [
  {
    id: '1',
    type: 'turbo',
    data: { icon: <FunctionIcon />, title: 'readFile', subline: 'api.ts' },
    position: { x: -150, y: 0 },
  },
  {
    id: '2',
    type: 'turbo',
    data: { icon: <FunctionIcon />, title: 'bundle', subline: 'apiContent.ts' },
    position: { x: 150, y: 0 },
  },
  {
    id: '3',
    type: 'turbo',
    data: { icon: <CiBezier />, title: 'End here!' },
    position: { x: 0, y: 300 },
  },
]

let id = 0
const getID = () => `c_${id++}`

export default function Flow() {
  const flowCanvas = useRef(null)
  const edgeUpdateSuccessful = useRef(true)
  const [reactFlowInstance, setReactFlowInstance] = useState(null)

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes)
  const [edges, setEdges, onEdgesChange] = useEdgesState([])

  const [title, setTitle] = useState<string>('')
  const [subline, setSubline] = useState<string>('')

  const { setViewport } = useReactFlow()

  const onSave = useCallback(() => {
    if (reactFlowInstance) {
      const flow = reactFlowInstance.toObject()
      console.log(flow)
    }
  }, [reactFlowInstance])

  const onRestore = useCallback(() => {
    const restoreFlow = async () => {
      // const flow = JSON.parse(localStorage.getItem(flowKey));
      const flow = {
        viewport: { x: 0, y: 0, zoom: 1 },
        nodes: [],
        edges: [],
      }

      if (flow) {
        const { x = 0, y = 0, zoom = 1 } = flow.viewport
        setNodes(flow.nodes || [])
        setEdges(flow.edges || [])
        setViewport({ x, y, zoom })
      }
    }

    restoreFlow()
  }, [setNodes, setEdges, setViewport])

  const onConnect = useCallback(
    (params: Connection) => setEdges((eds) => addEdge(params, eds)),
    [setEdges],
  )
  const onEdgeUpdateStart = useCallback(() => {
    edgeUpdateSuccessful.current = false
  }, [])

  const onEdgeUpdate = useCallback(
    (oldEdge: Edge, newConnection: Connection) => {
      edgeUpdateSuccessful.current = true
      setEdges((els) => updateEdge(oldEdge, newConnection, els))
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  )

  const onEdgeUpdateEnd = useCallback(
    (_: MouseEvent | TouchEvent, edge: Edge) => {
      if (!edgeUpdateSuccessful.current) {
        setEdges((eds) => eds.filter((e) => e.id !== edge.id))
      }
      edgeUpdateSuccessful.current = true
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  )
  const onNodesDelete = useCallback(
    (deleted: Node[]) => {
      setTitle('')
      setSubline('')
      setEdges(
        deleted.reduce((acc, node) => {
          const incomers = getIncomers(node, nodes, edges)
          const outgoers = getOutgoers(node, nodes, edges)
          const connectedEdges = getConnectedEdges([node], edges)

          const remainingEdges = acc.filter(
            (edge) => !connectedEdges.includes(edge),
          )

          const createdEdges = incomers.flatMap(({ id: source }) =>
            outgoers.map(({ id: target }) => ({
              id: `${source}->${target}`,
              source,
              target,
            })),
          )

          return [...remainingEdges, ...createdEdges]
        }, edges),
      )
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [nodes, edges],
  )
  const onDrop = useCallback(
    (event: DragEvent, title: string) => {
      if (event.clientX < 200) return

      event.dataTransfer.effectAllowed = 'none'
      const type = event.dataTransfer!.getData('application/reactflow')
      if (typeof type === 'undefined' || !type) {
        return
      }
      // eslint-disable-next-line
      // @ts-ignore
      const reactFlowBounds = flowCanvas.current.getBoundingClientRect()
      // eslint-disable-next-line
      // @ts-ignore
      const position = reactFlowInstance.project({
        x: event.clientX - reactFlowBounds.left,
        y: event.clientY - reactFlowBounds.top,
      })

      const newNode = {
        id: getID().toString(),
        type: 'turbo',
        position,
        data: { title: title, type: title },
      }
      setNodes((nodes) => nodes.concat(newNode))
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [reactFlowInstance],
  )

  const onDragOver = useCallback((event: DragEvent) => {
    event.preventDefault()
    event.dataTransfer.dropEffect = 'move'
  }, [])

  const proOptions = { hideAttribution: true }

  // const onNodeClick = (_: MouseEvent, node: Node) => {
  //   setNodes((nodes) =>
  //     nodes.map((_node) => {
  //       if (_node.id === node.id) {
  //         console.log(_node.style)
  //         _node.style = {
  //           ..._node.style,
  //           border: '2px solid blue',
  //           borderRadius: '10px',
  //         }
  //       } else {
  //         _node.style = undefined
  //       }
  //       return _node
  //     }),
  //   )
  // }

  const onSelection = () => {
    setTitle('')
    setSubline('')
    // show focus when select node
    setNodes((nodes) =>
      nodes.map((_node) => {
        if (_node.selected) {
          setTitle(_node.data.title)
          if (_node.data.subline) setSubline(_node.data.subline)
          _node.style = {
            ..._node.style,
            border: '2px solid blue',
            borderRadius: '10px',
          }
        } else {
          _node.style = undefined
        }
        return _node
      }),
    )

    // show focus when select edge
    setEdges((edges) =>
      edges.map((edge) => {
        edge.style = { strokeWidth: 1.5, stroke: 'lightgray' }
        if (edge.selected) {
          edge.style = { strokeWidth: 1.5, stroke: 'red' }
        }
        return edge
      }),
    )
  }

  const UpdateNode = () => {
    if (title === '') return
    setNodes((nodes) =>
      nodes.map((node) => {
        if (node.selected) {
          node.data.title = title
          node.data.subline = subline
          node.selected = false
        }
        return node
      }),
    )
    setTitle('')
    setSubline('')
  }

  return (
    <div className='w-full'>
      <ReactFlowProvider>
        <div className='flex flex-row'>
          <div className='flex flex-col w-64 items-center bg-blue-50 pt-7'>
            <Sidebar onDrop={onDrop} />
          </div>
          <div className='w-full h-screen'>
            <ReactFlow
              ref={flowCanvas}
              nodes={nodes}
              edges={edges}
              onNodesDelete={onNodesDelete}
              onNodesChange={onNodesChange}
              proOptions={proOptions}
              nodeTypes={nodeTypes}
              onEdgesChange={onEdgesChange}
              onEdgeUpdate={onEdgeUpdate}
              onEdgeUpdateStart={onEdgeUpdateStart}
              // eslint-disable-next-line
              // @ts-ignore
              onEdgeUpdateEnd={onEdgeUpdateEnd}
              defaultEdgeOptions={defaultEdgeOptions}
              // eslint-disable-next-line
              // @ts-ignore
              onInit={setReactFlowInstance}
              onConnect={onConnect}
              onDragOver={onDragOver}
              // onNodeClick={onNodeClick}
              onClick={onSelection}
              // eslint-disable-next-line
              // @ts-ignore
              onInit={setReactFlowInstance}
              fitView
              className='bg-white'
            >
              <Controls />
              <MiniMap />
              <Background gap={12} size={1} />
              {title && (
                <div className='absolute top-10 right-10 z-10 flex flex-col text-gray-500 w-48'>
                  <div className='flex flex-row items-center'>
                    <label>标题:</label>
                    <input
                      className='ml-5 w-32 px-1 border-2 rounded-md'
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                    />
                  </div>
                  <div className='flex flex-row mt-2 items-center'>
                    <label>副标题:</label>
                    <input
                      className='ml-1 w-32 px-1 border-2 rounded-md'
                      value={subline}
                      onChange={(e) => setSubline(e.target.value)}
                    />
                  </div>
                  <button
                    className='mt-2 w-48 bg-blue-500 text-white p-1 rounded-md hover:bg-blue-400 active:bg-blue-200'
                    onClick={UpdateNode}
                  >
                    确定修改
                  </button>
                </div>
              )}
            </ReactFlow>
          </div>
        </div>
      </ReactFlowProvider>
    </div>
  )
}
