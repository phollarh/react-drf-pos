import Home from './pages/Home'
import {BrowserRouter, Route, Routes } from 'react-router-dom'
import Products from './pages/Products';
import AuthServiceProvider from './context/AuthContext';
import OutletNstaffContextProvider from "./context/OutletNStaffsContext";
import Sales from './pages/Sales';
import Categories from './pages/Categories';
import Measurements from './pages/Measurements';
import PastReceipt from './pages/PastReceipt';
import SalesByProduct from './pages/SalesByProduct';
import ToggleColorMode from './components/ToggleColorMode';
import ViewUpdateProfile from './pages/account/ViewUpdateProfile';
import Settings from './pages/Settings';
import SalesNReceipt from './pages/SalesNReceipt';
import LoginTemplate from './pages/LoginTemplate';
import ConfirmationTemplate from './pages/templates/ConfirmationTemplate';
import ForgotPasswordTemplate from './pages/templates/ForgotPasswordTemplate';
import { useEffect } from 'react';
import qz from "qz-tray";





function App() {

    useEffect(() => {

        async function connectPrinter() {

            if (!qz.websocket.isActive()) {
                await qz.websocket.connect();
                 console.log("QZ Connected");
            }

        }

        connectPrinter();

    }, []);

  return (
    
      <BrowserRouter>
      <AuthServiceProvider>
        <OutletNstaffContextProvider>
          <ToggleColorMode>
          <Routes>
            <Route path='/' element={<Home/>} />
            <Route path='/:products/' element={<Products/>} />
            <Route path='/create_receipt' element={<SalesNReceipt/>} />
            <Route path='/sales' element={<Sales/>} />
            <Route path='/sales_receipts' element={<SalesNReceipt/>} />
            <Route path='/login' element={<LoginTemplate/>} />
            <Route path='/email_confirmation' element={<ConfirmationTemplate/>} />
            <Route path='/forgot_password' element={<ForgotPasswordTemplate/>} />
            <Route path='/categories' element={<Categories/>} />
            <Route path='/measurements' element={<Measurements/>} />
            <Route path='/past_receipts' element={<PastReceipt/>} />
            <Route path='/sales_summary' element={<SalesByProduct/>} />
            <Route path='/profile' element={<ViewUpdateProfile/>} />
            <Route path='/settings' element={<Settings/>} />
          </Routes> 
        
        </ToggleColorMode>
        </OutletNstaffContextProvider>
        
      </AuthServiceProvider>
    </BrowserRouter>
   

    
     
  )
}

export default App
