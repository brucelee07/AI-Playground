import { DragEvent, FC } from 'react'

interface Props {
  onDrop: (event: DragEvent, title: string) => void
}

const Sidebar: FC<Props> = ({ onDrop }) => {
  const onDragStart = (event: DragEvent, nodeType: string) => {
    event.dataTransfer.setData('application/reactflow', nodeType)
    event.dataTransfer.effectAllowed = 'move'
  }

  return (
    <aside className='text-gray-500 flex flex-col h-full justify-between'>
      <div>
        <h2 className='text-2xl text-blue-800 font-extrabold py-7 border-b-2 border-blue-200 mb-5 w-full'>
          AI 模型学习
        </h2>
        <h4 className='my-2'>AI 模块</h4>
        <div
          className='border-blue-500 border-2 p-2 mb-2 w-32 rounded-md hover:cursor-move hover:bg-blue-200'
          onDragStart={(event) => onDragStart(event, 'input')}
          onDragEnd={(event) => onDrop(event, 'input')}
          draggable
        >
          输入模块
        </div>
        <div
          className='border-blue-500 border-2 p-2 mb-2 w-32 rounded-md hover:cursor-move hover:bg-blue-200'
          onDragStart={(event) => onDragStart(event, 'default')}
          onDragEnd={(event) => onDrop(event, 'default')}
          draggable
        >
          神经元模块
        </div>
        <div
          className='border-blue-500 border-2 p-2 w-32 rounded-md hover:cursor-move hover:bg-blue-200'
          onDragStart={(event) => onDragStart(event, 'output')}
          onDragEnd={(event) => onDrop(event, 'output')}
          draggable
        >
          输出模块
        </div>
        <h4 className='my-5 border-t-2 border-gray-300 py-3'>常见模型示例</h4>
        <ul>
          <li>示例一</li>
          <li>示例二</li>
        </ul>
      </div>
      <div className='flex flex-col'>
        <button className='w-full mx-auto bg-green-800 text-white mb-2 p-2 rounded-md'>
          保存模型
        </button>
        <button className='w-full mx-auto bg-green-800 text-white mb-2 p-2 rounded-md'>
          导入模型
        </button>
        <button className='w-full mx-auto bg-green-800 text-white mb-2 p-2 rounded-md'>
          检查模型
        </button>
      </div>
    </aside>
  )
}

export default Sidebar
