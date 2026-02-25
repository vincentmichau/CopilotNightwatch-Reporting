import React from 'react';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import NotFound from './pages/NotFound';
import Login from './components/Login';
import AdminPanel from './components/AdminPanel';
import Chat from './components/Chat';
import History from './components/History';
import Planning from './components/Planning';
import ReportForm from './components/ReportForm';
import ConfirmEmail from './pages/ConfirmEmail';
import './App.css';

function App() {
  return (
    <Router>
      <div className="App">
        <Switch>
          <Route path="/" exact component={Dashboard} />
          <Route path="/login" component={Login} />
          <Route path="/admin" component={AdminPanel} />
          <Route path="/chat" component={Chat} />
          <Route path="/history" component={History} />
          <Route path="/planning" component={Planning} />
          <Route path="/report" component={ReportForm} />
          <Route path="/confirm" component={ConfirmEmail} />
          <Route component={NotFound} />
        </Switch>
      </div>
    </Router>
  );
}

export default App;