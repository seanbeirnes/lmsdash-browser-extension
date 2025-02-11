function RadialProgress({text}) {
 return (
   <div className="w-full max-w-80 bg-white shadow-sm text-gray-700 flex items-center justify-center p-4 rounded-full">
     <p className="flex-auto text-lg text-center">{text}</p>
     <svg className="text-blue-600 animate-spin w-8 h-8" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
       <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
       <path className="opacity-75" fill="currentColor"
             d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
     </svg>
   </div>
 )
}

export default RadialProgress