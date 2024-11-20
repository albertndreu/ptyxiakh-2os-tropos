import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import FetchDocuments from './FetchDocument';
import TransactionForm from "./Transaction";
import Homepage from './Home';
import Header from './Header';
import Footer from './Footer';
import Login from './Login';
import ProtectedRoute from './components/ProtectedRoute';
import RequestDocument from './RequestDocument';
import ViewRequests from './ViewRequests';
import Notifications from './Notifications';
import StudentDocuments from './studentDocument';
import ValidateDocument from './ValidateDocument';


function App() {
  return (
    <Router>
      <div className="App">
        <Header/> 
        <div className="main-content">
          <Routes>
            <Route path="/" element={<Homepage/>} />
            <Route path="/TransactionForm" element={
              <ProtectedRoute allowedRoles={["organization"]} allowedUsers={["Grammateia", "Prutaneia"]}>
                <TransactionForm/>
              </ProtectedRoute>
            } />
            <Route path="/Documents" element={
              <ProtectedRoute allowedRoles={["organization"]} allowedUsers={["Grammateia", "Prutaneia"]}>
                <FetchDocuments/>
              </ProtectedRoute>
            } />
            <Route path="/RequestDocument" element={
              <ProtectedRoute allowedRoles={["student"]}>
                <RequestDocument/>
              </ProtectedRoute>
            } />
            <Route path="/ValidateDocument" element={
              <ProtectedRoute allowedRoles={["student"]}>
                <ValidateDocument/>
              </ProtectedRoute>
            } />
            
            <Route path="/Login" element={<Login/>}/>
            <Route path="/ViewRequests" element={
              <ProtectedRoute allowedRoles={["organization"]} allowedUsers={["Grammateia", "Prutaneia"]}>
                <ViewRequests/>
              </ProtectedRoute>
            } />
            <Route path="/notifications" element={<Notifications />} />
            <Route path="/student-documents" element={<StudentDocuments />} />
          </Routes>
        </div>
        <Footer/>
      </div>
    </Router>
  );
}

export default App;
