import SidePanel from "../components/SidePanel";
import TodoApp from "../components/TodoApp/TodoApp";
import logo2 from '/whitelogo.png';

const ToDoListPage = () => {
  const sidePanelStyle = {
    position: 'fixed',
    left: -10,
    top: '200px',
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      {/* Header */}
      <div className="fixed top-0 left-0 w-full bg-blue-500 p-3 z-40 shadow-md">
        <div className="absolute top-3 left-4">
          <img
            src={logo2}
            alt="Logo"
            className="lg:w-[160px] w-[80px] md:w-[100px] h-auto"
          />
        </div>
        <div className="flex items-center justify-center">
          <h2 className="lg:text-[30px] text-[20px] font-bold text-white mr-2">
            Manage Your To-Do List
          </h2>
          <img src="/task.png" alt="Quiz" className="w-20 h-20 lg:w-24 lg:h-24" />
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 pt-40 pl-20 pb-8">
        {/* Side Panel */}
        <div style={sidePanelStyle}>
          <SidePanel />
        </div>

        {/* Main Todo App */}
        <div className="h-full min-h-[calc(100vh-200px)]">
          <TodoApp />
        </div>
      </div>
    </div>
  );
};

export default ToDoListPage;