import { BrowserRouter as Router } from 'react-router-dom';
import Header from './components/common/Header';
import Footer from './components/common/Footer';
import DieuHuongURL from './Router';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function App() {
  return (
    <>
      <Router>
          <Header />
          <DieuHuongURL />
          <Footer />
        <ToastContainer />
      </Router>
    </>
  );
}

export default App;
