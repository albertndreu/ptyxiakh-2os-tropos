import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import DocumentViewer from "./FetchDocument";
import TransactionForm from "./Transaction";
import OrderByDate from './OrderByDate';
import AlphabeticalOrder from './AplhabeticalOrder';
import Homepage from './Home';
import Header from './Header';
import Footer from './Footer';
import SearchDocument from './Verify';
import Login from './Login';
import ProtectedRoute from './components/ProtectedRoute';
import RequestDocument from './RequestDocument';
import ViewRequests from './ViewRequests';
import Notifications from './Notifications';
import StudentDocuments from './studentDocument';



function App() {
  return (
    <Router>
      <div className="App">
        <Header/> 
        <div className="main-content">
          <Routes>
            <Route path="/" element={<Homepage/>} />
            <Route path="/TransactionForm" element={
              <ProtectedRoute allowedRoles={["organization"]} allowedUsers={["org1", "org2"]}>
                <TransactionForm/>
              </ProtectedRoute>
            } />
            <Route path="/Documents" element={
              <ProtectedRoute allowedRoles={["organization"]} allowedUsers={["org1", "org2"]}>
                <DocumentViewer/>
              </ProtectedRoute>
            } />
            <Route path="/RequestDocument" element={
              <ProtectedRoute allowedRoles={["student"]}>
                <RequestDocument/>
              </ProtectedRoute>
            } />
            <Route path="/DocumentsByDate" element={<OrderByDate/>}/>
            <Route path="/DocumentsByAlphabeticalOrder" element={<AlphabeticalOrder/>}/>
            <Route path="/Verify" element={<SearchDocument/>}/>
            <Route path="/Login" element={<Login/>}/>
            <Route path="/ViewRequests" element={
              <ProtectedRoute allowedRoles={["organization"]} allowedUsers={["org1", "org2"]}>
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
