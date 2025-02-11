function Header({animated = false, children}) {
  return (
    <div className="fixed top-0 grid grid-cols-6 pl-4 pr-6 py-2 bg-white shadow-sm w-screen h-16">
      <div className="w-full flex justify-start items-center">{children}</div>
      <div className={`flex col-span-4 items-center justify-center ${animated && "animate__animated animate__fadeIn animate__faster"}`}>
        <img className="max-h-12" src="/img/icon-color.svg" alt="LMS Dash logo" /> <h1 className="text-blue-600 font-bold text-2xl">LMS Dash</h1>
      </div>
      <div></div>
    </div>
  )
}
export default Header