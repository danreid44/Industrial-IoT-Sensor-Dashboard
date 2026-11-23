import './App.css';
import Dashboard from "./Dashboard";



function App() {
  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 flex flex-col items-center justify-center gap-6">
      <Dashboard motorName="Motor 01" />
    </div>
  );
}

export default App;