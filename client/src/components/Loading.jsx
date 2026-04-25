const Loading = () => {
  return (
   <div className="flex justify-center h-screen items-center" role="status" aria-live="polite">
       <div className='animate-spin size-8 border-2 
       border-indigo-600 border-t-transparent rounded-full' aria-hidden="true"/>
      <span className="sr-only">Loading dashboard data...</span>
     </div>
  )
}

export default Loading
