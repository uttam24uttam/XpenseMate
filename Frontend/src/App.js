import './App.css';
import { BrowserRouter, Route, Routes, Navigate } from 'react-router-dom';
import Home from './pages/Home';
import Register from './pages/Register';
import Login from './pages/Login';
import ManageFriends from './pages/ManageFriends';
import ViewFriend from './pages/ViewFriend';

function App() {
  return (
    <div className="App">
      <BrowserRouter>
        <Routes>
          <Route path='/' element={<ProtectedRoute><Home /></ProtectedRoute>} />
          <Route path='/Login' element={<Login />} />
          <Route path='/Register' element={<Register />} />
          <Route path='/manage-friends' element={<ProtectedRoute><ManageFriends /></ProtectedRoute>} />
          <Route path='/friends/view/:friendId' element={<ProtectedRoute><ViewFriend /></ProtectedRoute>} />
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export function ProtectedRoute(props) {
  if (localStorage.getItem("User")) {
    return props.children;
  } else {
    return (<Navigate to="/login" />);
  }
}

export default App;



// I use React Router for navigation. Inside <Routes>, each <Route> maps a URL to a component. 
// For example, /login shows the Login component, /register shows the Register component,
//  and /friends/view/:friendId shows the ViewFriend component with a dynamic parameter. 
//  These page components are defined separately inside the pages/ folder. 
//  For sensitive pages like Home or Manage Friends, I wrapped them in a ProtectedRoute component, 
//  which checks localStorage for a user before allowing access, otherwise it redirects to the login page