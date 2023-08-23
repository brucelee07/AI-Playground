import { memo, ReactNode } from 'react'
import { Handle, NodeProps, Position } from 'reactflow'

export type NodeData = {
  title: string
  icon?: ReactNode
  subline?: string
  type?: string
  selected?: boolean
}

const CustomNode = memo(({ data }: NodeProps<NodeData>) => {
  const showType = (nodeType: string | undefined) => {
    if (nodeType === 'input') {
      return (
        <Handle
          className='bg-teal-500'
          type='source'
          position={Position.Bottom}
        />
      )
    } else if (nodeType === 'output') {
      return (
        <Handle className='bg-teal-500' type='target' position={Position.Top} />
      )
    } else {
      return (
        <>
          <Handle
            className='bg-teal-500'
            type='target'
            position={Position.Top}
          />
          <Handle
            className='bg-teal-500'
            type='source'
            position={Position.Bottom}
          />
        </>
      )
    }
  }

  return (
    <>
      <div
        className='bg-white p-2 rounded-xl w-32 h-18 border-2 hover:border-blue-300'
      >
        <div className='flex flex-row items-center'>
          {data.icon && <div>{data.icon}</div>}
          <div className='flex flex-col p-1'>
            <h3 className='text-lg text-gray-500'>{data.title}</h3>
            {data.subline && (
              <p className='text-xs text-gray-400'>{data.subline}</p>
            )}
          </div>
          {showType(data.type)}
        </div>
      </div>
    </>
  )
})

export default CustomNode
